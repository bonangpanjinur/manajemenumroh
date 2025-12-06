<?php

class UMH_API_Users {

    public function register_routes() {
        // GET List Users
        register_rest_route('umh/v1', '/users', [
            ['methods' => 'GET', 'callback' => [$this, 'get_users'], 'permission_callback' => [$this, 'check_admin_permission']],
            ['methods' => 'POST', 'callback' => [$this, 'create_user'], 'permission_callback' => [$this, 'check_admin_permission']],
        ]);

        // GET Single User, UPDATE, DELETE
        register_rest_route('umh/v1', '/users/(?P<id>\d+)', [
            ['methods' => 'GET', 'callback' => [$this, 'get_user_detail'], 'permission_callback' => [$this, 'check_admin_permission']],
            ['methods' => 'PUT', 'callback' => [$this, 'update_user'], 'permission_callback' => [$this, 'check_admin_permission']],
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_user'], 'permission_callback' => [$this, 'check_admin_permission']],
        ]);

        // GET Current User Profile (Untuk Frontend App)
        register_rest_route('umh/v1', '/users/me', [
            ['methods' => 'GET', 'callback' => [$this, 'get_current_user_profile'], 'permission_callback' => 'is_user_logged_in'],
        ]);
    }

    public function check_admin_permission() {
        return current_user_can('manage_options'); // Hanya administrator yang bisa kelola users
    }

    // --- GET LIST USERS ---
    public function get_users($request) {
        $role = $request->get_param('role'); // Filter by role (optional)
        
        $args = [
            'orderby' => 'registered',
            'order'   => 'DESC',
            'number'  => 100, // Limit
        ];

        if ($role) {
            $args['role'] = $role;
        }

        $users = get_users($args);
        $data = [];

        foreach ($users as $user) {
            $data[] = [
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'display_name' => $user->display_name,
                'roles' => $user->roles,
                'registered_date' => $user->user_registered
            ];
        }

        return rest_ensure_response($data);
    }

    // --- GET SINGLE USER ---
    public function get_user_detail($request) {
        $id = $request['id'];
        $user = get_userdata($id);

        if (!$user) {
            return new WP_Error('not_found', 'User tidak ditemukan', ['status' => 404]);
        }

        return rest_ensure_response([
            'id' => $user->ID,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'roles' => $user->roles,
        ]);
    }

    // --- CREATE USER ---
    public function create_user($request) {
        $params = $request->get_json_params();

        // Validasi
        if (empty($params['username']) || empty($params['email']) || empty($params['password'])) {
            return new WP_Error('missing_fields', 'Username, Email, dan Password wajib diisi', ['status' => 400]);
        }

        if (username_exists($params['username'])) {
            return new WP_Error('username_exists', 'Username sudah digunakan', ['status' => 400]);
        }

        if (email_exists($params['email'])) {
            return new WP_Error('email_exists', 'Email sudah digunakan', ['status' => 400]);
        }

        // Insert User
        $user_id = wp_insert_user([
            'user_login' => sanitize_user($params['username']),
            'user_pass'  => $params['password'], // Password akan di-hash oleh WP
            'user_email' => sanitize_email($params['email']),
            'first_name' => sanitize_text_field($params['first_name'] ?? ''),
            'last_name'  => sanitize_text_field($params['last_name'] ?? ''),
            'role'       => sanitize_text_field($params['role'] ?? 'subscriber') // Default subscriber
        ]);

        if (is_wp_error($user_id)) {
            return $user_id;
        }

        return rest_ensure_response(['success' => true, 'id' => $user_id, 'message' => 'User berhasil dibuat']);
    }

    // --- UPDATE USER ---
    public function update_user($request) {
        $id = $request['id'];
        $params = $request->get_json_params();

        // Cek User Exist
        if (!get_userdata($id)) {
            return new WP_Error('not_found', 'User tidak ditemukan', ['status' => 404]);
        }

        $user_data = ['ID' => $id];

        // Update fields jika ada
        if (isset($params['email'])) {
            if (email_exists($params['email']) && email_exists($params['email']) != $id) {
                return new WP_Error('email_exists', 'Email sudah digunakan user lain', ['status' => 400]);
            }
            $user_data['user_email'] = sanitize_email($params['email']);
        }

        if (isset($params['first_name'])) $user_data['first_name'] = sanitize_text_field($params['first_name']);
        if (isset($params['last_name'])) $user_data['last_name'] = sanitize_text_field($params['last_name']);
        
        if (!empty($params['password'])) {
            $user_data['user_pass'] = $params['password'];
        }

        if (isset($params['role'])) {
            $user_data['role'] = sanitize_text_field($params['role']);
        }

        $result = wp_update_user($user_data);

        if (is_wp_error($result)) {
            return $result;
        }

        return rest_ensure_response(['success' => true, 'message' => 'User berhasil diperbarui']);
    }

    // --- DELETE USER ---
    public function delete_user($request) {
        $id = $request['id'];
        $current_user_id = get_current_user_id();

        if ($id == $current_user_id) {
            return new WP_Error('self_delete', 'Anda tidak bisa menghapus diri sendiri', ['status' => 400]);
        }

        // Hapus user dan assign kontennya ke user admin lain (opsional, disini kita hapus permanen)
        // require_once(ABSPATH.'wp-admin/includes/user.php'); // Mungkin perlu di-include
        
        if (wp_delete_user($id)) {
            return rest_ensure_response(['success' => true, 'message' => 'User berhasil dihapus']);
        } else {
            return new WP_Error('delete_failed', 'Gagal menghapus user', ['status' => 500]);
        }
    }

    // --- GET CURRENT USER PROFILE (Frontend Context) ---
    public function get_current_user_profile($request) {
        $user_id = get_current_user_id();
        $user = get_userdata($user_id);
        
        if (!$user) {
            return new WP_Error('not_logged_in', 'User tidak login', ['status' => 401]);
        }

        // Cek Konteks Tambahan (Agen / Jamaah)
        global $wpdb;
        
        // 1. Cek apakah user ini terhubung dengan data Agen
        $agent_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_agents WHERE user_id = %d AND status = 'active'", $user_id));
        
        // 2. Cek apakah user ini terhubung dengan data Jamaah
        $jamaah_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_jamaah WHERE user_id = %d", $user_id));

        // Tentukan Role Utama untuk Frontend
        $app_role = 'guest';
        if (in_array('administrator', $user->roles)) {
            $app_role = 'administrator';
        } elseif ($agent_id) {
            $app_role = 'agent';
        } elseif ($jamaah_id) {
            $app_role = 'jamaah';
        } else {
            $app_role = 'subscriber'; // Fallback
        }

        return rest_ensure_response([
            'id' => $user_id,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'display_name' => $user->display_name,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'roles' => $user->roles,
            'app_role' => $app_role, // Role yang disederhanakan untuk frontend logic
            'agent_id' => $agent_id ? (int)$agent_id : null,
            'jamaah_id' => $jamaah_id ? (int)$jamaah_id : null,
            'avatar_url' => get_avatar_url($user_id)
        ]);
    }
}