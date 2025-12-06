<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Agents extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_agents');
    }

    public function register_routes() {
        parent::register_routes();

        // Endpoint khusus ambil daftar cabang (untuk dropdown parent)
        register_rest_route('umh/v1', '/agent-branches', [
            'methods' => 'GET',
            'callback' => [$this, 'get_branches_list'],
            'permission_callback' => '__return_true',
        ]);
    }

    // Override Get Items untuk Join Nama Parent
    public function get_items($request) {
        $params = $request->get_params();
        $page = isset($params['page']) ? intval($params['page']) : 1;
        $per_page = isset($params['per_page']) ? intval($params['per_page']) : 10;
        $search = isset($params['search']) ? sanitize_text_field($params['search']) : '';
        $offset = ($page - 1) * $per_page;

        $table = $this->table_name;
        $where = "WHERE t1.deleted_at IS NULL";

        if (!empty($search)) {
            $where .= " AND (t1.name LIKE '%$search%' OR t1.code LIKE '%$search%' OR t1.email LIKE '%$search%')";
        }

        // Self Join untuk ambil nama Parent Branch
        $query = "SELECT t1.*, t2.name as parent_name 
                  FROM $table t1
                  LEFT JOIN $table t2 ON t1.parent_branch_id = t2.id
                  $where
                  ORDER BY t1.created_at DESC
                  LIMIT %d OFFSET %d";

        $items = $this->db->get_results($this->db->prepare($query, $per_page, $offset));
        
        $total = $this->db->get_var("SELECT COUNT(*) FROM $table t1 $where");

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

    // Override Create: Auto-Generate Kode Unik & Validasi Parent
    public function create_item($request) {
        $data = $request->get_json_params();
        
        // Validasi: Agen Reguler WAJIB punya Parent (Pusat atau Cabang)
        if ($data['type'] === 'agent' && empty($data['parent_branch_id'])) {
            // Jika kosong, default ke ID 1 (biasanya Kantor Pusat) jika ada, atau return error
            // Disini kita set default ke 1 (Pusat) agar aman, tapi idealnya user milih
            $data['parent_branch_id'] = 1; 
        }

        // Generate Kode: HQ (Pusat), BR (Cabang), AG (Agen)
        if (empty($data['code'])) {
            $prefix = ($data['type'] === 'branch') ? 'BR' : 'AG';
            $data['code'] = $prefix . '-' . strtoupper(substr(md5(time()), 0, 5));
        }

        // Cek duplikasi kode
        $exists = $this->db->get_var($this->db->prepare("SELECT id FROM {$this->table_name} WHERE code = %s", $data['code']));
        if ($exists) {
            return new WP_REST_Response(['message' => 'Kode Agen sudah digunakan.'], 400);
        }

        $request->set_body_params($data);
        return parent::create_item($request);
    }

    // Get List Cabang (Type = 'branch' or ID=1 Pusat)
    public function get_branches_list($request) {
        $branches = $this->db->get_results("SELECT id, name, code, city FROM {$this->table_name} WHERE type = 'branch' AND deleted_at IS NULL ORDER BY name ASC");
        return new WP_REST_Response(['success' => true, 'data' => $branches], 200);
    }
}