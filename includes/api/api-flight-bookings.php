<?php
if (!defined('ABSPATH')) {
    exit; 
}

add_action('rest_api_init', 'umh_register_flight_booking_api_routes');

function umh_register_flight_booking_api_routes() {
    $namespace = 'umh/v1';
    $base = 'flight-bookings';

    register_rest_route($namespace, '/' . $base, [
        [
            'methods'  => WP_REST_Server::READABLE,
            'callback' => 'umh_get_flight_bookings',
            'permission_callback' => 'umh_check_api_permission_ops_staff',
        ],
        [
            'methods'  => WP_REST_Server::CREATABLE,
            'callback' => 'umh_create_flight_booking',
            'permission_callback' => 'umh_check_api_permission_ops_staff',
        ],
    ]);

    register_rest_route($namespace, '/' . $base . '/(?P<id>[\d]+)', [
        [
            'methods'  => WP_REST_Server::DELETABLE,
            'callback' => 'umh_delete_flight_booking',
            'permission_callback' => 'umh_check_api_permission_ops_staff',
        ],
    ]);
}

function umh_check_api_permission_ops_staff() {
    return umh_check_api_permission(['owner', 'admin_staff', 'ops_staff']);
}

function umh_get_flight_bookings($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_flight_bookings';
    // FIX: Gunakan nama tabel yang benar
    $flights_table = $wpdb->prefix . 'umh_master_airlines';
    
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

    // JOIN ke tabel master airline
    // Pastikan kolom yang diambil sesuai: f.name, f.code (karena tabel master tidak punya flight_number/departure_time di level maskapai)
    // Jika perlu flight number/time, itu harusnya di tabel booking, bukan master.
    // Asumsi: Kita ambil nama maskapai dari master.
    $query = "SELECT b.*, f.name as airline_name, f.code as airline_code
              FROM $table_name AS b
              LEFT JOIN $flights_table AS f ON b.flight_id = f.id
              $where_sql
              ORDER BY b.id DESC";
              
    $items = $wpdb->get_results($wpdb->prepare($query, $params));
    return new WP_REST_Response($items, 200);
}

function umh_create_flight_booking($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_flight_bookings';
    $params = $request->get_json_params();

    $package_id = (int) $params['package_id'];
    $flight_id = (int) $params['flight_id'];

    if (empty($package_id) || empty($flight_id)) {
        return new WP_Error('bad_request', 'Package ID and Flight ID are required', ['status' => 400]);
    }

    $data = [
        'flight_id'     => $flight_id,
        'package_id'    => $package_id,
        'jamaah_id'     => isset($params['jamaah_id']) ? (int) $params['jamaah_id'] : null,
        'seat_number'   => sanitize_text_field($params['seat_number']),
        'booking_code'  => sanitize_text_field($params['booking_code']),
        'status'        => sanitize_text_field($params['status']) ?: 'confirmed',
    ];

    $wpdb->insert($table_name, $data);
    $new_id = $wpdb->insert_id;

    $new_booking = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $new_id));
    return new WP_REST_Response($new_booking, 201);
}

function umh_delete_flight_booking($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'umh_flight_bookings';
    $id = (int) $request['id'];

    $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $id));
    if (!$item) {
        return new WP_Error('not_found', 'Booking not found', ['status' => 404]);
    }

    $wpdb->delete($table_name, ['id' => $id]);
    return new WP_REST_Response(['deleted' => true, 'id' => $id], 200);
}