<?php
// includes/api/api-packages.php

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Packages extends UMH_Crud_Controller {
    
    protected $table_name = 'umh_packages';

    public function register_routes() {
        parent::register_routes();
        // Route khusus untuk cek manifest (jemaah di paket ini)
        register_rest_route($this->namespace, '/' . $this->base . '/(?P<id>[\d]+)/manifest', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_manifest'),
            'permission_callback' => array($this, 'check_permission'),
        ));
    }

    /**
     * Override create_item untuk menangani relasi otomatis ke tabel Master
     * (Kategori, Maskapai, Hotel)
     */
    public function create_item($request) {
        $params = $request->get_json_params();
        $params = $this->handle_master_data($params);
        $request->set_body_params($params);
        return parent::create_item($request);
    }

    /**
     * Override update_item untuk logika yang sama
     */
    public function update_item($request) {
        $params = $request->get_json_params();
        $params = $this->handle_master_data($params);
        $request->set_body_params($params);
        return parent::update_item($request);
    }

    /**
     * Fungsi Cerdas: Cek apakah data master (String) sudah ada ID-nya.
     * Jika belum, buat baru di tabel master dan ambil ID-nya.
     */
    private function handle_master_data($params) {
        global $wpdb;

        // 1. Handle Kategori
        if (!empty($params['category']) && empty($params['category_id'])) {
            $cat_table = $wpdb->prefix . 'umh_package_categories';
            $cat_name = sanitize_text_field($params['category']);
            $existing = $wpdb->get_var($wpdb->prepare("SELECT id FROM $cat_table WHERE name = %s", $cat_name));
            
            if ($existing) {
                $params['category_id'] = $existing;
            } else {
                $wpdb->insert($cat_table, ['name' => $cat_name, 'slug' => sanitize_title($cat_name), 'type' => 'umrah']);
                $params['category_id'] = $wpdb->insert_id;
            }
            unset($params['category']); // Hapus field string agar tidak error di insert tabel paket
        }

        // 2. Handle Hotel Makkah
        if (!empty($params['hotel_makkah']) && empty($params['hotel_makkah_id'])) {
            $hotel_table = $wpdb->prefix . 'umh_master_hotels';
            $hotel_name = sanitize_text_field($params['hotel_makkah']);
            $existing = $wpdb->get_var($wpdb->prepare("SELECT id FROM $hotel_table WHERE name = %s", $hotel_name));
            
            if ($existing) {
                $params['hotel_makkah_id'] = $existing;
            } else {
                $wpdb->insert($hotel_table, ['name' => $hotel_name, 'city' => 'Makkah']);
                $params['hotel_makkah_id'] = $wpdb->insert_id;
            }
            unset($params['hotel_makkah']);
        }

        // 3. Handle Hotel Madinah
        if (!empty($params['hotel_madinah']) && empty($params['hotel_madinah_id'])) {
            $hotel_table = $wpdb->prefix . 'umh_master_hotels';
            $hotel_name = sanitize_text_field($params['hotel_madinah']);
            $existing = $wpdb->get_var($wpdb->prepare("SELECT id FROM $hotel_table WHERE name = %s", $hotel_name));
            
            if ($existing) {
                $params['hotel_madinah_id'] = $existing;
            } else {
                $wpdb->insert($hotel_table, ['name' => $hotel_name, 'city' => 'Madinah']);
                $params['hotel_madinah_id'] = $wpdb->insert_id;
            }
            unset($params['hotel_madinah']);
        }

        // 4. Handle Maskapai
        if (!empty($params['airline']) && empty($params['airline_id'])) {
            $airline_table = $wpdb->prefix . 'umh_master_airlines';
            $airline_name = sanitize_text_field($params['airline']);
            $existing = $wpdb->get_var($wpdb->prepare("SELECT id FROM $airline_table WHERE name = %s", $airline_name));
            
            if ($existing) {
                $params['airline_id'] = $existing;
            } else {
                $wpdb->insert($airline_table, ['name' => $airline_name, 'type' => 'International']);
                $params['airline_id'] = $wpdb->insert_id;
            }
            unset($params['airline']);
        }
        
        // Hapus field yang tidak ada di skema baru untuk mencegah error SQL
        unset($params['hotel_transit']);
        unset($params['hotel_plus']);
        unset($params['price_details']);

        return $params;
    }

    // Override get_items untuk join nama master agar muncul di tabel
    public function get_items($request) {
        global $wpdb;
        $limit = 10;
        $offset = 0;
        
        // Custom Query Join
        $cat_table = $wpdb->prefix . 'umh_package_categories';
        $pkg_table = $this->table_name;
        
        $sql = "SELECT p.*, c.name as category_name 
                FROM $pkg_table p 
                LEFT JOIN $cat_table c ON p.category_id = c.id 
                WHERE p.status != 'archived' 
                ORDER BY p.created_at DESC 
                LIMIT $limit OFFSET $offset";
                
        $results = $wpdb->get_results($sql, ARRAY_A);
        
        // Format response agar cocok dengan frontend
        foreach ($results as &$row) {
            $row['category'] = $row['category_name']; // Map category_name ke category field
        }
        
        return rest_ensure_response($results);
    }

    // Get Jemaah Manifest for this package
    public function get_manifest($request) {
        global $wpdb;
        $package_id = $request['id'];
        
        // Perlu update query ini karena struktur tabel booking berubah (gunakan departure_id, bukan package_id langsung di header)
        // Namun untuk kompatibilitas skema baru, kita harus join via departures
        
        $table_bookings = $wpdb->prefix . 'umh_bookings';
        $table_booking_pax = $wpdb->prefix . 'umh_booking_passengers';
        $table_jamaah = $wpdb->prefix . 'umh_jamaah';
        $table_departures = $wpdb->prefix . 'umh_departures';

        // Query: Cari booking pax yang terhubung ke departure yang terhubung ke package ini
        $query = $wpdb->prepare("
            SELECT 
                b.booking_code,
                b.payment_status,
                bp.package_type as room_type,
                j.full_name as jamaah_name,
                j.nik,
                j.gender,
                j.phone
            FROM $table_booking_pax bp
            JOIN $table_bookings b ON bp.booking_id = b.id
            JOIN $table_jamaah j ON bp.jamaah_id = j.id
            JOIN $table_departures d ON b.departure_id = d.id
            WHERE d.package_id = %d
        ", $package_id);

        $results = $wpdb->get_results($query, ARRAY_A);
        return rest_ensure_response($results);
    }
}