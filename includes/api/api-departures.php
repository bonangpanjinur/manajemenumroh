<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Departures extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_departures');
    }

    public function get_items($request) {
        $params = $request->get_params();
        $page = isset($params['page']) ? intval($params['page']) : 1;
        $per_page = isset($params['per_page']) ? intval($params['per_page']) : 10;
        $offset = ($page - 1) * $per_page;

        $pkg_table = $this->db->prefix . 'umh_packages';
        $air_table = $this->db->prefix . 'umh_master_airlines';
        
        $query = "SELECT d.*, p.name as package_name, a.name as airline_name 
                  FROM {$this->table_name} d
                  LEFT JOIN {$pkg_table} p ON d.package_id = p.id
                  LEFT JOIN {$air_table} a ON d.airline_id = a.id
                  WHERE d.deleted_at IS NULL ORDER BY d.departure_date ASC";

        $total = $this->db->get_var("SELECT COUNT(*) FROM {$this->table_name} WHERE deleted_at IS NULL");
        
        $query .= $this->db->prepare(" LIMIT %d OFFSET %d", $per_page, $offset);
        $items = $this->db->get_results($query);

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
}