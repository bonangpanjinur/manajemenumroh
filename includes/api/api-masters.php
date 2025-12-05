<?php
/**
 * File: includes/api/api-masters.php
 * Lokasi: includes/api/api-masters.php
 * Deskripsi: API untuk Settings & Master Data (Hotels, Airlines)
 */

require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

/**
 * Controller Utama untuk Settings & Master Data
 */
class UMH_API_Masters extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('options'); // Default ke options untuk settings
    }

    public function register_routes() {
        // 1. Settings Routes
        register_rest_route('umh/v1', '/settings', [
            'methods' => 'GET',
            'callback' => [$this, 'get_settings'],
            'permission_callback' => '__return_true',
        ]);
        
        register_rest_route('umh/v1', '/settings', [
            'methods' => 'POST',
            'callback' => [$this, 'update_settings'],
            'permission_callback' => '__return_true',
        ]);

        // 2. Register Sub-Controllers untuk Master Data (FIX 404)
        $this->register_hotel_routes();
        $this->register_airline_routes();
    }

    private function register_hotel_routes() {
        $hotel_controller = new UMH_CRUD_Controller('umh_master_hotels');
        // Override base properti agar route menjadi /hotels
        // Reflection atau Subclassing on the fly
        $hotel_controller = new class extends UMH_CRUD_Controller {
            public function __construct() { parent::__construct('umh_master_hotels'); }
            public function register_routes() {
                $this->rest_base = 'hotels'; // Force slug
                parent::register_routes();
            }
        };
        $hotel_controller->register_routes();
    }

    private function register_airline_routes() {
        $airline_controller = new class extends UMH_CRUD_Controller {
            public function __construct() { parent::__construct('umh_master_airlines'); }
            public function register_routes() {
                $this->rest_base = 'airlines'; // Force slug
                parent::register_routes();
            }
        };
        $airline_controller->register_routes();
    }

    // ... (Fungsi get_settings dan update_settings tetap sama)
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