<?php
/**
 * API Controller: Manajemen Manasik
 * Endpoint Base: /wp-json/umh/v1/manasik
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Manasik {

    public function register_routes() {
        // 1. Get Schedules (Jadwal Manasik)
        register_rest_route('umh/v1', '/manasik', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_schedules'),
            'permission_callback' => '__return_true', // User bisa lihat jadwal
        ));

        // 2. Create Schedule (Admin)
        register_rest_route('umh/v1', '/manasik', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_schedule'),
            'permission_callback' => array($this, 'admin_permissions_check'),
        ));

        // 3. Submit Attendance / Check-in (Scan QR)
        register_rest_route('umh/v1', '/manasik/attendance', array(
            'methods' => 'POST',
            'callback' => array($this, 'submit_attendance'),
            'permission_callback' => array($this, 'admin_permissions_check'), // Staff yang scan QR user
        ));

        // 4. Get Attendance List by Schedule (Admin)
        register_rest_route('umh/v1', '/manasik/attendance/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_attendance_list'),
            'permission_callback' => array($this, 'admin_permissions_check'),
        ));
    }

    public function get_schedules($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_manasik_schedules';
        
        $results = $wpdb->get_results("SELECT * FROM $table ORDER BY event_date DESC");
        return rest_ensure_response($results);
    }

    public function create_schedule($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_manasik_schedules';
        $params = $request->get_json_params();

        if (empty($params['title']) || empty($params['event_date'])) {
            return new WP_Error('missing_data', 'Judul dan Tanggal Wajib', array('status' => 400));
        }

        $data = array(
            'title' => sanitize_text_field($params['title']),
            'event_date' => $params['event_date'],
            'location_name' => isset($params['location_name']) ? $params['location_name'] : '',
            'ustadz_name' => isset($params['ustadz_name']) ? $params['ustadz_name'] : '',
            'notes' => isset($params['notes']) ? $params['notes'] : '',
            'departure_id' => !empty($params['departure_id']) ? $params['departure_id'] : NULL
        );

        $wpdb->insert($table, $data);
        return rest_ensure_response(array('success' => true, 'id' => $wpdb->insert_id, 'message' => 'Jadwal Manasik dibuat'));
    }

    public function submit_attendance($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_manasik_attendance';
        $params = $request->get_json_params();

        // Parameter: ID Jadwal & ID Jamaah (Dari QR Code)
        if (empty($params['schedule_id']) || empty($params['jamaah_id'])) {
            return new WP_Error('missing_data', 'Data Scan tidak lengkap', array('status' => 400));
        }

        // Cek duplikasi (Upsert logic: Insert or Update)
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table WHERE manasik_schedule_id = %d AND jamaah_id = %d",
            $params['schedule_id'], $params['jamaah_id']
        ));

        if ($exists) {
            $wpdb->update($table, 
                array('status' => 'present', 'check_in_time' => current_time('mysql')), 
                array('id' => $exists)
            );
        } else {
            $wpdb->insert($table, array(
                'manasik_schedule_id' => $params['schedule_id'],
                'jamaah_id' => $params['jamaah_id'],
                'status' => 'present',
                'check_in_time' => current_time('mysql')
            ));
        }

        return rest_ensure_response(array('success' => true, 'message' => 'Absensi Berhasil Dicatat'));
    }
    
    public function get_attendance_list($request) {
        global $wpdb;
        $schedule_id = $request['id'];
        $table_attn = $wpdb->prefix . 'umh_manasik_attendance';
        $table_jamaah = $wpdb->prefix . 'umh_jamaah';
        
        $sql = "SELECT a.*, j.full_name, j.phone 
                FROM $table_attn a 
                JOIN $table_jamaah j ON a.jamaah_id = j.id 
                WHERE a.manasik_schedule_id = %d";
                
        $results = $wpdb->get_results($wpdb->prepare($sql, $schedule_id));
        return rest_ensure_response($results);
    }

    public function admin_permissions_check() {
        return current_user_can('manage_options');
    }
}