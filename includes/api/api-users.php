<?php
/**
 * API Handler untuk Custom User Management (umh_users)
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Users {
    private $table_name;

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_users';
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/users', [
            'methods' => 'GET', 'callback' => [$this, 'get_users'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/users', [
            'methods' => 'POST', 'callback' => [$this, 'create_user'], 'permission_callback' => [$this, 'check_permission']
        ]);
        // Endpoint Login Khusus (Mengembalikan Token)
        register_rest_route('umh/v1', '/auth/login', [
            'methods' => 'POST', 'callback' => [$this, 'login_user'], 'permission_callback' => '__return_true' // Public
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    public function get_users($request) {
        global $wpdb;
        // Jangan return password hash!
        $items = $wpdb->get_results("SELECT id, username, email, full_name, role_key, status, created_at FROM {$this->table_name}");
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function create_user($request) {
        global $wpdb;
        $p = $request->get_json_params();
        
        // Hash Password
        $password_hash = password_hash($p['password'], PASSWORD_BCRYPT);
        
        $wpdb->insert($this->table_name, [
            'username' => sanitize_text_field($p['username']),
            'email' => sanitize_email($p['email']),
            'password_hash' => $password_hash,
            'full_name' => sanitize_text_field($p['full_name']),
            'role_key' => $p['role_key'] ?? 'subscriber',
            'status' => 'active'
        ]);
        
        if ($wpdb->last_error) return new WP_REST_Response(['success' => false, 'message' => $wpdb->last_error], 400);
        
        return new WP_REST_Response(['success' => true, 'id' => $wpdb->insert_id], 201);
    }
    
    public function login_user($request) {
        global $wpdb;
        $p = $request->get_json_params();
        $username = sanitize_text_field($p['username']);
        $password = $p['password'];
        
        $user = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE username = %s OR email = %s", $username, $username));
        
        if (!$user || !password_verify($password, $user->password_hash)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Username atau Password salah'], 401);
        }
        
        if ($user->status !== 'active') {
            return new WP_REST_Response(['success' => false, 'message' => 'Akun dinonaktifkan'], 403);
        }
        
        // Generate Token Sederhana (Idealnya pakai JWT, tapi ini random string cukup untuk internal)
        $token = bin2hex(random_bytes(32));
        $expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        $wpdb->update($this->table_name, ['auth_token' => $token, 'token_expires' => $expiry], ['id' => $user->id]);
        
        return new WP_REST_Response([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'role' => $user->role_key
            ]
        ], 200);
    }
}