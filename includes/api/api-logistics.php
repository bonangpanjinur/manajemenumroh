<?php
if (!defined('ABSPATH')) {
    exit; 
}

// Ganti nama fungsi hook agar unik
add_action('rest_api_init', 'umh_register_logistics_routes_v2');

function umh_register_logistics_routes_v2() {
    $namespace = 'umh/v1';
    $base = 'logistics';

    register_rest_route($namespace, '/' . $base, [
        [
            'methods'  => 'GET',
            'callback' => 'umh_get_logistics',
            'permission_callback' => 'umh_check_api_permission',
        ],
        [
            'methods'  => 'POST',
            'callback' => 'umh_save_logistics',
            'permission_callback' => 'umh_check_api_permission',
        ],
        [
            'methods'  => 'DELETE',
            'callback' => 'umh_delete_logistics',
            'permission_callback' => 'umh_check_api_permission',
        ]
    ]);
    
    register_rest_route($namespace, '/' . $base . '/checklist/(?P<id>\d+)', [
        'methods'  => 'POST',
        'callback' => 'umh_update_logistics_checklist',
        'permission_callback' => 'umh_check_api_permission',
    ]);
}

function umh_get_logistics($request) {
    global $wpdb;
    $table_logistics = $wpdb->prefix . 'umh_logistics';
    $type = $request->get_param('type');

    if ($type === 'distribution') {
        // Auto-sync jemaah baru
        $wpdb->query("INSERT INTO $table_logistics (jamaah_id, items_status) SELECT id, '{}' FROM {$wpdb->prefix}umh_jamaah WHERE id NOT IN (SELECT jamaah_id FROM $table_logistics WHERE jamaah_id IS NOT NULL)");

        $sql = "SELECT l.*, j.full_name, j.passport_number, p.name as package_name
                FROM $table_logistics l
                JOIN {$wpdb->prefix}umh_jamaah j ON l.jamaah_id = j.id
                LEFT JOIN {$wpdb->prefix}umh_packages p ON j.package_id = p.id
                WHERE l.jamaah_id IS NOT NULL ORDER BY j.created_at DESC";
        
        $results = $wpdb->get_results($sql, ARRAY_A);
        foreach ($results as &$row) {
            $row['items_status'] = json_decode($row['items_status'], true) ?: (object)[];
        }
        return rest_ensure_response($results);
    } else {
        // Inventory Mode
        $results = $wpdb->get_results("SELECT * FROM $table_logistics WHERE jamaah_id IS NULL ORDER BY item_name ASC", ARRAY_A);
        return rest_ensure_response($results);
    }
}

function umh_save_logistics($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_logistics';
    $params = $request->get_json_params();

    $data = [
        'item_name' => sanitize_text_field($params['item_name']),
        'stock_qty' => intval($params['stock_qty']),
        'unit'      => sanitize_text_field($params['unit']),
        'min_stock_alert' => intval($params['min_stock_alert'] ?? 10),
        'status'    => 'safe',
        'jamaah_id' => null 
    ];

    if (!empty($params['id'])) {
        $wpdb->update($table_name, $data, ['id' => $params['id']]);
    } else {
        $wpdb->insert($table_name, $data);
    }
    return rest_ensure_response(['success' => true]);
}

function umh_update_logistics_checklist($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_logistics';
    $id = $request['id'];
    $params = $request->get_json_params();

    $data = [];
    if (isset($params['items_status'])) $data['items_status'] = json_encode($params['items_status']);
    if (isset($params['date_taken'])) $data['date_taken'] = $params['date_taken'];

    $wpdb->update($table_name, $data, ['id' => $id]);
    return rest_ensure_response(['success' => true]);
}

function umh_delete_logistics($request) {
    global $wpdb;
    $id = $request->get_param('id');
    $wpdb->delete($wpdb->prefix . 'umh_logistics', ['id' => $id]);
    return rest_ensure_response(['success' => true]);
}