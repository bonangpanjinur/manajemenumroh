<?php
/**
 * API Handler untuk Jadwal Keberangkatan (Inventory)
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Departures {
    private $tbl_departures;
    private $tbl_packages;

    public function __construct() {
        global $wpdb;
        $this->tbl_departures = $wpdb->prefix . 'umh_departures';
        $this->tbl_packages = $wpdb->prefix . 'umh_packages';
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/departures', [
            'methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/departures', [
            'methods' => 'POST', 'callback' => [$this, 'create_item'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/departures/(?P<id>\d+)', [
            'methods' => 'DELETE', 'callback' => [$this, 'delete_item'], 'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    public function get_items($request) {
        global $wpdb;
        $package_id = $request->get_param('package_id');
        $where = $package_id ? $wpdb->prepare("WHERE d.package_id = %d", $package_id) : "";

        // Join ke Packages untuk dapat nama paket
        $sql = "SELECT d.*, p.name as package_name, (d.seat_quota - d.seat_booked) as available_seats
                FROM {$this->tbl_departures} d
                JOIN {$this->tbl_packages} p ON d.package_id = p.id
                $where ORDER BY d.departure_date ASC";
                
        $items = $wpdb->get_results($sql);
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function create_item($request) {
        global $wpdb;
        $p = $request->get_json_params();

        if (empty($p['package_id']) || empty($p['departure_date'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'Paket dan Tanggal wajib diisi'], 400);
        }

        $wpdb->insert($this->tbl_departures, [
            'package_id' => intval($p['package_id']),
            'departure_date' => $p['departure_date'],
            'return_date' => $p['return_date'],
            'price_quad' => !empty($p['price_quad']) ? floatval($p['price_quad']) : null,
            'price_triple' => !empty($p['price_triple']) ? floatval($p['price_triple']) : null,
            'price_double' => !empty($p['price_double']) ? floatval($p['price_double']) : null,
            'seat_quota' => intval($p['seat_quota'] ?? 45),
            'seat_booked' => 0,
            'flight_number_depart' => sanitize_text_field($p['flight_number_depart']),
            'flight_number_return' => sanitize_text_field($p['flight_number_return']),
            'status' => 'open'
        ]);

        return new WP_REST_Response(['success' => true, 'id' => $wpdb->insert_id], 201);
    }

    public function delete_item($request) {
        global $wpdb;
        $id = $request->get_param('id');
        
        // Cek booking dulu
        $has_booking = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_bookings WHERE departure_id = %d", $id));
        if ($has_booking) {
            return new WP_REST_Response(['success' => false, 'message' => 'Gagal: Sudah ada booking di jadwal ini.'], 400);
        }

        $wpdb->delete($this->tbl_departures, ['id' => $id]);
        return new WP_REST_Response(['success' => true, 'message' => 'Jadwal dihapus'], 200);
    }
}