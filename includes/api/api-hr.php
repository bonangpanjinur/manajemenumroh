<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_HR extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_hr_employees');
    }

    public function register_routes() {
        parent::register_routes();
        register_rest_route('umh/v1', '/hr/payroll', [
            'methods' => 'GET',
            'callback' => [$this, 'get_payroll_summary'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function get_payroll_summary($request) {
        $employees = $this->db->get_results("SELECT * FROM {$this->table_name} WHERE status = 'active'");
        $payroll = [];
        
        foreach ($employees as $emp) {
            // Hitung Absensi Bulan Ini
            $days_present = $this->db->get_var($this->db->prepare(
                "SELECT COUNT(*) FROM {$this->db->prefix}umh_hr_attendance 
                 WHERE employee_id = %d AND MONTH(date) = MONTH(CURDATE())", 
                $emp->id
            ));

            $allowance = $days_present * 50000; // Tunjangan 50rb/hari
            $total = $emp->salary + $allowance;

            $payroll[] = [
                'id' => $emp->id,
                'name' => $emp->name,
                'position' => $emp->position,
                'basic_salary' => (float)$emp->salary,
                'attendance_days' => (int)$days_present,
                'allowance' => $allowance,
                'total_salary' => $total
            ];
        }
        return new WP_REST_Response(['success' => true, 'data' => $payroll], 200);
    }
}