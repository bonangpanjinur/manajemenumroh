<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Tasks extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_tasks');
    }

    public function register_routes() {
        parent::register_routes();
        
        // Endpoint: Assign Task to User
        register_rest_route('umh/v1', '/tasks/(?P<id>[a-zA-Z0-9-]+)/assign', [
            'methods' => 'POST',
            'callback' => [$this, 'assign_task'],
            'permission_callback' => '__return_true',
        ]);
        
        // Endpoint: Update Status
        register_rest_route('umh/v1', '/tasks/(?P<id>[a-zA-Z0-9-]+)/status', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_task_status'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function assign_task($request) {
        $id = $request->get_param('id');
        $params = $request->get_json_params();
        
        if (empty($params['assigned_to'])) {
            return new WP_REST_Response(['message' => 'User ID wajib diisi'], 400);
        }

        $task = $this->get_record_by_id_or_uuid($id);
        if (!$task) return new WP_REST_Response(['message' => 'Task not found'], 404);

        $this->db->update($this->table_name, 
            ['assigned_to' => $params['assigned_to']], 
            ['id' => $task->id]
        );

        return new WP_REST_Response(['success' => true, 'message' => 'Tugas berhasil ditugaskan'], 200);
    }

    public function update_task_status($request) {
        $id = $request->get_param('id');
        $params = $request->get_json_params();
        
        if (empty($params['status'])) {
            return new WP_REST_Response(['message' => 'Status wajib diisi'], 400);
        }

        $task = $this->get_record_by_id_or_uuid($id);
        if (!$task) return new WP_REST_Response(['message' => 'Task not found'], 404);

        $this->db->update($this->table_name, 
            ['status' => sanitize_text_field($params['status'])], 
            ['id' => $task->id]
        );

        return new WP_REST_Response(['success' => true, 'message' => 'Status tugas diperbarui'], 200);
    }

    // Override get_items untuk join dengan nama user
    public function get_items($request) {
        $params = $request->get_params();
        $page = isset($params['page']) ? intval($params['page']) : 1;
        $per_page = isset($params['per_page']) ? intval($params['per_page']) : 10;
        $offset = ($page - 1) * $per_page;

        $user_table = $this->db->prefix . 'umh_users';
        
        $query = "SELECT t.*, u.username as assigned_user_name 
                  FROM {$this->table_name} t
                  LEFT JOIN {$user_table} u ON t.assigned_to = u.id
                  WHERE t.deleted_at IS NULL ORDER BY t.created_at DESC";

        $total_query = "SELECT COUNT(*) FROM {$this->table_name} WHERE deleted_at IS NULL";
        $total_items = $this->db->get_var($total_query);
        
        $query .= $this->db->prepare(" LIMIT %d OFFSET %d", $per_page, $offset);
        $items = $this->db->get_results($query);

        return new WP_REST_Response([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'page' => $page,
                'per_page' => $per_page,
                'total_items' => intval($total_items),
                'total_pages' => ceil($total_items / $per_page)
            ]
        ], 200);
    }

    private function get_record_by_id_or_uuid($id) {
        if (is_numeric($id)) {
            return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
        } else {
            return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE uuid = %s", $id));
        }
    }
}