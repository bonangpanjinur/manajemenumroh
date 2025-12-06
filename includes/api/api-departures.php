<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Departures extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_departures');
    }

    public function register_routes() {
        parent::register_routes();
        
        // Endpoint khusus untuk mendapatkan detail lengkap (termasuk harga dinamis)
        register_rest_route('umh/v1', '/departures/(?P<id>[a-zA-Z0-9-]+)/full', [
            'methods' => 'GET',
            'callback' => [$this, 'get_departure_full_details'],
            'permission_callback' => '__return_true',
        ]);
    }

    // Override Get Items untuk Join
    public function get_items($request) {
        $params = $request->get_params();
        $page = isset($params['page']) ? intval($params['page']) : 1;
        $per_page = isset($params['per_page']) ? intval($params['per_page']) : 10;
        $search = isset($params['search']) ? sanitize_text_field($params['search']) : '';
        $offset = ($page - 1) * $per_page;

        $t_dep = $this->table_name;
        $t_pkg = $this->db->prefix . 'umh_packages';
        $t_air = $this->db->prefix . 'umh_master_airlines';

        $where = "WHERE d.deleted_at IS NULL";
        if (!empty($search)) {
            $where .= " AND (d.flight_number_depart LIKE '%$search%' OR p.name LIKE '%$search%')";
        }

        // Join ke Paket & Maskapai
        $query = "SELECT d.*, 
                         p.name as package_name, 
                         p.duration_days,
                         a.name as airline_name, 
                         a.code as airline_code
                  FROM $t_dep d
                  LEFT JOIN $t_pkg p ON d.package_id = p.id
                  LEFT JOIN $t_air a ON d.airline_id = a.id
                  $where 
                  ORDER BY d.departure_date ASC 
                  LIMIT %d OFFSET %d";

        $items = $this->db->get_results($this->db->prepare($query, $per_page, $offset));
        $total = $this->db->get_var("SELECT COUNT(*) FROM $t_dep d LEFT JOIN $t_pkg p ON d.package_id = p.id $where");

        return new WP_REST_Response([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'page' => $page,
                'per_page' => $per_page,
                'total_items' => intval($total),
                'total_pages' => ceil($total / $per_page)
            ]
        ], 200);
    }

    // Create dengan Harga Dinamis
    public function create_item($request) {
        $data = $request->get_json_params();
        
        if (empty($data['package_id'])) return new WP_REST_Response(['message' => 'Paket wajib dipilih'], 400);
        
        // Ambil harga dari request
        $prices = isset($data['prices']) ? $data['prices'] : [];
        unset($data['prices']); // Hapus agar tidak masuk ke tabel header

        $response = parent::create_item($request);
        
        if ($response->status === 201) {
            $dep_id = $response->get_data()['data']->id;
            $this->save_prices($dep_id, $prices);
        }
        return $response;
    }

    // Update dengan Harga Dinamis
    public function update_item($request) {
        $id = $request->get_param('id');
        $data = $request->get_json_params();
        $dep = $this->get_record_by_id_or_uuid($id);

        if (!$dep) return new WP_REST_Response(['message' => 'Not Found'], 404);

        $prices = isset($data['prices']) ? $data['prices'] : null;
        unset($data['prices']);

        $res = parent::update_item($request);

        if ($prices !== null) {
            $this->save_prices($dep->id, $prices);
        }

        return $res;
    }

    private function save_prices($dep_id, $prices) {
        $this->db->delete($this->db->prefix.'umh_departure_prices', ['departure_id' => $dep_id]);
        foreach ($prices as $p) {
            if(!empty($p['room_type']) && !empty($p['price'])) {
                $this->db->insert($this->db->prefix.'umh_departure_prices', [
                    'departure_id' => $dep_id,
                    'room_type' => sanitize_text_field($p['room_type']),
                    'capacity' => intval($p['capacity']),
                    'price' => floatval($p['price']),
                    'currency' => 'IDR'
                ]);
            }
        }
    }

    // Get Full Details (untuk Edit Form)
    public function get_departure_full_details($request) {
        $id = $request->get_param('id');
        $dep = $this->get_record_by_id_or_uuid($id);
        if (!$dep) return new WP_REST_Response(['message' => 'Not Found'], 404);

        $data = (array) $dep;
        
        // Ambil harga khusus keberangkatan ini
        $prices = $this->db->get_results($this->db->prepare("SELECT * FROM {$this->db->prefix}umh_departure_prices WHERE departure_id = %d", $dep->id));
        
        // Jika harga di departure kosong (baru buat atau migrasi), ambil template harga dari Paket master
        if (empty($prices)) {
            $prices = $this->db->get_results($this->db->prepare("SELECT room_type, capacity, price, currency FROM {$this->db->prefix}umh_package_prices WHERE package_id = %d", $dep->package_id));
        }

        $data['prices'] = $prices;

        return new WP_REST_Response(['success' => true, 'data' => $data], 200);
    }
    
    private function get_record_by_id_or_uuid($id) {
        if (is_numeric($id)) return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
        return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE uuid = %s", $id));
    }
}