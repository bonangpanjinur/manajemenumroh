<?php
/**
 * Class untuk menangani semua request API menggunakan standar WordPress.
 * Gantikan file-file di folder includes/api/ dengan struktur ini.
 */
class UMH_Rest_API {

    public function init() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        $namespace = 'umroh-manager/v1';

        // Contoh Endpoint: Jamaah
        register_rest_route($namespace, '/jamaah', array(
            array(
                'methods'             => WP_REST_Server::READABLE, // GET
                'callback'            => array($this, 'get_jamaah'),
                'permission_callback' => array($this, 'check_permission'),
            ),
            array(
                'methods'             => WP_REST_Server::CREATABLE, // POST
                'callback'            => array($this, 'create_jamaah'),
                'permission_callback' => array($this, 'check_permission'),
            ),
        ));
        
        // Tambahkan route lain (packages, bookings, dll) di sini...
    }

    public function check_permission() {
        // Hanya user login dengan capability tertentu yang bisa akses
        return current_user_can('manage_options') || current_user_can('edit_posts');
    }

    public function get_jamaah($request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'umh_jamaah';
        
        // Gunakan prepare untuk keamanan SQL Injection
        // Implementasi pagination dan search di sini
        $results = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC LIMIT 100");

        return rest_ensure_response($results);
    }

    public function create_jamaah($request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'umh_jamaah';
        $params = $request->get_json_params();

        // Validasi Server Side (SANGAT PENTING)
        if (empty($params['name']) || empty($params['passport_number'])) {
            return new WP_Error('missing_data', 'Nama dan Nomor Paspor wajib diisi', array('status' => 400));
        }

        // Sanitasi data sebelum masuk DB
        $data = array(
            'name' => sanitize_text_field($params['name']),
            'passport_number' => sanitize_text_field($params['passport_number']),
            // ... field lain
            'created_at' => current_time('mysql')
        );

        $inserted = $wpdb->insert($table_name, $data);

        if ($inserted) {
            return rest_ensure_response(array('id' => $wpdb->insert_id, 'message' => 'Jamaah berhasil ditambahkan'));
        }

        return new WP_Error('db_error', 'Gagal menyimpan ke database', array('status' => 500));
    }
}