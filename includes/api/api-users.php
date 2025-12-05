<?php
defined('ABSPATH') || exit;

class UMH_API_Users {
    public function register_routes() {
        register_rest_route('umh/v1', '/users', [
            'methods' => ['GET', 'POST'],
            'callback' => [$this, 'handle_users'],
            'permission_callback' => function() { return current_user_can('create_users'); }
        ]);
        
        register_rest_route('umh/v1', '/users/(?P<id>\d+)', [
            'methods' => ['PUT', 'DELETE'],
            'callback' => [$this, 'handle_single_user'],
            'permission_callback' => function() { return current_user_can('edit_users'); }
        ]);
    }

    public function handle_users($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_users';

        if ($request->get_method() === 'POST') {
            $data = $request->get_json_params();
            
            // Validasi Wajib
            if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
                return new WP_Error('missing_fields', 'Username, Email, dan Password wajib diisi', ['status' => 400]);
            }

            // Hash Password (SECURITY)
            $password_hash = wp_hash_password($data['password']);

            $insert_data = [
                'username' => sanitize_user($data['username']),
                'email' => sanitize_email($data['email']),
                'password_hash' => $password_hash,
                'role' => sanitize_text_field($data['role'] ?? 'subscriber'),
                'status' => 'active',
                'created_at' => current_time('mysql')
            ];

            $wpdb->insert($table, $insert_data);
            
            if ($wpdb->last_error) {
                return new WP_Error('db_error', $wpdb->last_error, ['status' => 500]);
            }

            return ['id' => $wpdb->insert_id, 'message' => 'User Created'];
        }

        // GET logic (Pagination supported)
        $limit = 20;
        $items = $wpdb->get_results("SELECT id, username, email, role, status, created_at FROM $table ORDER BY created_at DESC LIMIT $limit");
        return ['items' => $items];
    }

    public function handle_single_user($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_users';
        $id = $request['id'];

        if ($request->get_method() === 'DELETE') {
            $wpdb->delete($table, ['id' => $id]);
            return ['success' => true];
        }

        if ($request->get_method() === 'PUT') {
            $data = $request->get_json_params();
            $update_data = [];

            if (!empty($data['email'])) $update_data['email'] = sanitize_email($data['email']);
            if (!empty($data['role'])) $update_data['role'] = sanitize_text_field($data['role']);
            if (!empty($data['status'])) $update_data['status'] = sanitize_text_field($data['status']);
            
            // Hanya update password jika dikirim (tidak kosong)
            if (!empty($data['password'])) {
                $update_data['password_hash'] = wp_hash_password($data['password']);
            }

            if (!empty($update_data)) {
                $wpdb->update($table, $update_data, ['id' => $id]);
            }
            return ['success' => true];
        }
    }
}