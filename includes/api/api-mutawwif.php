<?php
/**
 * API Controller: Manajemen Mutawwif
 * Endpoint Base: /wp-json/umh/v1/mutawwif
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Mutawwif {

    public function register_routes() {
        // 1. Get List Mutawwif (Public/Admin)
        register_rest_route('umh/v1', '/mutawwif', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_mutawwifs'),
            'permission_callback' => '__return_true', 
        ));

        // 2. Create/Register Mutawwif (Admin)
        register_rest_route('umh/v1', '/mutawwif', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_mutawwif'),
            'permission_callback' => array($this, 'admin_permissions_check'),
        ));

        // 3. Update Mutawwif (Admin)
        register_rest_route('umh/v1', '/mutawwif/(?P<id>\d+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_mutawwif'),
            'permission_callback' => array($this, 'admin_permissions_check'),
        ));
    }

    public function get_mutawwifs($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_master_mutawwifs';
        
        $status = $request->get_param('status');
        $sql = "SELECT * FROM $table";
        
        if ($status) {
            $sql .= $wpdb->prepare(" WHERE status = %s", $status);
        }
        
        $sql .= " ORDER BY name ASC";
        $results = $wpdb->get_results($sql);
        
        return rest_ensure_response($results);
    }

    public function create_mutawwif($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_master_mutawwifs';
        $params = $request->get_json_params();

        if (empty($params['name']) || empty($params['phone'])) {
            return new WP_Error('missing_data', 'Nama dan No HP wajib diisi', array('status' => 400));
        }

        $data = array(
            'name' => sanitize_text_field($params['name']),
            'phone' => sanitize_text_field($params['phone']),
            'email' => isset($params['email']) ? sanitize_email($params['email']) : '',
            'photo_url' => isset($params['photo_url']) ? esc_url_raw($params['photo_url']) : '',
            'license_number' => isset($params['license_number']) ? sanitize_text_field($params['license_number']) : '',
            'languages' => isset($params['languages']) ? sanitize_text_field($params['languages']) : 'Indonesia',
            'specialization' => isset($params['specialization']) ? sanitize_text_field($params['specialization']) : '',
            'base_location' => isset($params['base_location']) ? $params['base_location'] : 'Indonesia',
            'experience_years' => isset($params['experience_years']) ? intval($params['experience_years']) : 1,
            'status' => 'active'
        );

        $wpdb->insert($table, $data);
        $new_id = $wpdb->insert_id;

        if ($new_id) {
            return rest_ensure_response(array('success' => true, 'id' => $new_id, 'message' => 'Mutawwif berhasil didaftarkan'));
        }
        return new WP_Error('db_error', 'Gagal menyimpan data', array('status' => 500));
    }

    public function update_mutawwif($request) {
        global $wpdb;
        $id = $request['id'];
        $table = $wpdb->prefix . 'umh_master_mutawwifs';
        $params = $request->get_json_params();

        // Filter data yang boleh diupdate
        $allowed_keys = ['name', 'phone', 'email', 'photo_url', 'license_number', 'languages', 'specialization', 'base_location', 'experience_years', 'status', 'rating'];
        $data = array();

        foreach ($allowed_keys as $key) {
            if (isset($params[$key])) {
                $data[$key] = $params[$key];
            }
        }

        if (empty($data)) {
            return new WP_Error('no_data', 'Tidak ada data update', array('status' => 400));
        }

        $updated = $wpdb->update($table, $data, array('id' => $id));

        if ($updated !== false) {
            return rest_ensure_response(array('success' => true, 'message' => 'Data Mutawwif diperbarui'));
        }
        return new WP_Error('db_error', 'Gagal update data', array('status' => 500));
    }

    public function admin_permissions_check() {
        return current_user_can('manage_options');
    }
}