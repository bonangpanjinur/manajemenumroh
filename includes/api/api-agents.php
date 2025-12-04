<?php
/**
 * API Handler untuk Manajemen Agen (Hierarki & Komisi)
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Agents {
    private $table_name;
    private $table_users;

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_agents';
        $this->table_users = $wpdb->prefix . 'umh_users';
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/agents', [
            'methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/agents/(?P<id>\d+)', [
            'methods' => 'GET', 'callback' => [$this, 'get_item'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/agents', [
            'methods' => 'POST', 'callback' => [$this, 'create_item'], 'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    public function get_items($request) {
        global $wpdb;
        // Ambil data agen beserta nama Upline-nya (Self Join)
        $sql = "SELECT a.*, u.full_name as agent_name, u.email, p_user.full_name as upline_name 
                FROM {$this->table_name} a
                LEFT JOIN {$this->table_users} u ON a.umh_user_id = u.id
                LEFT JOIN {$this->table_name} parent ON a.parent_agent_id = parent.id
                LEFT JOIN {$this->table_users} p_user ON parent.umh_user_id = p_user.id
                ORDER BY a.joined_date DESC";
        
        $items = $wpdb->get_results($sql);
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function create_item($request) {
        global $wpdb;
        $p = $request->get_json_params();

        // 1. Validasi User ID (Harus sudah ada di umh_users)
        if (empty($p['umh_user_id'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'User ID wajib diisi'], 400);
        }

        // 2. Insert Data Agen
        $data = [
            'umh_user_id' => intval($p['umh_user_id']),
            'branch_id' => intval($p['branch_id'] ?? 0),
            'parent_agent_id' => !empty($p['parent_agent_id']) ? intval($p['parent_agent_id']) : null,
            'level' => !empty($p['parent_agent_id']) ? 'sub' : 'master', // Otomatis tentukan level
            'commission_type' => $p['commission_type'] ?? 'fixed',
            'commission_value' => floatval($p['commission_value']),
            'bank_details' => sanitize_textarea_field($p['bank_details']),
            'status' => 'pending',
            'joined_date' => current_time('mysql')
        ];

        $wpdb->insert($this->table_name, $data);
        
        if ($wpdb->last_error) {
            return new WP_REST_Response(['success' => false, 'message' => $wpdb->last_error], 500);
        }

        return new WP_REST_Response(['success' => true, 'id' => $wpdb->insert_id], 201);
    }
    
    public function get_item($request) {
        global $wpdb;
        $id = $request->get_param('id');
        // Get single agent logic here...
        // Simplified for brevity
        return new WP_REST_Response(['success' => true, 'data' => []], 200);
    }
}