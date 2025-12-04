<?php
/**
 * API Handler untuk Activity Logs (Audit Trail)
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Logs {
    private $table_name;
    private $table_users;

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_activity_logs';
        $this->table_users = $wpdb->prefix . 'umh_users';
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/logs', [
            'methods' => 'GET', 
            'callback' => [$this, 'get_logs'], 
            'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    public function get_logs($request) {
        global $wpdb;
        
        $page = $request->get_param('page') ? intval($request->get_param('page')) : 1;
        $per_page = 20;
        $offset = ($page - 1) * $per_page;

        // Join ke tabel custom users untuk dapat nama user
        $sql = "SELECT l.*, u.username, u.full_name 
                FROM {$this->table_name} l
                LEFT JOIN {$this->table_users} u ON l.user_id = u.id
                ORDER BY l.created_at DESC 
                LIMIT $per_page OFFSET $offset";
                
        $items = $wpdb->get_results($sql);
        
        $total = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name}");

        return new WP_REST_Response([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'total' => (int)$total,
                'per_page' => $per_page,
                'current_page' => $page
            ]
        ], 200);
    }
    
    // Helper function untuk mencatat log dari controller lain (Static)
    // Cara pakai: UMH_API_Logs::log(1, 'create_booking', 'Booking #123 dibuat');
    public static function log($user_id, $action, $details = '') {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_activity_logs';
        $wpdb->insert($table, [
            'user_id' => $user_id,
            'action' => $action,
            'details' => $details,
            'created_at' => current_time('mysql')
        ]);
    }
}