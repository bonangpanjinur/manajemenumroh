<?php

class UMH_API_Agents {

    public function register_routes() {
        // Admin: CRUD Agent
        register_rest_route('umh/v1', '/agents', [
            ['methods' => 'GET', 'callback' => [$this, 'get_agents'], 'permission_callback' => [$this, 'check_admin']],
            ['methods' => 'POST', 'callback' => [$this, 'create_agent'], 'permission_callback' => [$this, 'check_admin']],
        ]);
        
        register_rest_route('umh/v1', '/agents/(?P<id>\d+)', [
            ['methods' => 'PUT', 'callback' => [$this, 'update_agent'], 'permission_callback' => [$this, 'check_admin']],
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_agent'], 'permission_callback' => [$this, 'check_admin']],
        ]);

        // Agent: Profil Saya
        register_rest_route('umh/v1', '/agents/me', [
            ['methods' => 'GET', 'callback' => [$this, 'get_my_profile'], 'permission_callback' => [$this, 'check_auth']],
        ]);
    }

    public function check_admin() { return current_user_can('manage_options'); }
    public function check_auth() { return is_user_logged_in(); }

    public function get_agents($request) {
        global $wpdb;
        $sql = "SELECT * FROM {$wpdb->prefix}umh_agents WHERE deleted_at IS NULL ORDER BY created_at DESC";
        return rest_ensure_response($wpdb->get_results($sql));
    }

    public function create_agent($request) {
        global $wpdb;
        $params = $request->get_json_params();

        $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_agents WHERE code = %s", $params['code']));
        if ($exists) return new WP_Error('duplicate_code', 'Kode Agen sudah digunakan', ['status' => 400]);

        $wpdb->insert("{$wpdb->prefix}umh_agents", [
            'uuid' => wp_generate_uuid4(),
            'name' => sanitize_text_field($params['name']),
            'code' => strtoupper(sanitize_text_field($params['code'])), 
            'phone' => sanitize_text_field($params['phone']),
            'email' => sanitize_email($params['email']),
            'city' => sanitize_text_field($params['city'] ?? ''),
            'status' => 'active'
        ]);
        return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id]);
    }

    public function update_agent($request) {
        global $wpdb;
        $id = $request['id'];
        $params = $request->get_json_params();

        $data = [];
        if (isset($params['name'])) $data['name'] = sanitize_text_field($params['name']);
        if (isset($params['phone'])) $data['phone'] = sanitize_text_field($params['phone']);
        if (isset($params['email'])) $data['email'] = sanitize_email($params['email']);
        if (isset($params['city'])) $data['city'] = sanitize_text_field($params['city']);
        if (isset($params['status'])) $data['status'] = sanitize_text_field($params['status']);
        if (isset($params['bank_name'])) $data['bank_name'] = sanitize_text_field($params['bank_name']);
        if (isset($params['bank_account_number'])) $data['bank_account_number'] = sanitize_text_field($params['bank_account_number']);

        if (!empty($data)) {
            $wpdb->update("{$wpdb->prefix}umh_agents", $data, ['id' => $id]);
        }
        return rest_ensure_response(['success' => true, 'message' => 'Data agen diperbarui']);
    }

    public function delete_agent($request) {
        global $wpdb;
        $id = $request['id'];
        $wpdb->update("{$wpdb->prefix}umh_agents", ['deleted_at' => current_time('mysql'), 'status' => 'inactive'], ['id' => $id]);
        return rest_ensure_response(['success' => true, 'message' => 'Agen dinonaktifkan']);
    }

    public function get_my_profile($request) {
        global $wpdb;
        $user_id = get_current_user_id();
        
        $agent = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_agents WHERE user_id = %d AND deleted_at IS NULL", $user_id));
        
        if (!$agent) {
            return new WP_Error('not_agent', 'Akun anda tidak terdaftar sebagai Agen/Mitra', ['status' => 403]);
        }

        // Stats Logic
        $stats = $wpdb->get_row($wpdb->prepare("
            SELECT 
                COUNT(b.id) as total_bookings,
                COALESCE(SUM(c.amount), 0) as total_commission,
                COALESCE(SUM(CASE WHEN c.status = 'paid' THEN c.amount ELSE 0 END), 0) as commission_paid
            FROM {$wpdb->prefix}umh_bookings b
            LEFT JOIN {$wpdb->prefix}umh_agent_commissions c ON b.id = c.booking_id AND c.agent_id = %d
            WHERE b.agent_id = %d AND b.deleted_at IS NULL
        ", $agent->id, $agent->id));

        $agent->stats = $stats;
        
        return rest_ensure_response($agent);
    }
}