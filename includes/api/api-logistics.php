<?php
if (!defined('ABSPATH')) {
    exit; 
}

add_action('rest_api_init', 'umh_register_logistics_routes');

function umh_register_logistics_routes() {
    $namespace = 'umh/v1';
    $base = 'logistics';

    // Route Custom untuk GET (Supaya bisa JOIN table Jamaah & Paket)
    register_rest_route($namespace, '/' . $base, [
        [
            'methods'  => 'GET',
            'callback' => 'umh_get_logistics_items',
            'permission_callback' => 'umh_check_api_permission',
        ],
        [
            'methods'  => 'POST',
            'callback' => 'umh_create_logistics_item', // Jarang dipakai manual, biasanya auto trigger saat jamaah daftar
            'permission_callback' => 'umh_check_api_permission',
        ]
    ]);

    // Route untuk Update per ID
    register_rest_route($namespace, '/' . $base . '/(?P<id>\d+)', [
        'methods'  => 'POST', // Menggunakan POST untuk update agar seragam
        'callback' => 'umh_update_logistics_item',
        'permission_callback' => 'umh_check_api_permission',
    ]);
}

// 1. GET ITEMS (Dengan JOIN)
function umh_get_logistics_items($request) {
    global $wpdb;
    $table_logistics = $wpdb->prefix . 'umh_logistics';
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $table_packages = $wpdb->prefix . 'umh_packages';

    // Sync Data: Pastikan setiap jamaah punya record logistik
    // Query ini memasukkan jamaah baru ke tabel logistik jika belum ada
    $wpdb->query("
        INSERT INTO $table_logistics (jamaah_id)
        SELECT id FROM $table_jamaah 
        WHERE id NOT IN (SELECT jamaah_id FROM $table_logistics)
    ");

    // Fetch Data dengan JOIN
    $sql = "SELECT 
                l.*,
                j.full_name as jamaah_name,
                j.registration_number,
                j.address as jamaah_address,
                p.name as package_name
            FROM $table_logistics l
            LEFT JOIN $table_jamaah j ON l.jamaah_id = j.id
            LEFT JOIN $table_packages p ON j.package_id = p.id
            ORDER BY l.updated_at DESC";

    $results = $wpdb->get_results($sql, ARRAY_A);

    // Decode JSON items_status
    foreach ($results as &$row) {
        $row['items_status'] = json_decode($row['items_status'], true) ?: (object)[];
    }

    return new WP_REST_Response([
        'items' => $results,
        'total_items' => count($results)
    ], 200);
}

// 2. UPDATE ITEM
function umh_update_logistics_item($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_logistics';
    $id = $request['id'];
    $params = $request->get_json_params();

    if (isset($params['items_status']) && is_array($params['items_status'])) {
        $params['items_status'] = json_encode($params['items_status']);
    }

    // Hanya update field yang diizinkan
    $allowed_fields = ['items_status', 'handover_status', 'taken_by', 'date_taken', 'notes'];
    $data_to_update = [];

    foreach ($allowed_fields as $field) {
        if (isset($params[$field])) {
            $data_to_update[$field] = $params[$field];
        }
    }

    $where = ['id' => $id];
    $updated = $wpdb->update($table_name, $data_to_update, $where);

    if ($updated === false) {
        return new WP_Error('db_error', 'Gagal update database', ['status' => 500]);
    }

    return new WP_REST_Response(['message' => 'Data logistik berhasil diupdate', 'id' => $id], 200);
}

// 3. CREATE ITEM (Manual trigger jika perlu)
function umh_create_logistics_item($request) {
    // Implementasi opsional jika ingin input manual tanpa via Jamaah
    return new WP_Error('not_implemented', 'Logistik dibuat otomatis dari data Jamaah.', ['status' => 501]);
}