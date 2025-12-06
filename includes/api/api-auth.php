<?php

class UMH_API_Auth {

    public function register_routes() {
        register_rest_route('umh/v1', '/auth/login', [
            ['methods' => 'POST', 'callback' => [$this, 'login'], 'permission_callback' => '__return_true'],
        ]);

        register_rest_route('umh/v1', '/auth/logout', [
            ['methods' => 'POST', 'callback' => [$this, 'logout'], 'permission_callback' => '__return_true'],
        ]);

        register_rest_route('umh/v1', '/auth/me', [
            ['methods' => 'GET', 'callback' => [$this, 'get_current_user'], 'permission_callback' => 'is_user_logged_in'],
        ]);
    }

    public function login($request) {
        $params = $request->get_json_params();
        $username = sanitize_text_field($params['username']);
        $password = $params['password']; // Jangan sanitize password

        if (empty($username) || empty($password)) {
            return new WP_Error('missing_credentials', 'Username dan Password wajib diisi', ['status' => 400]);
        }

        // Login menggunakan fungsi WordPress
        $creds = [
            'user_login'    => $username,
            'user_password' => $password,
            'remember'      => true
        ];

        $user = wp_signon($creds, false);

        if (is_wp_error($user)) {
            return new WP_Error('invalid_login', 'Username atau Password salah.', ['status' => 401]);
        }

        // Set Auth Cookie (Penting untuk API calls selanjutnya)
        wp_set_current_user($user->ID);
        wp_set_auth_cookie($user->ID, true);

        return $this->get_user_response($user->ID);
    }

    public function logout() {
        wp_logout();
        return rest_ensure_response(['success' => true, 'message' => 'Berhasil logout']);
    }

    public function get_current_user() {
        return $this->get_user_response(get_current_user_id());
    }

    private function get_user_response($user_id) {
        global $wpdb;
        $user = get_userdata($user_id);
        
        // Tentukan Role Custom
        $role = 'jamaah'; // Default
        $context_id = null; // ID Jamaah atau ID Agen

        if (in_array('administrator', $user->roles)) {
            $role = 'administrator';
        } else {
            // Cek apakah Agen
            $agent = $wpdb->get_row($wpdb->prepare("SELECT id, name FROM {$wpdb->prefix}umh_agents WHERE user_id = %d", $user_id));
            if ($agent) {
                $role = 'agent';
                $context_id = $agent->id;
            } else {
                // Cek apakah Cabang (User manager cabang)
                // (Logika cabang bisa ditambahkan di sini)
                
                // Cek Jamaah
                $jamaah = $wpdb->get_row($wpdb->prepare("SELECT id, full_name FROM {$wpdb->prefix}umh_jamaah WHERE user_id = %d", $user_id));
                if ($jamaah) {
                    $role = 'jamaah';
                    $context_id = $jamaah->id;
                }
            }
        }

        return rest_ensure_response([
            'id' => $user_id,
            'username' => $user->user_login,
            'display_name' => $user->display_name,
            'email' => $user->user_email,
            'role' => $role,
            'context_id' => $context_id, // ID Agent atau ID Jamaah
            'avatar' => get_avatar_url($user_id)
        ]);
    }
}