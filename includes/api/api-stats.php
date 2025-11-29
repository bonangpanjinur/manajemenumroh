<?php
if (!defined('ABSPATH')) { exit; }

class UMH_Stats_API {
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/dashboard-stats', [
            'methods' => 'GET',
            'callback' => [$this, 'get_dashboard_stats'],
            'permission_callback' => function() { return current_user_can('read'); }
        ]);
    }

    public function get_dashboard_stats() {
        global $wpdb;

        // 1. Total Jemaah Aktif (Belum Berangkat)
        $total_active_jamaah = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah WHERE status IN ('registered', 'dp', 'lunas')");

        // 2. Omset Bulan Ini (Finance Income)
        $current_month = date('Y-m');
        $monthly_revenue = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_finance WHERE type = 'income' AND date LIKE '$current_month%'");

        // 3. Keberangkatan Terdekat
        $next_departure = $wpdb->get_row("
            SELECT d.departure_date, p.name, d.quota, d.booked
            FROM {$wpdb->prefix}umh_departures d
            JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
            WHERE d.departure_date >= CURDATE()
            ORDER BY d.departure_date ASC
            LIMIT 1
        ");

        // 4. Tasks Pending
        $pending_tasks = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_tasks WHERE status = 'pending'");

        // 5. Grafik Pendaftaran 6 Bulan Terakhir
        $chart_data = $wpdb->get_results("
            SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
            FROM {$wpdb->prefix}umh_jamaah 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY month 
            ORDER BY month ASC
        ");

        // 6. List Keberangkatan Upcoming
        $upcoming_departures = $wpdb->get_results("
            SELECT d.id, p.name, d.departure_date, d.quota, d.booked, d.status
            FROM {$wpdb->prefix}umh_departures d
            JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
            WHERE d.departure_date >= CURDATE()
            ORDER BY d.departure_date ASC
            LIMIT 5
        ");

        return rest_ensure_response([
            'cards' => [
                'active_jamaah' => $total_active_jamaah ?: 0,
                'monthly_revenue' => $monthly_revenue ?: 0,
                'next_departure' => $next_departure,
                'pending_tasks' => $pending_tasks ?: 0
            ],
            'chart' => $chart_data,
            'upcoming' => $upcoming_departures
        ]);
    }
}

new UMH_Stats_API();