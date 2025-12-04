<?php
/**
 * API Handler untuk Export Data (Jamaah, Manifest, Keuangan)
 * Mengirimkan data JSON flat yang siap dikonversi ke Excel oleh Frontend
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Export {

    public function register_routes() {
        // Export Data Jemaah (Master)
        register_rest_route('umh/v1', '/export/jamaah', [
            'methods' => 'GET', 
            'callback' => [$this, 'export_jamaah'], 
            'permission_callback' => [$this, 'check_permission']
        ]);

        // Export Manifest Keberangkatan (Per Departure)
        register_rest_route('umh/v1', '/export/manifest/(?P<id>\d+)', [
            'methods' => 'GET', 
            'callback' => [$this, 'export_manifest'], 
            'permission_callback' => [$this, 'check_permission']
        ]);

        // Export Laporan Keuangan
        register_rest_route('umh/v1', '/export/finance', [
            'methods' => 'GET', 
            'callback' => [$this, 'export_finance'], 
            'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    // 1. Export Master Jamaah
    public function export_jamaah($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        
        // Ambil semua data jemaah
        $items = $wpdb->get_results("SELECT nik, full_name, passport_number, gender, phone, city, status FROM $table ORDER BY full_name ASC", ARRAY_A);
        
        return new WP_REST_Response([
            'success' => true,
            'filename' => 'Data_Master_Jemaah_' . date('Y-m-d'),
            'data' => $items
        ], 200);
    }

    // 2. Export Manifest (Siapa saja yg berangkat di tanggal X)
    public function export_manifest($request) {
        global $wpdb;
        $departure_id = $request->get_param('id');
        
        // Query Join Kompleks untuk Manifest Lengkap
        $sql = "SELECT 
                    j.full_name as 'Nama Lengkap',
                    j.passport_number as 'No Paspor',
                    j.gender as 'JK',
                    p.package_type as 'Tipe Paket',
                    r.room_number as 'No Kamar',
                    h.name as 'Hotel',
                    p.visa_status as 'Status Visa'
                FROM {$wpdb->prefix}umh_booking_passengers p
                JOIN {$wpdb->prefix}umh_jamaah j ON p.jamaah_id = j.id
                JOIN {$wpdb->prefix}umh_bookings b ON p.booking_id = b.id
                LEFT JOIN {$wpdb->prefix}umh_rooming_list r ON p.assigned_room_id = r.id
                LEFT JOIN {$wpdb->prefix}umh_master_hotels h ON r.hotel_name = h.id -- Asumsi relasi hotel
                WHERE b.departure_id = %d AND b.status IN ('confirmed', 'completed')";
        
        $items = $wpdb->get_results($wpdb->prepare($sql, $departure_id), ARRAY_A);

        // Ambil info keberangkatan untuk nama file
        $dept_date = $wpdb->get_var($wpdb->prepare("SELECT departure_date FROM {$wpdb->prefix}umh_departures WHERE id = %d", $departure_id));

        return new WP_REST_Response([
            'success' => true,
            'filename' => 'Manifest_Keberangkatan_' . $dept_date,
            'data' => $items
        ], 200);
    }

    // 3. Export Keuangan
    public function export_finance($request) {
        global $wpdb;
        $start_date = $request->get_param('start_date');
        $end_date = $request->get_param('end_date');
        
        $where = "WHERE 1=1";
        if ($start_date && $end_date) {
            $where .= $wpdb->prepare(" AND transaction_date BETWEEN %s AND %s", $start_date, $end_date);
        }

        $sql = "SELECT 
                    transaction_date as 'Tanggal',
                    type as 'Tipe',
                    category as 'Kategori',
                    amount as 'Nominal',
                    description as 'Keterangan',
                    status as 'Status'
                FROM {$wpdb->prefix}umh_finance 
                $where 
                ORDER BY transaction_date DESC";
                
        $items = $wpdb->get_results($sql, ARRAY_A);

        return new WP_REST_Response([
            'success' => true,
            'filename' => 'Laporan_Keuangan_' . date('Ymd'),
            'data' => $items
        ], 200);
    }
}