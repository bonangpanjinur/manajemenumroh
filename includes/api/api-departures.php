<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Departures_API extends UMH_CRUD_Controller {
    public function __construct() {
        $schema = [
            'package_id'     => ['type' => 'integer', 'required' => true],
            'departure_date' => ['type' => 'string', 'format' => 'date', 'required' => true],
            'quota'          => ['type' => 'integer', 'required' => true],
            'filled_seats'   => ['type' => 'integer', 'default' => 0],
            'status'         => ['type' => 'string', 'default' => 'open'],
            // Point 2: Tambahkan field price_override ke schema agar bisa disimpan
            'price_override' => ['type' => 'number', 'default' => 0], 
        ];

        // Join ke table packages untuk mengambil nama paket & harga dasar saat GET
        parent::__construct('departures', 'umh_departures', $schema, ['get_items' => ['public']]); // Public read allowed for schedule
    }

    // Override get_items untuk join nama paket dan harga dasar
    public function get_items($request) {
        global $wpdb;
        $table_packages = $wpdb->prefix . 'umh_packages';
        
        // Ambil parameter paginasi standar
        $page = $request->get_param('page') ?? 1;
        $per_page = $request->get_param('per_page') ?? 10;
        $offset = ($page - 1) * $per_page;
        
        $sql = "SELECT d.*, p.name as package_name, p.price as base_price 
                FROM {$this->table_name} d
                LEFT JOIN $table_packages p ON d.package_id = p.id
                ORDER BY d.departure_date ASC";

        // Jika ada paginasi, tambahkan LIMIT (Opsional, tergantung kebutuhan frontend)
        // $sql .= " LIMIT $per_page OFFSET $offset";

        $results = $wpdb->get_results($sql, ARRAY_A);
        return rest_ensure_response($results);
    }
}
new UMH_Departures_API();