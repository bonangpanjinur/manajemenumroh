<?php

class UMH_API_Jamaah {

    public function register_routes() {
        register_rest_route('umh/v1', '/jamaah', [
            ['methods' => 'GET', 'callback' => [$this, 'get_jamaah'], 'permission_callback' => [$this, 'check_auth']],
            ['methods' => 'POST', 'callback' => [$this, 'create_jamaah'], 'permission_callback' => [$this, 'check_create_permission']], 
        ]);

        register_rest_route('umh/v1', '/jamaah/(?P<id>\d+)', [
            ['methods' => 'GET', 'callback' => [$this, 'get_jamaah_detail'], 'permission_callback' => [$this, 'check_read_single_permission']],
            ['methods' => 'PUT', 'callback' => [$this, 'update_jamaah'], 'permission_callback' => [$this, 'check_owner_permission']],
        ]);

        register_rest_route('umh/v1', '/jamaah/register', [
            ['methods' => 'POST', 'callback' => [$this, 'public_register'], 'permission_callback' => '__return_true'],
        ]);
    }

    public function check_auth() { return is_user_logged_in(); }
    public function check_create_permission() { return current_user_can('edit_posts') || is_user_logged_in(); }
    
    public function check_read_single_permission($request) {
        if (current_user_can('manage_options')) return true;
        global $wpdb;
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        // Cek Self
        $is_self = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_jamaah WHERE id = %d AND user_id = %d", $id, $user_id));
        if ($is_self) return true;

        // Cek Agent's Lead
        $agent_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_agents WHERE user_id = %d", $user_id));
        if ($agent_id) {
            $is_my_lead = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_jamaah WHERE id = %d AND sales_agent_id = %d", $id, $agent_id));
            if ($is_my_lead) return true;
        }
        return false;
    }

    public function check_owner_permission($request) {
        return $this->check_read_single_permission($request);
    }

    // --- GET ---
    public function get_jamaah($request) {
        global $wpdb;
        $user_id = get_current_user_id();
        $is_admin = current_user_can('manage_options');
        
        $sql = "SELECT * FROM {$wpdb->prefix}umh_jamaah WHERE deleted_at IS NULL";
        
        if (!$is_admin) {
            $agent_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_agents WHERE user_id = %d", $user_id));
            if ($agent_id) {
                $sql .= $wpdb->prepare(" AND sales_agent_id = %d", $agent_id);
            } else {
                $sql .= $wpdb->prepare(" AND user_id = %d", $user_id);
            }
        }

        if ($search = $request->get_param('search')) {
            $term = '%' . $wpdb->esc_like($search) . '%';
            $sql .= $wpdb->prepare(" AND (full_name LIKE %s OR passport_number LIKE %s)", $term, $term);
        }
        
        $sql .= " ORDER BY created_at DESC";
        return rest_ensure_response($wpdb->get_results($sql));
    }

    public function get_jamaah_detail($request) {
        global $wpdb;
        $id = $request['id'];
        $jamaah = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_jamaah WHERE id = %d", $id));
        
        if (!$jamaah) return new WP_Error('not_found', 'Data tidak ditemukan', ['status' => 404]);

        // Get Docs
        $jamaah->documents = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_jamaah_documents WHERE jamaah_id = %d", $id));
        
        return rest_ensure_response($jamaah);
    }

    // --- CREATE ---
    public function create_jamaah($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $user_id = get_current_user_id();
        
        $agent_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_agents WHERE user_id = %d", $user_id));

        $wpdb->insert("{$wpdb->prefix}umh_jamaah", [
            'uuid' => wp_generate_uuid4(),
            'full_name' => sanitize_text_field($params['full_name']),
            'nik' => sanitize_text_field($params['nik']),
            'phone' => sanitize_text_field($params['phone']),
            'email' => sanitize_email($params['email']),
            'address' => sanitize_textarea_field($params['address']),
            'gender' => sanitize_text_field($params['gender'] ?? 'L'),
            'sales_agent_id' => $agent_id ? $agent_id : 0,
            'status' => 'registered'
        ]);

        return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id]);
    }

    public function public_register($request) {
        global $wpdb;
        $params = $request->get_json_params();
        
        if (empty($params['full_name']) || empty($params['phone'])) {
            return new WP_Error('missing_data', 'Nama dan No HP wajib diisi', ['status' => 400]);
        }

        $wpdb->insert("{$wpdb->prefix}umh_jamaah", [
            'uuid' => wp_generate_uuid4(),
            'full_name' => sanitize_text_field($params['full_name']),
            'phone' => sanitize_text_field($params['phone']),
            'email' => sanitize_email($params['email'] ?? ''),
            'status' => 'lead',
            'created_at' => current_time('mysql')
        ]);
        
        return rest_ensure_response(['success' => true, 'message' => 'Terima kasih, data anda telah kami terima.']);
    }

    // --- UPDATE ---
    public function update_jamaah($request) {
        global $wpdb;
        $id = $request['id'];
        $params = $request->get_json_params();
        $is_admin = current_user_can('manage_options');

        $data = [];
        if (isset($params['full_name'])) $data['full_name'] = sanitize_text_field($params['full_name']);
        if (isset($params['nik'])) $data['nik'] = sanitize_text_field($params['nik']);
        if (isset($params['passport_number'])) $data['passport_number'] = sanitize_text_field($params['passport_number']);
        if (isset($params['phone'])) $data['phone'] = sanitize_text_field($params['phone']);
        if (isset($params['email'])) $data['email'] = sanitize_email($params['email']);
        if (isset($params['address'])) $data['address'] = sanitize_textarea_field($params['address']);
        
        if ($is_admin) {
            if (isset($params['status'])) $data['status'] = sanitize_text_field($params['status']);
            if (isset($params['sales_agent_id'])) $data['sales_agent_id'] = intval($params['sales_agent_id']);
        }

        $data['updated_at'] = current_time('mysql');

        if (!empty($data)) {
            $wpdb->update("{$wpdb->prefix}umh_jamaah", $data, ['id' => $id]);
        }

        return rest_ensure_response(['success' => true, 'message' => 'Data jamaah diperbarui']);
    }
}