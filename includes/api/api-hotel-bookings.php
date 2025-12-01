<?php
if (!defined('ABSPATH')) {
    exit; 
}

add_action('rest_api_init', 'umh_register_hotel_booking_api_routes');

function umh_register_hotel_booking_api_routes() {
    $namespace = 'umh/v1';
    $base = 'hotel-bookings';

    register_rest_route($namespace, '/' . $base, [
        [
            'methods'  => WP_REST_Server::READABLE,
            'callback' => 'umh_get_hotel_bookings',
            'permission_callback' => 'umh_check_api_permission_ops_staff',
        ],
        [
            'methods'  => WP_REST_Server::CREATABLE,
            'callback' => 'umh_create_hotel_booking',
            'permission_callback' => 'umh_check_api_permission_ops_staff',
        ],
    ]);

    register_rest_route($namespace, '/' . $base . '/(?P<id>[\d]+)', [
        [
            'methods'  => WP_REST_Server::DELETABLE,
            'callback' => 'umh_delete_hotel_booking',
            'permission_callback' => 'umh_check_api_permission_ops_staff',
        ],
    ]);
}

function umh_get_hotel_bookings($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_hotel_bookings';
    // FIX: Gunakan nama tabel yang benar
    $hotels_table = $wpdb->prefix . 'umh_master_hotels';
    
    $package_id = $request->get_param('package_id');
    $jamaah_id = $request->get_param('jamaah_id');

    $where_clauses = [];
    $params = [];

    if (!empty($package_id)) {
        $where_clauses[] = "b.package_id = %d";
        $params[] = (int) $package_id;
    }
    if (!empty($jamaah_id)) {
        $where_clauses[] = "b.jamaah_id = %d";
        $params[] = (int) $jamaah_id;
    }
    
    $where_sql = "";
    if (!empty($where_clauses)) {
        $where_sql = " WHERE " . implode(' AND ', $where_clauses);
    } else {
        return new WP_REST_Response([], 200); 
    }

    $query = "SELECT b.*, h.name AS hotel_name, h.city, h.rating 
              FROM $table_name AS b
              LEFT JOIN $hotels_table AS h ON b.hotel_id = h.id
              $where_sql
              ORDER BY b.check_in_date ASC";
              
    $items = $wpdb->get_results($wpdb->prepare($query, $params));
    return new WP_REST_Response($items, 200);
}

function umh_create_hotel_booking($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_hotel_bookings';
    $params = $request->get_json_params();

    $package_id = (int) $params['package_id'];
    $hotel_id = (int) $params['hotel_id'];

    if (empty($package_id) || empty($hotel_id)) {
        return new WP_Error('bad_request', 'Package ID and Hotel ID are required', ['status' => 400]);
    }

    $data = [
        'hotel_id'       => $hotel_id,
        'package_id'     => $package_id,
        'jamaah_id'      => isset($params['jamaah_id']) ? (int) $params['jamaah_id'] : null,
        'check_in_date'  => sanitize_text_field($params['check_in_date']),
        'check_out_date' => sanitize_text_field($params['check_out_date']),
        'status'         => sanitize_text_field($params['status']) ?: 'confirmed',
    ];

    $wpdb->insert($table_name, $data);
    $new_id = $wpdb->insert_id;

    $new_booking = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $new_id));
    return new WP_REST_Response($new_booking, 201);
}

function umh_delete_hotel_booking($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_hotel_bookings';
    $id = (int) $request['id'];

    $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id));
    if (!$item) {
        return new WP_Error('not_found', 'Booking not found', ['status' => 404]);
    }

    $wpdb->delete($table_name, ['id' => $id]);
    return new WP_REST_Response(['deleted' => true, 'id' => $id], 200);
}