<?php
/**
 * API Controller: Badal Umrah
 * Endpoint Base: /wp-json/umh/v1/badal
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Badal {

    public function register_routes() {
        // 1. Get Badal Requests (User lihat history, Admin lihat semua)
        register_rest_route('umh/v1', '/badal', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_badal_list'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // 2. Submit Request Badal (User)
        register_rest_route('umh/v1', '/badal', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_badal_request'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // 3. Update Status / Assign Mutawwif (Admin)
        register_rest_route('umh/v1', '/badal/update/(?P<id>\d+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_badal_status'),
            'permission_callback' => array($this, 'admin_permissions_check'),
        ));
    }

    public function get_badal_list($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_badal_umrah';
        $user_id = get_current_user_id();
        $is_admin = current_user_can('manage_options');

        $sql = "SELECT b.*, m.name as mutawwif_name 
                FROM $table b 
                LEFT JOIN {$wpdb->prefix}umh_master_mutawwifs m ON b.assigned_mutawwif_id = m.id";

        if (!$is_admin) {
            $sql .= " WHERE b.user_id = $user_id";
        }

        $sql .= " ORDER BY b.created_at DESC";
        $results = $wpdb->get_results($sql);

        return rest_ensure_response($results);
    }

    public function create_badal_request($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_badal_umrah';
        $params = $request->get_json_params();

        if (empty($params['badal_for_name']) || empty($params['price'])) {
            return new WP_Error('missing_data', 'Nama Almarhum/Sakit dan Harga Paket wajib diisi', array('status' => 400));
        }

        $data = array(
            'user_id' => get_current_user_id(),
            'badal_for_name' => sanitize_text_field($params['badal_for_name']),
            'badal_for_gender' => isset($params['badal_for_gender']) ? $params['badal_for_gender'] : 'L',
            'badal_reason' => isset($params['badal_reason']) ? $params['badal_reason'] : 'deceased',
            'price' => floatval($params['price']),
            'status' => 'pending', // Menunggu pembayaran
            'admin_notes' => isset($params['notes']) ? sanitize_textarea_field($params['notes']) : ''
        );

        $wpdb->insert($table, $data);
        $new_id = $wpdb->insert_id;

        if ($new_id) {
            return rest_ensure_response(array('success' => true, 'id' => $new_id, 'message' => 'Permintaan Badal berhasil dibuat. Silakan lakukan pembayaran.'));
        }
        return new WP_Error('db_error', 'Gagal membuat request', array('status' => 500));
    }

    public function update_badal_status($request) {
        global $wpdb;
        $id = $request['id'];
        $table = $wpdb->prefix . 'umh_badal_umrah';
        $params = $request->get_json_params();

        $data = array();
        
        // Update Status
        if (isset($params['status'])) $data['status'] = $params['status'];
        
        // Assign Mutawwif
        if (isset($params['assigned_mutawwif_id'])) $data['assigned_mutawwif_id'] = $params['assigned_mutawwif_id'];
        
        // Tanggal Pelaksanaan
        if (isset($params['execution_date'])) $data['execution_date'] = $params['execution_date'];
        
        // Upload Sertifikat / Video (URL)
        if (isset($params['certificate_url'])) $data['certificate_url'] = $params['certificate_url'];
        if (isset($params['video_proof_url'])) $data['video_proof_url'] = $params['video_proof_url'];

        if (empty($data)) {
            return new WP_Error('no_data', 'Tidak ada data yang diupdate', array('status' => 400));
        }

        $wpdb->update($table, $data, array('id' => $id));

        return rest_ensure_response(array('success' => true, 'message' => 'Status Badal berhasil diperbarui'));
    }

    public function permissions_check() {
        return is_user_logged_in();
    }
    public function admin_permissions_check() {
        return current_user_can('manage_options');
    }
}