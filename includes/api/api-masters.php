<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Masters extends UMH_CRUD_Controller {
    
    public function __construct() {
        parent::__construct('umh_master_vendors'); // Default base, tapi kita override
    }

    public function register_routes() {
        // Route khusus untuk Hotel
        register_rest_route('umh/v1', '/hotels', [
            'methods' => ['GET', 'POST'], 'callback' => [$this, 'handle_hotels'], 'permission_callback' => '__return_true'
        ]);
        register_rest_route('umh/v1', '/hotels/(?P<id>\d+)', [
            'methods' => ['PUT', 'DELETE'], 'callback' => [$this, 'handle_hotels'], 'permission_callback' => '__return_true'
        ]);

        // Route khusus untuk Maskapai
        register_rest_route('umh/v1', '/airlines', [
            'methods' => ['GET', 'POST'], 'callback' => [$this, 'handle_airlines'], 'permission_callback' => '__return_true'
        ]);
        register_rest_route('umh/v1', '/airlines/(?P<id>\d+)', [
            'methods' => ['PUT', 'DELETE'], 'callback' => [$this, 'handle_airlines'], 'permission_callback' => '__return_true'
        ]);

        // Route Vendor Umum
        register_rest_route('umh/v1', '/vendors', [
            'methods' => ['GET', 'POST'], 'callback' => [$this, 'handle_vendors'], 'permission_callback' => '__return_true'
        ]);
    }

    // Handler Hotel
    public function handle_hotels($request) {
        $this->table_name = $this->db->prefix . 'umh_master_hotels';
        return $this->process_request($request);
    }

    // Handler Airlines
    public function handle_airlines($request) {
        $this->table_name = $this->db->prefix . 'umh_master_airlines';
        return $this->process_request($request);
    }

    // Handler Vendors
    public function handle_vendors($request) {
        $this->table_name = $this->db->prefix . 'umh_master_vendors';
        return $this->process_request($request);
    }
}