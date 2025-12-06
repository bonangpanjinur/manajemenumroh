<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_HR extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_hr_employees');
    }

    public function register_routes() {
        parent::register_routes(); // CRUD Karyawan

        // 1. Simpan & Ambil Absensi Harian
        register_rest_route('umh/v1', '/hr/attendance', [
            'methods' => 'GET', 'callback' => [$this, 'get_daily_attendance'], 'permission_callback' => '__return_true',
        ]);
        register_rest_route('umh/v1', '/hr/attendance', [
            'methods' => 'POST', 'callback' => [$this, 'save_daily_attendance'], 'permission_callback' => '__return_true',
        ]);

        // 2. Payroll Summary (Kalkulasi Otomatis)
        register_rest_route('umh/v1', '/hr/payroll', [
            'methods' => 'GET', 'callback' => [$this, 'get_payroll_summary'], 'permission_callback' => '__return_true',
        ]);

        // 3. Pengaturan Gaji & Potongan
        register_rest_route('umh/v1', '/hr/settings', [
            'methods' => 'GET', 'callback' => [$this, 'get_hr_settings'], 'permission_callback' => '__return_true',
        ]);
        register_rest_route('umh/v1', '/hr/settings', [
            'methods' => 'POST', 'callback' => [$this, 'update_hr_settings'], 'permission_callback' => '__return_true',
        ]);
    }

    // --- PENGATURAN (SETTINGS) ---
    public function get_hr_settings() {
        $settings = [
            'allowance_transport' => get_option('umh_hr_allowance_transport', 25000), // Tunjangan Transport/hari
            'allowance_meal' => get_option('umh_hr_allowance_meal', 25000), // Uang Makan/hari
            'deduction_alpha' => get_option('umh_hr_deduction_alpha', 100000), // Potongan Alpha
            'deduction_late' => get_option('umh_hr_deduction_late', 20000), // Potongan Telat
        ];
        return new WP_REST_Response(['success' => true, 'data' => $settings], 200);
    }

    public function update_hr_settings($request) {
        $data = $request->get_json_params();
        update_option('umh_hr_allowance_transport', $data['allowance_transport']);
        update_option('umh_hr_allowance_meal', $data['allowance_meal']);
        update_option('umh_hr_deduction_alpha', $data['deduction_alpha']);
        update_option('umh_hr_deduction_late', $data['deduction_late']);
        return new WP_REST_Response(['success' => true, 'message' => 'Pengaturan tersimpan'], 200);
    }

    // --- ABSENSI (ATTENDANCE) ---
    public function get_daily_attendance($request) {
        $date = $request->get_param('date');
        if (!$date) $date = date('Y-m-d');

        // Ambil semua karyawan
        $employees = $this->db->get_results("SELECT id, name, position FROM {$this->table_name} WHERE status='active'");
        
        // Ambil data absensi hari itu
        $logs = $this->db->get_results($this->db->prepare(
            "SELECT employee_id, status FROM {$this->db->prefix}umh_hr_attendance WHERE date = %s", 
            $date
        ));

        // Map status ke karyawan
        $data = [];
        foreach ($employees as $emp) {
            $status = 'alpha'; // Default alpha jika belum absen
            foreach ($logs as $log) {
                if ($log->employee_id == $emp->id) {
                    $status = $log->status;
                    break;
                }
            }
            $data[] = [
                'employee_id' => $emp->id,
                'name' => $emp->name,
                'position' => $emp->position,
                'status' => $status // present, sick, permission, alpha
            ];
        }

        return new WP_REST_Response(['success' => true, 'data' => $data], 200);
    }

    public function save_daily_attendance($request) {
        $params = $request->get_json_params();
        $date = $params['date'];
        $records = $params['records']; // Array [{employee_id: 1, status: 'present'}, ...]

        if (empty($date) || empty($records)) return new WP_REST_Response(['message' => 'Data tidak lengkap'], 400);

        foreach ($records as $rec) {
            // Cek apakah sudah ada
            $exists = $this->db->get_var($this->db->prepare(
                "SELECT id FROM {$this->db->prefix}umh_hr_attendance WHERE employee_id = %d AND date = %s",
                $rec['employee_id'], $date
            ));

            if ($exists) {
                $this->db->update(
                    $this->db->prefix . 'umh_hr_attendance',
                    ['status' => $rec['status']],
                    ['id' => $exists]
                );
            } else {
                $this->db->insert(
                    $this->db->prefix . 'umh_hr_attendance',
                    [
                        'employee_id' => $rec['employee_id'],
                        'date' => $date,
                        'status' => $rec['status'],
                        'created_at' => current_time('mysql')
                    ]
                );
            }
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Absensi disimpan'], 200);
    }

    // --- PAYROLL (PENGGAJIAN OTOMATIS) ---
    public function get_payroll_summary($request) {
        // 1. Ambil Pengaturan
        $transport_rate = (int)get_option('umh_hr_allowance_transport', 0);
        $meal_rate = (int)get_option('umh_hr_allowance_meal', 0);
        $alpha_fine = (int)get_option('umh_hr_deduction_alpha', 0);
        
        $month = $request->get_param('month'); // Format '01', '02'
        $year = $request->get_param('year');   // Format '2024'
        if (!$month) $month = date('m');
        if (!$year) $year = date('Y');

        $employees = $this->db->get_results("SELECT * FROM {$this->table_name} WHERE status = 'active'");
        $payroll = [];
        
        foreach ($employees as $emp) {
            // Hitung Kehadiran
            $stats = $this->db->get_row($this->db->prepare(
                "SELECT 
                    COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
                    COUNT(CASE WHEN status = 'alpha' THEN 1 END) as alpha,
                    COUNT(CASE WHEN status = 'sick' THEN 1 END) as sick,
                    COUNT(CASE WHEN status = 'permission' THEN 1 END) as permission
                 FROM {$this->db->prefix}umh_hr_attendance 
                 WHERE employee_id = %d AND MONTH(date) = %s AND YEAR(date) = %s", 
                $emp->id, $month, $year
            ));

            // Kalkulasi Gaji
            $basic_salary = (float)$emp->salary;
            $allowances = ($stats->present * $transport_rate) + ($stats->present * $meal_rate);
            $deductions = ($stats->alpha * $alpha_fine); // Sakit & Izin biasanya tidak dipotong, Alpha dipotong
            
            $total_salary = $basic_salary + $allowances - $deductions;

            $payroll[] = [
                'id' => $emp->id,
                'name' => $emp->name,
                'position' => $emp->position,
                'basic_salary' => $basic_salary,
                'stats' => $stats, // Obj {present, alpha, etc}
                'allowances' => $allowances,
                'deductions' => $deductions,
                'total_salary' => $total_salary
            ];
        }
        return new WP_REST_Response(['success' => true, 'data' => $payroll], 200);
    }
}