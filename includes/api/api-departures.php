<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Departures extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_departures');
    }

    /**
     * Override get_items untuk melakukan JOIN ke tabel Packages dan Airlines.
     * UPDATE: Tambahkan pencarian berdasarkan Tour Leader & Muthawif
     */
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
            // Cari berdasarkan Flight, Paket, Tour Leader, atau Muthawif
            $where .= " AND (
                d.flight_number_depart LIKE '%$search%' 
                OR p.name LIKE '%$search%'
                OR d.tour_leader_name LIKE '%$search%'
                OR d.muthawif_name LIKE '%$search%'
            )";
        }

        // Query JOIN Powerfull
        $query = "SELECT d.*, 
                         p.name as package_name, 
                         p.duration_days,
                         a.name as airline_name, 
                         a.code as airline_code,
                         a.logo_url as airline_logo
                  FROM $t_dep d
                  LEFT JOIN $t_pkg p ON d.package_id = p.id
                  LEFT JOIN $t_air a ON d.airline_id = a.id
                  $where 
                  ORDER BY d.departure_date ASC 
                  LIMIT %d OFFSET %d";

        $items = $this->db->get_results($this->db->prepare($query, $per_page, $offset));
        
        // Hitung total untuk pagination
        $total_query = "SELECT COUNT(*) FROM $t_dep d LEFT JOIN $t_pkg p ON d.package_id = p.id $where";
        $total = $this->db->get_var($total_query);

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

    // Validasi saat simpan: Pastikan ID Paket & Maskapai valid
    public function create_item($request) {
        $data = $request->get_json_params();
        if (empty($data['package_id'])) return new WP_REST_Response(['message' => 'Paket wajib dipilih'], 400);
        if (empty($data['airline_id'])) return new WP_REST_Response(['message' => 'Maskapai wajib dipilih'], 400);
        
        return parent::create_item($request);
    }
}