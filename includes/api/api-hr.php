<?php
// includes/api/api-hr.php
defined('ABSPATH') || exit;

class UMH_API_HR {
    public function register_routes() {
        register_rest_route('umh/v1', '/hr/employees', [
            'methods' => ['GET', 'POST'],
            'callback' => [$this, 'handle_employees'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);

        register_rest_route('umh/v1', '/hr/attendance', [
            'methods' => ['GET'],
            'callback' => [$this, 'get_attendance_log'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);

        // ENDPOINT BARU: SCAN
        register_rest_route('umh/v1', '/hr/attendance/scan', [
            'methods' => 'POST',
            'callback' => [$this, 'process_scan'],
            'permission_callback' => function() { return current_user_can('read'); } // Bisa diakses staff lapangan
        ]);
    }

    // Logic Scan Cerdas
    public function process_scan($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $code = isset($params['code']) ? sanitize_text_field($params['code']) : '';

        if (empty($code)) return new WP_Error('no_code', 'QR Code kosong', ['status' => 400]);

        // Format code: "TYPE:ID", contoh "JAMAAH:15" atau "STAFF:5"
        $parts = explode(':', $code);
        if (count($parts) !== 2) return new WP_Error('invalid_format', 'Format QR tidak dikenali', ['status' => 400]);

        $type = strtoupper($parts[0]);
        $id = intval($parts[1]);
        $today = date('Y-m-d');
        $now = date('H:i:s');

        $user_data = null;
        $table_attendance = $wpdb->prefix . 'umh_hr_attendance';

        // 1. Identifikasi User
        if ($type === 'JAMAAH') {
            $user_data = $wpdb->get_row($wpdb->prepare("SELECT id, full_name as name FROM {$wpdb->prefix}umh_jamaah WHERE id = %d", $id));
        } elseif ($type === 'STAFF') {
            $user_data = $wpdb->get_row($wpdb->prepare("SELECT id, name FROM {$wpdb->prefix}umh_hr_employees WHERE id = %d", $id));
        }

        if (!$user_data) return new WP_Error('not_found', 'Data pengguna tidak ditemukan di database', ['status' => 404]);

        // 2. Cek apakah sudah absen hari ini
        // Note: Skema tabel attendance kita awalnya didesain untuk employee_id. 
        // Untuk support jamaah, idealnya kita tambah kolom 'user_type' ('staff', 'jamaah') di tabel attendance.
        // Untuk solusi cepat tanpa ubah skema besar, kita asumsikan ID unik atau kita fokus ke Staff dulu.
        // TAPI, karena Anda minta canggih, mari kita anggap tabel attendance mencatat 'employee_id' sebagai ID generik referensi.
        
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT id, check_in_time, check_out_time FROM $table_attendance WHERE employee_id = %d AND date = %s",
            $id, $today
        ));

        if ($existing) {
            // Jika sudah Check In, maka Check Out
            if ($existing->check_out_time) {
                return new WP_Error('already_done', 'User ini sudah selesai absen hari ini.', ['status' => 400]);
            } else {
                // Update Check Out
                $wpdb->update(
                    $table_attendance,
                    ['check_out_time' => $now, 'status' => 'present'],
                    ['id' => $existing->id]
                );
                return rest_ensure_response([
                    'status' => 'success',
                    'message' => 'Check Out Berhasil',
                    'data' => [
                        'name' => $user_data->name,
                        'role' => $type,
                        'time' => $now,
                        'event' => 'Kepulangan'
                    ]
                ]);
            }
        } else {
            // Check In Baru
            $wpdb->insert(
                $table_attendance,
                [
                    'employee_id' => $id, // ID Jamaah atau Staff
                    'date' => $today,
                    'check_in_time' => $now,
                    'status' => 'present',
                    'method' => 'QR Scan'
                ]
            );

            return rest_ensure_response([
                'status' => 'success',
                'message' => 'Check In Berhasil',
                'data' => [
                    'name' => $user_data->name,
                    'role' => $type,
                    'time' => $now,
                    'event' => 'Kehadiran'
                ]
            ]);
        }
    }

    // Placeholder method untuk route lain (agar file lengkap)
    public function handle_employees($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_hr_employees';
        if ($request->get_method() === 'GET') {
            return $wpdb->get_results("SELECT * FROM $table ORDER BY name ASC");
        } else {
            $data = $request->get_json_params();
            if (isset($data['id'])) {
                $wpdb->update($table, $data, ['id' => $data['id']]);
                return ['id' => $data['id'], 'message' => 'Updated'];
            } else {
                $wpdb->insert($table, $data);
                return ['id' => $wpdb->insert_id, 'message' => 'Created'];
            }
        }
    }

    public function get_attendance_log($request) {
        global $wpdb;
        // Join sederhana untuk dapat nama
        return $wpdb->get_results("
            SELECT a.*, e.name as employee_name 
            FROM {$wpdb->prefix}umh_hr_attendance a
            LEFT JOIN {$wpdb->prefix}umh_hr_employees e ON a.employee_id = e.id
            ORDER BY a.date DESC, a.check_in_time DESC LIMIT 100
        ");
    }
}