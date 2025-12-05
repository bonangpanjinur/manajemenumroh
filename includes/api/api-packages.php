<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Packages extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_packages');
    }

    public function register_routes() {
        parent::register_routes();
        
        // Endpoint khusus detail lengkap (untuk Edit Form)
        register_rest_route('umh/v1', '/packages/(?P<id>[a-zA-Z0-9-]+)/full', [
            'methods' => 'GET',
            'callback' => [$this, 'get_package_full_details'],
            'permission_callback' => '__return_true',
        ]);
    }

    // Override Create: Simpan Itinerary & Hotel
    public function create_item($request) {
        $data = $request->get_json_params();
        $itineraries = isset($data['itineraries']) ? $data['itineraries'] : [];
        $hotels = isset($data['hotels']) ? $data['hotels'] : []; // Array Hotel

        // Bersihkan data agar tidak masuk ke tabel utama packages
        unset($data['itineraries']); 
        unset($data['hotels']); 

        $response = parent::create_item($request);
        
        if ($response->status !== 201) {
            return $response;
        }

        $package_data = $response->get_data()['data'];
        $package_id = $package_data->id;

        if (!empty($itineraries)) $this->save_itineraries($package_id, $itineraries);
        if (!empty($hotels)) $this->save_hotels($package_id, $hotels); 

        return $response;
    }

    // Override Update: Update Itinerary & Hotel
    public function update_item($request) {
        $data = $request->get_json_params();
        $id = $request->get_param('id');
        $package = $this->get_record_by_id_or_uuid($id);

        if (!$package) return new WP_REST_Response(['message' => 'Paket tidak ditemukan'], 404);

        $itineraries = isset($data['itineraries']) ? $data['itineraries'] : null;
        $hotels = isset($data['hotels']) ? $data['hotels'] : null; 

        unset($data['itineraries']);
        unset($data['hotels']);

        $response = parent::update_item($request);

        if ($itineraries !== null) {
            $this->db->delete($this->db->prefix . 'umh_package_itineraries', ['package_id' => $package->id]);
            $this->save_itineraries($package->id, $itineraries);
        }

        if ($hotels !== null) {
            $this->db->delete($this->db->prefix . 'umh_package_hotels', ['package_id' => $package->id]);
            $this->save_hotels($package->id, $hotels);
        }

        return $response;
    }

    // Override Get Items: Tampilkan List Hotel di Tabel Depan (Concatenated String)
    public function get_items($request) {
        $params = $request->get_params();
        $page = isset($params['page']) ? intval($params['page']) : 1;
        $per_page = isset($params['per_page']) ? intval($params['per_page']) : 10;
        $search = isset($params['search']) ? sanitize_text_field($params['search']) : '';
        $offset = ($page - 1) * $per_page;

        $t_pkg = $this->table_name;
        $t_pkg_h = $this->db->prefix . 'umh_package_hotels';
        $t_mst_h = $this->db->prefix . 'umh_master_hotels';

        // Subquery canggih untuk menggabungkan nama hotel dalam satu sel
        // Hasil: "Hilton (Makkah), Movenpick (Madinah)"
        $hotel_select = "(
            SELECT GROUP_CONCAT(CONCAT(mh.name, ' (', ph.city_name, ')') SEPARATOR ', ')
            FROM $t_pkg_h ph
            JOIN $t_mst_h mh ON ph.hotel_id = mh.id
            WHERE ph.package_id = p.id
        ) as hotel_summary";

        $where = "WHERE p.deleted_at IS NULL";
        if (!empty($search)) {
            $where .= " AND p.name LIKE '%" . esc_sql($this->db->esc_like($search)) . "%'";
        }

        $query = "SELECT p.*, $hotel_select FROM $t_pkg p $where ORDER BY p.created_at DESC LIMIT %d OFFSET %d";
        
        $items = $this->db->get_results($this->db->prepare($query, $per_page, $offset));
        $total = $this->db->get_var("SELECT COUNT(*) FROM $t_pkg p $where");

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

    // Helper Save Functions
    private function save_itineraries($package_id, $items) {
        $table = $this->db->prefix . 'umh_package_itineraries';
        foreach ($items as $day) {
            $this->db->insert($table, [
                'package_id' => $package_id,
                'day_number' => $day['day_number'],
                'title' => $day['title'],
                'description' => $day['description'],
                'location' => isset($day['location']) ? $day['location'] : '',
                'created_at' => current_time('mysql')
            ]);
        }
    }

    private function save_hotels($package_id, $items) {
        $table = $this->db->prefix . 'umh_package_hotels';
        foreach ($items as $h) {
            if (!empty($h['hotel_id'])) {
                $this->db->insert($table, [
                    'package_id' => $package_id,
                    'hotel_id'   => $h['hotel_id'],
                    'city_name'  => $h['city_name'],
                    'nights'     => isset($h['nights']) ? intval($h['nights']) : 0,
                    'created_at' => current_time('mysql')
                ]);
            }
        }
    }

    // Get Full Details for Editing
    public function get_package_full_details($request) {
        $id = $request->get_param('id');
        $package = $this->get_record_by_id_or_uuid($id);
        if (!$package) return new WP_REST_Response(['message' => 'Not Found'], 404);

        // Fetch Hotels
        $hotels = $this->db->get_results($this->db->prepare(
            "SELECT ph.*, mh.name as hotel_name, mh.rating, mh.city as hotel_city 
             FROM {$this->db->prefix}umh_package_hotels ph
             JOIN {$this->db->prefix}umh_master_hotels mh ON ph.hotel_id = mh.id
             WHERE ph.package_id = %d",
            $package->id
        ));

        // Fetch Itinerary
        $itineraries = $this->db->get_results($this->db->prepare(
            "SELECT * FROM {$this->db->prefix}umh_package_itineraries WHERE package_id = %d ORDER BY day_number ASC",
            $package->id
        ));

        $data = (array) $package;
        $data['hotels'] = $hotels;
        $data['itineraries'] = $itineraries;

        return new WP_REST_Response(['success' => true, 'data' => $data], 200);
    }
    
    private function get_record_by_id_or_uuid($id) {
        if (is_numeric($id)) return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
        return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE uuid = %s", $id));
    }
}