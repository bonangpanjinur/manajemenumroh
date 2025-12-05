<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_HR extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_hr_employees'); // Tabel Utama: Karyawan
    }

    public function register_routes() {
        parent::register_routes();

        // Endpoint Absensi (Clock In / Clock Out)
        register_rest_route('umh/v1', '/hr/attendance', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_clock_action'],
            'permission_callback' => '__return_true',
        ]);

        // Endpoint History Absensi
        register_rest_route('umh/v1', '/hr/attendance/history', [
            'methods' => 'GET',
            'callback' => [$this, 'get_attendance_history'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Handle Clock In / Clock Out
     * Menerima input: employee_uuid (hasil scan QR)
     */
    public function handle_clock_action($request) {
        $data = $request->get_json_params();
        $uuid = isset($data['employee_uuid']) ? $data['employee_uuid'] : '';
        
        // Cari Karyawan by UUID
        $employee = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE uuid = %s", $uuid));
        
        if (!$employee) {
            return new WP_REST_Response(['success' => false, 'message' => 'Karyawan tidak ditemukan.'], 404);
        }

        $today = current_time('Y-m-d');
        $now = current_time('H:i:s');
        $attendance_table = $this->db->prefix . 'umh_hr_attendance';

        // Cek apakah sudah absen hari ini
        $existing = $this->db->get_row($this->db->prepare(
            "SELECT * FROM {$attendance_table} WHERE employee_id = %d AND date = %s",
            $employee->id, $today
        ));

        if (!$existing) {
            // CLOCK IN
            $this->db->insert($attendance_table, [
                'employee_id' => $employee->id,
                'date' => $today,
                'check_in_time' => $now,
                'status' => 'present',
                'method' => 'scan_qr', // Bisa diubah jika manual
                'created_at' => current_time('mysql')
            ]);
            return new WP_REST_Response(['success' => true, 'type' => 'in', 'message' => "Halo {$employee->name}, berhasil Masuk jam {$now}"], 200);
        } elseif (empty($existing->check_out_time)) {
            // CLOCK OUT
            $this->db->update($attendance_table, 
                ['check_out_time' => $now], 
                ['id' => $existing->id]
            );
            return new WP_REST_Response(['success' => true, 'type' => 'out', 'message' => "Sampai jumpa {$employee->name}, berhasil Pulang jam {$now}"], 200);
        } else {
            return new WP_REST_Response(['success' => false, 'message' => 'Anda sudah absen pulang hari ini.'], 400);
        }
    }

    public function get_attendance_history($request) {
        $table = $this->db->prefix . 'umh_hr_attendance';
        $emp_table = $this->table_name;
        
        // Query Join untuk ambil nama karyawan
        $results = $this->db->get_results("
            SELECT a.*, e.name as employee_name, e.position 
            FROM {$table} a
            JOIN {$emp_table} e ON a.employee_id = e.id
            ORDER BY a.date DESC, a.check_in_time DESC
            LIMIT 100
        ");

        return new WP_REST_Response(['success' => true, 'data' => $results], 200);
    }
}