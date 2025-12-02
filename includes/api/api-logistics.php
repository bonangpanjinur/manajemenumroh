<?php
if (!defined('ABSPATH')) { exit; }

add_action('rest_api_init', 'umh_register_logistics_routes');

function umh_register_logistics_routes() {
    $namespace = 'umh/v1';
    $base = 'logistics';

    register_rest_route($namespace, '/' . $base, [
        [
            'methods'  => 'GET',
            'callback' => 'umh_get_logistics_items',
            'permission_callback' => '__return_true', // Sesuaikan permission nanti
        ],
        [
            'methods'  => 'POST',
            'callback' => 'umh_create_logistics_item', 
            'permission_callback' => '__return_true',
        ]
    ]);

    register_rest_route($namespace, '/' . $base . '/(?P<id>\d+)', [
        'methods'  => 'POST', 
        'callback' => 'umh_update_logistics_item',
        'permission_callback' => '__return_true',
    ]);
}

function umh_get_logistics_items($request) {
    global $wpdb;
    $table_logistics = $wpdb->prefix . 'umh_logistics';
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $table_packages = $wpdb->prefix . 'umh_packages';

    // 1. Sinkronisasi Ringan: Pastikan semua jemaah punya record di logistik (virtual atau fisik)
    // Kita gunakan LEFT JOIN dari Jamaah ke Logistik untuk list utama
    
    $search = $request->get_param('search');
    $where = " WHERE j.status != 'trash'"; // Filter soft delete jamaah
    
    if ($search) {
        $where .= $wpdb->prepare(" AND (j.full_name LIKE %s OR j.passport_number LIKE %s)", "%$search%", "%$search%");
    }

    // Query diubah: Select dari Jamaah, gabung Logistik. 
    // Ini memastikan data jemaah selalu muncul meski belum ada row di tabel logistik
    $sql = "SELECT 
                l.id as logistics_id,
                l.items_status,
                l.status as logistics_status,
                l.notes,
                j.id as jamaah_id,
                j.full_name as jamaah_name,
                j.passport_number,
                j.clothing_size,
                p.name as package_name
            FROM $table_jamaah j
            LEFT JOIN $table_logistics l ON j.id = l.jamaah_id
            LEFT JOIN $table_packages p ON j.package_id = p.id
            $where
            ORDER BY j.created_at DESC";

    $results = $wpdb->get_results($sql, ARRAY_A);

    // Format output agar frontend tidak error
    foreach ($results as &$row) {
        // Jika belum ada record logistik, set default
        if (empty($row['logistics_id'])) { 
            $row['id'] = null; // ID logistik null
            $row['status'] = 'pending'; 
            $row['items_status'] = (object)[];
            $row['notes'] = '';
        } else {
            $row['id'] = $row['logistics_id']; // Mapping ID logistik ke 'id' untuk frontend
            $row['status'] = $row['logistics_status'];
            $row['items_status'] = json_decode($row['items_status'] ?? '{}', true) ?: (object)[];
        }
    }

    return new WP_REST_Response([
        'items' => $results,
        'total_items' => count($results)
    ], 200);
}

function umh_update_logistics_item($request) {
    global $wpdb;
    $table_logistics = $wpdb->prefix . 'umh_logistics';
    
    $params = $request->get_json_params();
    $jamaah_id = isset($params['jamaah_id']) ? $params['jamaah_id'] : 0;
    
    // Cari apakah sudah ada record logistik untuk jemaah ini
    $existing_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM $table_logistics WHERE jamaah_id = %d", $jamaah_id));

    $data = [
        'items_status' => json_encode($params['items_status'] ?? []),
        'status' => $params['status'] ?? 'pending',
        'notes' => $params['notes'] ?? ''
    ];

    if ($existing_id) {
        // Update
        $updated = $wpdb->update($table_logistics, $data, ['id' => $existing_id]);
    } else {
        // Insert Baru
        if (!$jamaah_id) return new WP_Error('missing_jamaah', 'Jamaah ID tidak ditemukan', ['status' => 400]);
        $data['jamaah_id'] = $jamaah_id;
        $updated = $wpdb->insert($table_logistics, $data);
        $existing_id = $wpdb->insert_id;
    }

    if ($updated === false) {
        return new WP_Error('db_error', 'Gagal update data logistik', ['status' => 500]);
    }

    return new WP_REST_Response(['message' => 'Data berhasil disimpan', 'id' => $existing_id], 200);
}

function umh_create_logistics_item($request) {
    return umh_update_logistics_item($request);
}