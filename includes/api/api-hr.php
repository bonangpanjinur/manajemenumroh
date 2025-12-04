<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Inisialisasi
global $wpdb;
$method = $_SERVER['REQUEST_METHOD'];
$table_employees = $wpdb->prefix . 'umh_employees';
$table_attendance = $wpdb->prefix . 'umh_attendance';

// Deteksi Route Sederhana (Attendance vs Employees)
// Asumsi router mengarahkan '/hr', '/employees', '/attendance' kesini
$request_uri = $_SERVER['REQUEST_URI'];
$is_attendance_route = strpos($request_uri, 'attendance') !== false;

// ==========================================
// ROUTE: ATTENDANCE (ABSENSI)
// ==========================================
if ($is_attendance_route) {

    // 1. GET DAILY ATTENDANCE
    if ($method === 'GET') {
        $date = isset($_GET['date']) ? sanitize_text_field($_GET['date']) : date('Y-m-d');
        
        // Ambil data absensi join dengan nama karyawan
        $sql = $wpdb->prepare("
            SELECT a.*, e.name as employee_name, e.division 
            FROM $table_attendance a
            JOIN $table_employees e ON a.employee_id = e.id
            WHERE a.date = %s
        ", $date);
        
        $results = $wpdb->get_results($sql);
        
        wp_send_json_success([
            'data' => $results,
            'date' => $date
        ]);
    }

    // 2. POST BATCH (ADMIN HR SAVE MANUAL)
    if ($method === 'POST' && strpos($request_uri, 'batch') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
        $date = sanitize_text_field($input['date']);
        $details = $input['details']; // Array of { employee_id, status }

        if (!$date || !is_array($details)) {
            wp_send_json_error(['message' => 'Invalid data'], 400);
        }

        foreach ($details as $log) {
            $emp_id = intval($log['employee_id']);
            $status = sanitize_text_field($log['status']);
            $method_log = isset($log['method']) ? sanitize_text_field($log['method']) : 'Manual Admin';

            // Cek apakah sudah ada absen hari ini?
            $exist_id = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM $table_attendance WHERE employee_id = %d AND date = %s",
                $emp_id, $date
            ));

            if ($exist_id) {
                // Update
                $wpdb->update($table_attendance, 
                    ['status' => $status], 
                    ['id' => $exist_id]
                );
            } else {
                // Insert Baru
                $wpdb->insert($table_attendance, [
                    'employee_id' => $emp_id,
                    'date' => $date,
                    'time' => current_time('H:i:s'),
                    'status' => $status,
                    'method' => $method_log
                ]);
            }
        }
        wp_send_json_success(['message' => 'Absensi berhasil disimpan']);
    }

    // 3. POST SUBMIT (SCAN QR / TUGAS LUAR)
    if ($method === 'POST' && strpos($request_uri, 'submit') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validasi Input
        $employee_id = isset($input['employee_id']) ? intval($input['employee_id']) : 0;
        // Pada real app, employee_id diambil dari session login (current_user_id)
        // Disini kita terima dari input simulasi frontend
        
        $lat = isset($input['latitude']) ? floatval($input['latitude']) : null;
        $long = isset($input['longitude']) ? floatval($input['longitude']) : null;
        $scan_method = sanitize_text_field($input['method']); // 'QR' or 'Manual'
        $notes = sanitize_textarea_field($input['attendance_token']); // Isi QR atau Alasan
        $date = date('Y-m-d');
        $time = current_time('H:i:s');

        // Insert Data
        $inserted = $wpdb->insert($table_attendance, [
            'employee_id' => $employee_id,
            'date' => $date,
            'time' => $time,
            'status' => 'Hadir',
            'method' => $scan_method,
            'latitude' => $lat,
            'longitude' => $long,
            'notes' => $notes
        ]);

        if ($inserted) {
            wp_send_json_success(['message' => 'Absensi diterima']);
        } else {
            wp_send_json_error(['message' => 'Gagal menyimpan absensi'], 500);
        }
    }
    
    exit; // Stop disini jika route attendance
}

// ==========================================
// ROUTE: EMPLOYEES (CRUD KARYAWAN)
// ==========================================

// GET ALL
if ($method === 'GET') {
    $search = isset($_GET['search']) ? sanitize_text_field($_GET['search']) : '';
    $where = "WHERE 1=1";
    if ($search) {
        $where .= " AND (name LIKE '%$search%' OR division LIKE '%$search%')";
    }
    
    $results = $wpdb->get_results("SELECT * FROM $table_employees $where ORDER BY name ASC");
    wp_send_json_success(['data' => $results]);
}

// CREATE NEW
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $data = [
        'name' => sanitize_text_field($input['name']),
        'division' => sanitize_text_field($input['division']),
        'position' => sanitize_text_field($input['position']),
        'phone' => sanitize_text_field($input['phone']),
        'status' => sanitize_text_field($input['status']),
        // Handling boolean allow_remote
        'allow_remote' => (isset($input['allow_remote']) && $input['allow_remote']) ? 1 : 0
    ];

    $wpdb->insert($table_employees, $data);
    wp_send_json_success(['id' => $wpdb->insert_id, 'message' => 'Karyawan ditambahkan']);
}

// UPDATE
if ($method === 'PUT' || ($method === 'POST' && isset($_GET['id']))) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    // Fallback jika ID ada di URL path (tergantung router)
    if (!$id) {
        $path_parts = explode('/', trim($request_uri, '/'));
        $id = end($path_parts);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    $data = [
        'name' => sanitize_text_field($input['name']),
        'division' => sanitize_text_field($input['division']),
        'position' => sanitize_text_field($input['position']),
        'phone' => sanitize_text_field($input['phone']),
        'status' => sanitize_text_field($input['status']),
        'allow_remote' => (isset($input['allow_remote']) && $input['allow_remote']) ? 1 : 0
    ];

    $wpdb->update($table_employees, $data, ['id' => $id]);
    wp_send_json_success(['message' => 'Data karyawan diperbarui']);
}

// DELETE
if ($method === 'DELETE') {
    // Ambil ID dari URL (Sederhana)
    $path_parts = explode('/', trim($request_uri, '/'));
    $id = intval(end($path_parts));
    
    if ($id) {
        $wpdb->delete($table_employees, ['id' => $id]);
        wp_send_json_success(['message' => 'Karyawan dihapus']);
    } else {
        wp_send_json_error(['message' => 'ID tidak valid'], 400);
    }
}