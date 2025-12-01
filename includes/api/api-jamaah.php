<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Jamaah_API extends UMH_CRUD_Controller {
    
    public function __construct() {
        // Schema lengkap sesuai database
        parent::__construct('jamaah', 'umh_jamaah', [
            'registration_number' => ['type' => 'string'], // Akan di-generate otomatis
            'full_name' => ['type' => 'string', 'required' => true],
            'nik' => ['type' => 'string'],
            'passport_number' => ['type' => 'string'],
            'phone' => ['type' => 'string'],
            'email' => ['type' => 'string'],
            'address' => ['type' => 'string'],
            'city' => ['type' => 'string'],
            'gender' => ['type' => 'string'],
            'birth_date' => ['type' => 'string'],
            'birth_place' => ['type' => 'string'],
            'job_title' => ['type' => 'string'],
            'education' => ['type' => 'string'],
            'clothing_size' => ['type' => 'string'],
            'disease_history' => ['type' => 'string'],
            'bpjs_number' => ['type' => 'string'],
            'father_name' => ['type' => 'string'],
            'mother_name' => ['type' => 'string'],
            'spouse_name' => ['type' => 'string'],
            'package_id' => ['type' => 'integer'],
            'departure_id' => ['type' => 'integer'],
            'agent_id' => ['type' => 'integer'],
            'package_price' => ['type' => 'number'],
            'room_type' => ['type' => 'string'],
            'status' => ['type' => 'string', 'default' => 'registered'],
            // Field Upload (URL)
            'scan_ktp' => ['type' => 'string'],
            'scan_kk' => ['type' => 'string'],
            'scan_passport' => ['type' => 'string'],
            'scan_photo' => ['type' => 'string'],
            'scan_buku_nikah' => ['type' => 'string'],
        ], [
            // Permission Control
            'get_items' => ['owner', 'admin_staff', 'marketing_staff', 'finance_staff'],
            'get_item'  => ['owner', 'admin_staff', 'marketing_staff'],
            'create_item' => ['owner', 'admin_staff', 'marketing_staff'],
            'update_item' => ['owner', 'admin_staff', 'marketing_staff'],
            'delete_item' => ['owner', 'admin_staff'],
        ]);
    }

    // Override Create untuk Auto-Generate Nomor Registrasi
    public function create_item($request) {
        global $wpdb;
        $params = $request->get_json_params();

        // Generate No Reg jika kosong: REG-{YYYYMMDD}-{Sequence}
        if (empty($params['registration_number'])) {
            $date_code = date('Ymd');
            $count = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name} WHERE DATE(created_at) = CURDATE()") + 1;
            $params['registration_number'] = 'REG-' . $date_code . '-' . str_pad($count, 3, '0', STR_PAD_LEFT);
        }

        // Set default user_id (jika integrasi user WP diperlukan nanti)
        if (!isset($params['user_id'])) {
            $params['user_id'] = 0;
        }

        $request->set_body_params($params);
        return parent::create_item($request);
    }

    // Override Get Items (Complex Query dengan JOIN)
    public function get_items($request) {
        global $wpdb;
        
        if (!$this->check_permission($request)) {
            return new WP_Error('rest_forbidden', 'Akses ditolak.', ['status' => 401]);
        }

        $table_name = $this->table_name;
        $table_packages = $wpdb->prefix . 'umh_packages';
        $table_finance = $wpdb->prefix . 'umh_finance';
        $table_agents = $wpdb->prefix . 'umh_agents';
        $table_departures = $wpdb->prefix . 'umh_departures';

        // Query Utama
        $sql = "SELECT j.*, 
                p.name as package_name, 
                d.departure_date,
                a.name as agent_name,
                (
                    SELECT COALESCE(SUM(amount), 0) 
                    FROM $table_finance f 
                    WHERE f.jamaah_id = j.id 
                    AND f.type = 'income' 
                    AND f.status = 'verified'
                ) as total_paid
                FROM $table_name j
                LEFT JOIN $table_packages p ON j.package_id = p.id
                LEFT JOIN $table_departures d ON j.departure_id = d.id
                LEFT JOIN $table_agents a ON j.agent_id = a.id
                WHERE 1=1";

        // Filter Pencarian
        if ($request->get_param('search')) {
            $search = esc_sql($request->get_param('search'));
            $sql .= " AND (j.full_name LIKE '%$search%' OR j.passport_number LIKE '%$search%' OR j.nik LIKE '%$search%' OR j.registration_number LIKE '%$search%')";
        }

        // Filter Status
        if ($request->get_param('status')) {
            $status = sanitize_text_field($request->get_param('status'));
            $sql .= $wpdb->prepare(" AND j.status = %s", $status);
        }

        // Filter Keberangkatan (Untuk Manifest)
        if ($request->get_param('departure_id')) {
            $sql .= $wpdb->prepare(" AND j.departure_id = %d", $request->get_param('departure_id'));
        }

        // Filter Agen (Jika login sebagai agen - opsional)
        if ($request->get_param('agent_id')) {
            $sql .= $wpdb->prepare(" AND j.agent_id = %d", $request->get_param('agent_id'));
        }

        $sql .= " ORDER BY j.created_at DESC";

        // Eksekusi Query
        $results = $wpdb->get_results($sql, ARRAY_A);

        // Post-Processing Data
        foreach ($results as &$row) {
            $price = floatval($row['package_price']);
            $paid = floatval($row['total_paid']);
            $row['remaining_payment'] = $price - $paid;
            
            // Label Status Pembayaran
            if ($price > 0 && $row['remaining_payment'] <= 0) {
                $row['payment_status_label'] = 'Lunas';
            } elseif ($paid > 0) {
                $row['payment_status_label'] = 'Dicicil';
            } else {
                $row['payment_status_label'] = 'Belum Bayar';
            }

            // Decode JSON jika ada field JSON (untuk jaga-jaga)
            // $row['meta_data'] = json_decode($row['meta_data']); 
        }

        return rest_ensure_response($results);
    }
}
new UMH_Jamaah_API();