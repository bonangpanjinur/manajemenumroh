<?php
if (!defined('ABSPATH')) {
    exit; 
}

class UMH_Users_API {
    public function __construct() {
        // 1. Setup CRUD Controller Standard
        $this->setup_crud();

        // 2. Register Custom Routes (Auth)
        add_action('rest_api_init', [$this, 'register_auth_routes']);
        
        // 3. Hooks Hashing
        add_filter('umh_crud_users_before_create', [$this, 'hash_password'], 10, 2);
        add_filter('umh_crud_users_before_update', [$this, 'hash_password'], 10, 2);
    }

    private function setup_crud() {
        // Menambahkan 'username' ke skema agar bisa disimpan ke database
        $schema = [
            'username'    => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'email'       => ['type' => 'string', 'required' => true, 'format' => 'email', 'sanitize_callback' => 'sanitize_email'],
            'full_name'   => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'role'        => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'phone'       => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
            'status'      => ['type' => 'string', 'default' => 'active', 'sanitize_callback' => 'sanitize_text_field'],
            'password'    => ['type' => 'string', 'required' => false], 
        ];

        $permissions = [
            'get_items'    => ['owner', 'admin_staff', 'hr_staff'],
            'get_item'     => ['owner', 'admin_staff', 'hr_staff'],
            'create_item'  => ['owner', 'admin_staff'],
            'update_item'  => ['owner', 'admin_staff'],
            'delete_item'  => ['owner'],
        ];

        // Instansiasi Controller
        new UMH_CRUD_Controller(
            'users',            // Base: umh/v1/users
            'umh_users',        // Table
            $schema,       
            $permissions,  
            ['full_name', 'email', 'phone', 'username'] // Searchable
        );
    }

    public function register_auth_routes() {
        $namespace = 'umh/v1';

        // Login
        register_rest_route($namespace, '/auth/login', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_login'],
            'permission_callback' => '__return_true', 
        ]);

        // Sync WP Admin
        register_rest_route($namespace, '/auth/wp-login', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_wp_admin_login'],
            'permission_callback' => function() { return current_user_can('read'); }, 
        ]);
    }

    public function hash_password($data, $request) {
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password_hash'] = wp_hash_password($data['password']);
        }
        unset($data['password']); // Jangan simpan plaintext
        return $data;
    }

    public function handle_login($request) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'umh_users';
        
        $params = $request->get_json_params();
        $email = sanitize_email($params['email']); // Bisa email atau username
        $password = $params['password'];

        if (empty($email) || empty($password)) {
            return new WP_Error('missing_credentials', 'Email/Username dan password wajib diisi.', ['status' => 400]);
        }

        // Support login by email OR username
        $user = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE email = %s OR username = %s", 
            $email, $email
        ));

        if (!$user) {
            return new WP_Error('invalid_user', 'User tidak ditemukan.', ['status' => 403]);
        }

        if (!wp_check_password($password, $user->password_hash, $user->id)) {
            return new WP_Error('invalid_password', 'Password salah.', ['status' => 403]);
        }

        if ($user->status !== 'active') {
            return new WP_Error('inactive_user', 'Akun dinonaktifkan.', ['status' => 403]);
        }

        // Generate Token Sederhana
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+7 days'));
        
        $wpdb->update($table_name, [
            'auth_token' => $token,
            'token_expires' => $expires
        ], ['id' => $user->id]);

        return rest_ensure_response([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->full_name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role
            ]
        ]);
    }

    public function handle_wp_admin_login($request) {
        $current_user = wp_get_current_user();
        return rest_ensure_response([
            'user' => [
                'id' => $current_user->ID,
                'name' => $current_user->display_name,
                'email' => $current_user->user_email,
                'username' => $current_user->user_login,
                'role' => 'super_admin'
            ]
        ]);
    }
}

new UMH_Users_API();