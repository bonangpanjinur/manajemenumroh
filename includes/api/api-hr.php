<?php
/**
 * API Handler untuk HR (Karyawan & Absensi)
 * Update: Menambahkan GET Attendance List & DELETE Employee
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_HR {
    private $tbl_emp;
    private $tbl_att;

    public function __construct() {
        global $wpdb;
        $this->tbl_emp = $wpdb->prefix . 'umh_hr_employees';
        $this->tbl_att = $wpdb->prefix . 'umh_hr_attendance';
    }

    public function register_routes() {
        // EMPLOYEES
        register_rest_route('umh/v1', '/hr/employees', [
            'methods' => 'GET', 'callback' => [$this, 'get_employees'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/hr/employees', [
            'methods' => 'POST', 'callback' => [$this, 'create_employee'], 'permission_callback' => [$this, 'check_permission']
        ]);
        // Update Employee
        register_rest_route('umh/v1', '/hr/employees/(?P<id>\d+)', [
            'methods' => 'PUT', 'callback' => [$this, 'update_employee'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/hr/employees/(?P<id>\d+)', [
            'methods' => 'DELETE', 'callback' => [$this, 'delete_employee'], 'permission_callback' => [$this, 'check_permission']
        ]);

        // ATTENDANCE
        register_rest_route('umh/v1', '/hr/attendance', [
            'methods' => 'GET', 'callback' => [$this, 'get_attendance_history'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/hr/attendance', [
            'methods' => 'POST', 'callback' => [$this, 'record_attendance'], 'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    // --- EMPLOYEES ---
    public function get_employees($request) {
        global $wpdb;
        $items = $wpdb->get_results("SELECT * FROM {$this->tbl_emp} ORDER BY name ASC");
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function create_employee($request) {
        global $wpdb;
        $p = $request->get_json_params();
        $wpdb->insert($this->tbl_emp, [
            'name' => sanitize_text_field($p['name']),
            'position' => sanitize_text_field($p['position']),
            'department' => sanitize_text_field($p['department']),
            'salary' => floatval($p['salary']),
            'join_date' => $p['join_date'],
            'status' => 'active'
        ]);
        return new WP_REST_Response(['success' => true, 'id' => $wpdb->insert_id], 201);
    }

    public function update_employee($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $p = $request->get_json_params();
        
        $data = [];
        if(isset($p['name'])) $data['name'] = sanitize_text_field($p['name']);
        if(isset($p['position'])) $data['position'] = sanitize_text_field($p['position']);
        if(isset($p['department'])) $data['department'] = sanitize_text_field($p['department']);
        if(isset($p['salary'])) $data['salary'] = floatval($p['salary']);
        if(isset($p['status'])) $data['status'] = sanitize_text_field($p['status']);

        if(!empty($data)) $wpdb->update($this->tbl_emp, $data, ['id' => $id]);
        
        return new WP_REST_Response(['success' => true, 'message' => 'Updated'], 200);
    }

    public function delete_employee($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $wpdb->delete($this->tbl_emp, ['id' => $id]);
        return new WP_REST_Response(['success' => true, 'message' => 'Deleted'], 200);
    }

    // --- ATTENDANCE ---
    public function get_attendance_history($request) {
        global $wpdb;
        $date = $request->get_param('date') ? $request->get_param('date') : current_time('Y-m-d');
        
        // Join dengan tabel employee untuk ambil nama
        $sql = "SELECT a.*, e.name as employee_name, e.position 
                FROM {$this->tbl_att} a
                JOIN {$this->tbl_emp} e ON a.employee_id = e.id
                WHERE a.date = %s
                ORDER BY a.check_in_time DESC";
                
        $items = $wpdb->get_results($wpdb->prepare($sql, $date));
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function record_attendance($request) {
        global $wpdb;
        $p = $request->get_json_params();
        $today = current_time('Y-m-d');
        $emp_id = intval($p['employee_id']);
        $time_now = current_time('H:i:s');

        // Cek record hari ini
        $exist = $wpdb->get_row($wpdb->prepare("SELECT id FROM {$this->tbl_att} WHERE employee_id = %d AND date = %s", $emp_id, $today));

        if ($p['type'] === 'check_in') {
            if ($exist) return new WP_REST_Response(['success' => false, 'message' => 'Karyawan ini sudah Check In hari ini'], 400);
            
            $wpdb->insert($this->tbl_att, [
                'date' => $today,
                'employee_id' => $emp_id,
                'check_in_time' => $time_now,
                'status' => 'present'
            ]);
        } else {
            // Check out
            if (!$exist) return new WP_REST_Response(['success' => false, 'message' => 'Belum Check In, tidak bisa Check Out'], 400);
            
            $wpdb->update($this->tbl_att, ['check_out_time' => $time_now], ['id' => $exist->id]);
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Absensi berhasil dicatat'], 200);
    }
}