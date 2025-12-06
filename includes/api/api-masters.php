<?php
/**
 * File: includes/api/api-masters.php
 * Deskripsi: API untuk Master Data (Hotel, Airlines, Cities)
 */

require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Masters extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('options'); // Default dummy, will be overridden
    }

    public function register_routes() {
        // 1. Settings Routes
        register_rest_route('umh/v1', '/settings', [
            'methods' => 'GET', 'callback' => [$this, 'get_settings'], 'permission_callback' => '__return_true',
        ]);
        register_rest_route('umh/v1', '/settings', [
            'methods' => 'POST', 'callback' => [$this, 'update_settings'], 'permission_callback' => '__return_true',
        ]);

        // 2. Register Sub-Controllers Dynamic
        $this->register_sub_controller('hotels', 'umh_master_hotels');
        $this->register_sub_controller('airlines', 'umh_master_airlines');
        $this->register_sub_controller('cities', 'umh_master_cities'); // NEW: Kota
    }

    // Helper untuk membuat controller on-the-fly
    private function register_sub_controller($base, $table) {
        $controller = new class($table, $base) extends UMH_CRUD_Controller {
            private $custom_base;
            public function __construct($t, $b) { 
                parent::__construct($t); 
                $this->custom_base = $b; 
            }
            public function register_routes() {
                $this->rest_base = $this->custom_base;
                parent::register_routes();
            }
        };
        $controller->register_routes();
    }

    public function get_settings() {
        $settings = [
            'company_name' => get_option('umh_opt_company_name', 'Umroh Travel'),
            'company_address' => get_option('umh_opt_address', ''),
            'company_phone' => get_option('umh_opt_phone', ''),
            'currency_symbol' => get_option('umh_opt_currency', 'Rp'),
            'logo_url' => get_option('umh_opt_logo', ''),
        ];
        return new WP_REST_Response(['success' => true, 'data' => $settings], 200);
    }

    public function update_settings($request) {
        $data = $request->get_json_params();
        foreach ($data as $key => $value) {
            if (strpos($key, 'company_') === 0 || strpos($key, 'currency') === 0 || $key === 'logo_url') {
                update_option('umh_opt_' . $key, sanitize_text_field($value));
            }
        }
        return new WP_REST_Response(['success' => true, 'message' => 'Pengaturan disimpan'], 200);
    }
}