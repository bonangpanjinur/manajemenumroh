<?php
defined('ABSPATH') || exit;

class UMH_API_Bookings {
    public function register_routes() {
        $base = 'umh/v1';
        $endpoint = '/bookings';

        register_rest_route($base, $endpoint, [
            'methods' => 'GET',
            'callback' => [$this, 'get_items'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);

        register_rest_route($base, $endpoint, [
            'methods' => 'POST',
            'callback' => [$this, 'create_item'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);

        register_rest_route($base, $endpoint . '/(?P<id>\d+)', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_item'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);
        
        register_rest_route($base, $endpoint . '/(?P<id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'delete_item'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);
    }

    public function get_items($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_bookings';
        
        $page = isset($request['page']) ? intval($request['page']) : 1;
        $per_page = isset($request['per_page']) ? intval($request['per_page']) : 10;
        $offset = ($page - 1) * $per_page;
        $search = isset($request['search']) ? sanitize_text_field($request['search']) : '';

        // JOIN LENGKAP
        $query = "SELECT b.*, 
                  p.name as package_name, 
                  d.departure_date, 
                  d.return_date
                  FROM $table b
                  LEFT JOIN {$wpdb->prefix}umh_packages p ON b.package_id = p.id
                  LEFT JOIN {$wpdb->prefix}umh_departures d ON b.departure_id = d.id
                  WHERE 1=1";

        if (!empty($search)) {
            $query .= $wpdb->prepare(" AND (b.booking_code LIKE %s OR b.contact_name LIKE %s)", "%$search%", "%$search%");
        }

        $query .= " ORDER BY b.created_at DESC LIMIT $offset, $per_page";

        $items = $wpdb->get_results($query);
        $total_items = $wpdb->get_var("SELECT COUNT(*) FROM $table");

        return rest_ensure_response([
            'items' => $items,
            'page' => $page,
            'totalPages' => ceil($total_items / $per_page),
            'totalItems' => $total_items
        ]);
    }

    public function create_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_bookings';
        $data = $request->get_json_params();

        if (empty($data['booking_code'])) {
            $data['booking_code'] = 'BK/' . date('ym') . '/' . rand(1000, 9999);
        }

        // Sanitasi Data Lengkap Sesuai DB Schema
        $safe_data = [
            'booking_code' => sanitize_text_field($data['booking_code']),
            'contact_name' => sanitize_text_field($data['contact_name']),
            'contact_phone' => sanitize_text_field($data['contact_phone']),
            'contact_email' => sanitize_email($data['contact_email']), // Perbaikan: Field ini sebelumnya hilang
            'package_id' => intval($data['package_id']),
            'departure_id' => intval($data['departure_id']),
            'total_pax' => intval($data['total_pax']),
            'total_price' => floatval($data['total_price']),
            'payment_status' => sanitize_text_field($data['payment_status']),
            'booking_date' => $data['booking_date'],
            'notes' => sanitize_textarea_field($data['notes'] ?? ''),
            'created_at' => current_time('mysql')
        ];

        $result = $wpdb->insert($table, $safe_data);

        if ($result === false) {
            return new WP_Error('db_error', 'Gagal menyimpan booking: ' . $wpdb->last_error, ['status' => 500]);
        }

        return rest_ensure_response(['id' => $wpdb->insert_id, 'message' => 'Booking Created']);
    }

    public function update_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_bookings';
        $id = $request['id'];
        $data = $request->get_json_params();

        // Hapus field relasi virtual agar tidak error saat update
        unset($data['id'], $data['package_name'], $data['departure_date'], $data['return_date']);

        $wpdb->update($table, $data, ['id' => $id]);
        return rest_ensure_response(['success' => true]);
    }

    public function delete_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_bookings';
        $wpdb->delete($table, ['id' => $request['id']]);
        return rest_ensure_response(['success' => true]);
    }
}