<?php
/**
 * API Handler untuk Manajemen Role & Capabilities
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Roles {
    private $table_name;

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_roles';
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/roles', [
            'methods' => 'GET', 'callback' => [$this, 'get_roles'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/roles', [
            'methods' => 'POST', 'callback' => [$this, 'create_role'], 'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    public function get_roles($request) {
        global $wpdb;
        $items = $wpdb->get_results("SELECT * FROM {$this->table_name}");
        // Decode JSON capabilities
        foreach ($items as $item) {
            $item->capabilities = json_decode($item->capabilities);
        }
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function create_role($request) {
        global $wpdb;
        $p = $request->get_json_params();
        
        $wpdb->insert($this->table_name, [
            'role_key' => sanitize_title($p['role_name']),
            'role_name' => sanitize_text_field($p['role_name']),
            'capabilities' => json_encode($p['capabilities'] ?? []) // Array of permissions
        ]);
        
        return new WP_REST_Response(['success' => true, 'id' => $wpdb->insert_id], 201);
    }
}