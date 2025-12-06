<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Masters extends UMH_CRUD_Controller {

    public function __construct() { parent::__construct('options'); }

    public function register_routes() {
        // ... (Settings route)
        $this->register_sub_controller('hotels', 'umh_master_hotels');
        $this->register_sub_controller('airlines', 'umh_master_airlines');
        $this->register_sub_controller('cities', 'umh_master_cities');
        $this->register_sub_controller('mutawifs', 'umh_master_mutawifs');

        // NEW: Seed Cities
        register_rest_route('umh/v1', '/masters/seed-cities', [
            'methods' => 'POST', 'callback' => [$this, 'seed_indonesian_cities'], 'permission_callback' => '__return_true',
        ]);
    }

    private function register_sub_controller($base, $table) {
        // ... (Logic Sub Controller sama seperti sebelumnya)
        $controller = new class($table, $base) extends UMH_CRUD_Controller {
            private $custom_base;
            public function __construct($t, $b) { parent::__construct($t); $this->custom_base = $b; }
            public function register_routes() {
                $this->rest_base = $this->custom_base;
                parent::register_routes();
            }
            
            // Override create untuk Hotel agar save city_id
            public function create_item($request) {
                if ($this->custom_base === 'hotels') {
                    $data = $request->get_json_params();
                    if (!empty($data['city_id'])) $data['city_id'] = intval($data['city_id']);
                    $request->set_body_params($data);
                }
                return parent::create_item($request);
            }
        };
        $controller->register_routes();
    }

    public function seed_indonesian_cities() {
        // Data Dummy Kota Besar Indonesia (Simulasi API)
        $cities = [
            ['name' => 'Jakarta Selatan', 'province' => 'DKI Jakarta'],
            ['name' => 'Jakarta Pusat', 'province' => 'DKI Jakarta'],
            ['name' => 'Bandung', 'province' => 'Jawa Barat'],
            ['name' => 'Surabaya', 'province' => 'Jawa Timur'],
            ['name' => 'Medan', 'province' => 'Sumatera Utara'],
            ['name' => 'Makassar', 'province' => 'Sulawesi Selatan'],
            ['name' => 'Semarang', 'province' => 'Jawa Tengah'],
            ['name' => 'Palembang', 'province' => 'Sumatera Selatan'],
            ['name' => 'Batam', 'province' => 'Kepulauan Riau'],
            ['name' => 'Pekanbaru', 'province' => 'Riau'],
            ['name' => 'Yogyakarta', 'province' => 'DI Yogyakarta'],
            ['name' => 'Balikpapan', 'province' => 'Kalimantan Timur'],
            ['name' => 'Denpasar', 'province' => 'Bali'],
            ['name' => 'Malang', 'province' => 'Jawa Timur']
        ];

        $count = 0;
        foreach ($cities as $city) {
            $exists = $this->db->get_var($this->db->prepare("SELECT id FROM {$this->db->prefix}umh_master_cities WHERE name = %s", $city['name']));
            if (!$exists) {
                $this->db->insert($this->db->prefix.'umh_master_cities', $city);
                $count++;
            }
        }
        return new WP_REST_Response(['success' => true, 'message' => "$count kota berhasil diimport."], 200);
    }
    
    // ... (get_settings & update_settings sama)
    public function get_settings() { return new WP_REST_Response(['success'=>true, 'data'=>[]], 200); }
    public function update_settings() { return new WP_REST_Response(['success'=>true], 200); }
}