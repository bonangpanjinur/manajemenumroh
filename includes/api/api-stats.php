<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Stats extends UMH_CRUD_Controller {
    public function __construct() { parent::__construct('options'); }

    public function register_routes() {
        register_rest_route('umh/v1', '/dashboard/stats', [
            'methods' => 'GET', 'callback' => [$this, 'get_dashboard_stats'], 'permission_callback' => '__return_true',
        ]);
    }

    public function get_dashboard_stats() {
        global $wpdb;
        
        // 1. WIDGET COUNTS (KPI Ringkas)
        $counts = [
            'jamaah' => (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah WHERE status='active_jamaah'"),
            'leads' => (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_leads WHERE status='new'"),
            'agents' => (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_agents WHERE status='active'"),
            // Tambahan: Pending Booking (Butuh aksi)
            'bookings_pending' => (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_bookings WHERE status IN ('pending', 'draft')"),
            // Tambahan: Keberangkatan bulan depan (Untuk operational alert)
            'departures_next_month' => (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_departures WHERE departure_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)"),
        ];
        
        // 2. CHART DATA (Financial & Sales Trend - 6 Bulan Terakhir)
        $months = [];
        $income = [];
        $expense = [];
        $bookings_trend = [];
        
        for ($i = 5; $i >= 0; $i--) {
            $month_key = date('Y-m', strtotime("-$i months"));
            $months[] = date('M Y', strtotime("-$i months"));
            
            // Finance: Pemasukan
            $inc = $wpdb->get_var($wpdb->prepare(
                "SELECT IFNULL(SUM(amount), 0) FROM {$wpdb->prefix}umh_finance WHERE type='income' AND DATE_FORMAT(transaction_date, '%%Y-%%m') = %s", $month_key
            ));
            // Finance: Pengeluaran
            $exp = $wpdb->get_var($wpdb->prepare(
                "SELECT IFNULL(SUM(amount), 0) FROM {$wpdb->prefix}umh_finance WHERE type='expense' AND DATE_FORMAT(transaction_date, '%%Y-%%m') = %s", $month_key
            ));
            // Sales: Jumlah Booking
            $book_count = $wpdb->get_var($wpdb->prepare(
                "SELECT COUNT(*) FROM {$wpdb->prefix}umh_bookings WHERE DATE_FORMAT(created_at, '%%Y-%%m') = %s", $month_key
            ));
            
            $income[] = (float)$inc;
            $expense[] = (float)$exp;
            $bookings_trend[] = (int)$book_count;
        }

        // 3. DATA TERBARU (Untuk Tabel Ringkasan Dashboard)
        
        // 5 Booking Terakhir
        $latest_bookings = $wpdb->get_results("
            SELECT b.id, b.booking_code, b.contact_name, b.status, b.total_price, b.created_at, p.name as package_name
            FROM {$wpdb->prefix}umh_bookings b
            LEFT JOIN {$wpdb->prefix}umh_departures d ON b.departure_id = d.id
            LEFT JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
            ORDER BY b.created_at DESC LIMIT 5
        ");

        // 5 Keberangkatan Mendatang
        $upcoming_departures = $wpdb->get_results("
            SELECT d.id, d.departure_date, d.available_seats, d.quota, p.name as package_name
            FROM {$wpdb->prefix}umh_departures d
            LEFT JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
            WHERE d.departure_date >= CURDATE()
            ORDER BY d.departure_date ASC LIMIT 5
        ");

        return new WP_REST_Response([
            'success' => true,
            'counts' => $counts,
            'chart' => [
                'labels' => $months, 
                'income' => $income, 
                'expense' => $expense,
                'bookings' => $bookings_trend
            ],
            'recent' => [
                'bookings' => $latest_bookings,
                'departures' => $upcoming_departures
            ]
        ], 200);
    }
}