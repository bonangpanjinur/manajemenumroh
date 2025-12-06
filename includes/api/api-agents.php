<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Agents extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_agents');
    }

    public function register_routes() {
        parent::register_routes();
        register_rest_route('umh/v1', '/agent-branches', [
            'methods' => 'GET',
            'callback' => [$this, 'get_branches_list'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function get_items($request) {
        // ... (Logic Get Items sama seperti sebelumnya)
        // Saya sederhanakan disini untuk fokus ke Create/Update fix
        $params = $request->get_params();
        $search = isset($params['search']) ? sanitize_text_field($params['search']) : '';
        
        $query = "SELECT t1.*, t2.name as parent_name 
                  FROM {$this->table_name} t1
                  LEFT JOIN {$this->table_name} t2 ON t1.parent_branch_id = t2.id
                  WHERE t1.deleted_at IS NULL";
        
        if($search) $query .= " AND t1.name LIKE '%$search%'";
        
        $items = $this->db->get_results($query . " ORDER BY t1.id DESC");
        return new WP_REST_Response(['success'=>true, 'data'=>$items], 200);
    }

    public function create_item($request) {
        $data = $request->get_json_params();
        
        // FIX CRITICAL: Pastikan parent_branch_id adalah integer atau 1 (Default Pusat)
        if ($data['type'] === 'agent') {
            $data['parent_branch_id'] = !empty($data['parent_branch_id']) ? intval($data['parent_branch_id']) : 1;
        } else {
            $data['parent_branch_id'] = 0; // Branch tidak punya parent (atau bisa null)
        }

        if (empty($data['code'])) {
            $prefix = ($data['type'] === 'branch') ? 'BR' : 'AG';
            $data['code'] = $prefix . '-' . strtoupper(substr(md5(time()), 0, 5));
        }

        // Cek duplikat
        $exists = $this->db->get_var($this->db->prepare("SELECT id FROM {$this->table_name} WHERE code = %s", $data['code']));
        if ($exists) return new WP_REST_Response(['message' => 'Kode Agen sudah ada.'], 400);

        $request->set_body_params($data);
        return parent::create_item($request);
    }

    public function update_item($request) {
        $data = $request->get_json_params();
        // FIX CRITICAL untuk Update juga
        if (isset($data['parent_branch_id'])) {
            $data['parent_branch_id'] = !empty($data['parent_branch_id']) ? intval($data['parent_branch_id']) : 1;
        }
        $request->set_body_params($data);
        return parent::update_item($request);
    }

    public function get_branches_list($request) {
        // Ambil ID 1 (Pusat - Hardcoded Logic jika belum ada di tabel agent sebagai record)
        $branches = $this->db->get_results("SELECT id, name, city FROM {$this->table_name} WHERE type = 'branch' AND deleted_at IS NULL");
        return new WP_REST_Response(['success' => true, 'data' => $branches], 200);
    }
}