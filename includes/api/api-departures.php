<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Departures extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_departures');
    }

    public function register_routes() {
        parent::register_routes();
        // Custom route untuk ambil list lengkap dengan nama paket
        register_rest_route('umh/v1', '/departures/full', [
            'methods' => 'GET',
            'callback' => [$this, 'get_full_departures'],
            'permission_callback' => '__return_true'
        ]);
    }

    // Override Create untuk generate UUID & Validasi
    public function create_item($request) {
        $data = $request->get_json_params();
        $data['uuid'] = wp_generate_uuid4();
        
        // Ambil harga dari paket jika kosong
        if(empty($data['price_quad'])) {
            $pkg = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->db->prefix}umh_packages WHERE id = %d", $data['package_id']));
            if($pkg) {
                $data['price_quad'] = $pkg->base_price_quad;
                $data['price_triple'] = $pkg->base_price_triple;
                $data['price_double'] = $pkg->base_price_double;
            }
        }
        
        // Set available seats sama dengan quota di awal
        if(!isset($data['available_seats'])) {
            $data['available_seats'] = $data['quota'];
        }

        $request->set_body_params($data);
        return parent::create_item($request);
    }

    public function get_full_departures($request) {
        $table = $this->table_name;
        $pkg_table = $this->db->prefix . 'umh_packages';
        
        $sql = "SELECT d.*, p.name as package_name, p.duration_days 
                FROM $table d 
                LEFT JOIN $pkg_table p ON d.package_id = p.id 
                ORDER BY d.departure_date ASC";
                
        $results = $this->db->get_results($sql);
        return new WP_REST_Response(['success' => true, 'data' => $results], 200);
    }
}