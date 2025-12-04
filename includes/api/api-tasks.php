<?php
/**
 * API Handler untuk Manajemen Tugas (Tasks)
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Tasks {
    private $table_name;

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_tasks';
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/tasks', [
            'methods' => 'GET', 'callback' => [$this, 'get_tasks'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/tasks', [
            'methods' => 'POST', 'callback' => [$this, 'create_task'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/tasks/(?P<id>\d+)', [
            'methods' => 'PUT', 'callback' => [$this, 'update_task'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/tasks/(?P<id>\d+)', [
            'methods' => 'DELETE', 'callback' => [$this, 'delete_task'], 'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    public function get_tasks($request) {
        global $wpdb;
        $employee_id = $request->get_param('employee_id');
        
        $where = "WHERE 1=1";
        if ($employee_id) {
            $where .= $wpdb->prepare(" AND assigned_to = %d", $employee_id);
        }
        
        // Join ke Employee untuk dapat nama yang ditugaskan
        $sql = "SELECT t.*, e.name as employee_name 
                FROM {$this->table_name} t
                LEFT JOIN {$wpdb->prefix}umh_hr_employees e ON t.assigned_to = e.id
                $where ORDER BY t.due_date ASC";
                
        $items = $wpdb->get_results($sql);
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function create_task($request) {
        global $wpdb;
        $p = $request->get_json_params();
        
        $wpdb->insert($this->table_name, [
            'title' => sanitize_text_field($p['title']),
            'description' => sanitize_textarea_field($p['description']),
            'assigned_to' => intval($p['assigned_to']),
            'due_date' => $p['due_date'], // YYYY-MM-DD
            'priority' => $p['priority'] ?? 'medium',
            'status' => 'pending'
        ]);
        
        return new WP_REST_Response(['success' => true, 'id' => $wpdb->insert_id], 201);
    }

    public function update_task($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $p = $request->get_json_params();
        
        // Support update status parsial (misal drag & drop di kanban board)
        $data = [];
        if (isset($p['status'])) $data['status'] = $p['status'];
        if (isset($p['priority'])) $data['priority'] = $p['priority'];
        if (isset($p['assigned_to'])) $data['assigned_to'] = $p['assigned_to'];
        
        if (!empty($data)) {
            $wpdb->update($this->table_name, $data, ['id' => $id]);
        }
        
        return new WP_REST_Response(['success' => true, 'message' => 'Task updated'], 200);
    }

    public function delete_task($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $wpdb->delete($this->table_name, ['id' => $id]);
        return new WP_REST_Response(['success' => true, 'message' => 'Task deleted'], 200);
    }
}