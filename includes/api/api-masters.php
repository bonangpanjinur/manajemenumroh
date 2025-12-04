<?php
/**
 * API Handler untuk Master Data (Lokasi, Hotel, Maskapai)
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Masters {
    private $tbl_locations;
    private $tbl_hotels;
    private $tbl_airlines;

    public function __construct() {
        global $wpdb;
        $this->tbl_locations = $wpdb->prefix . 'umh_master_locations';
        $this->tbl_hotels    = $wpdb->prefix . 'umh_master_hotels';
        $this->tbl_airlines  = $wpdb->prefix . 'umh_master_airlines';
    }

    public function register_routes() {
        // LOKASI
        register_rest_route('umh/v1', '/masters/locations', [
            'methods' => 'GET', 'callback' => [$this, 'get_locations'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/masters/locations', [
            'methods' => 'POST', 'callback' => [$this, 'create_location'], 'permission_callback' => [$this, 'check_permission']
        ]);

        // HOTEL
        register_rest_route('umh/v1', '/masters/hotels', [
            'methods' => 'GET', 'callback' => [$this, 'get_hotels'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/masters/hotels', [
            'methods' => 'POST', 'callback' => [$this, 'create_hotel'], 'permission_callback' => [$this, 'check_permission']
        ]);

        // MASKAPAI
        register_rest_route('umh/v1', '/masters/airlines', [
            'methods' => 'GET', 'callback' => [$this, 'get_airlines'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/masters/airlines', [
            'methods' => 'POST', 'callback' => [$this, 'create_airline'], 'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    // --- LOGIC LOKASI ---
    public function get_locations($request) {
        global $wpdb;
        $type = $request->get_param('type'); // filter: airport / city
        $where = $type ? $wpdb->prepare("WHERE type = %s", $type) : "";
        $items = $wpdb->get_results("SELECT * FROM {$this->tbl_locations} $where ORDER BY name ASC");
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function create_location($request) {
        global $wpdb;
        $p = $request->get_json_params();
        $wpdb->insert($this->tbl_locations, [
            'name' => sanitize_text_field($p['name']),
            'code' => strtoupper(sanitize_text_field($p['code'])),
            'type' => $p['type'],
            'country' => $p['country']
        ]);
        return new WP_REST_Response(['success' => true, 'id' => $wpdb->insert_id], 201);
    }

    // --- LOGIC HOTEL ---
    public function get_hotels($request) {
        global $wpdb;
        // Join dengan tabel lokasi untuk nama kota
        $sql = "SELECT h.*, l.name as city_name 
                FROM {$this->tbl_hotels} h 
                LEFT JOIN {$this->tbl_locations} l ON h.city_id = l.id 
                ORDER BY h.name ASC";
        $items = $wpdb->get_results($sql);
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function create_hotel($request) {
        global $wpdb;
        $p = $request->get_json_params();
        $wpdb->insert($this->tbl_hotels, [
            'name' => sanitize_text_field($p['name']),
            'city_id' => intval($p['city_id']),
            'star_rating' => intval($p['star_rating']),
            'distance_to_haram' => intval($p['distance_to_haram']),
            'description' => sanitize_textarea_field($p['description']),
            'image_url' => esc_url_raw($p['image_url'])
        ]);
        return new WP_REST_Response(['success' => true, 'id' => $wpdb->insert_id], 201);
    }

    // --- LOGIC MASKAPAI ---
    public function get_airlines($request) {
        global $wpdb;
        $items = $wpdb->get_results("SELECT * FROM {$this->tbl_airlines} ORDER BY name ASC");
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function create_airline($request) {
        global $wpdb;
        $p = $request->get_json_params();
        $wpdb->insert($this->tbl_airlines, [
            'name' => sanitize_text_field($p['name']),
            'code' => strtoupper(sanitize_text_field($p['code'])),
            'logo_url' => esc_url_raw($p['logo_url'])
        ]);
        return new WP_REST_Response(['success' => true, 'id' => $wpdb->insert_id], 201);
    }
}