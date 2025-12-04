<?php
/**
 * API Handler untuk Dashboard Statistics
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Stats {

    public function register_routes() {
        register_rest_route('umh/v1', '/stats/dashboard', [
            'methods' => 'GET', 
            'callback' => [$this, 'get_dashboard_stats'], 
            'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    public function get_dashboard_stats($request) {
        global $wpdb;
        
        // 1. Total Jemaah (Master Data)
        $total_jamaah = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah");

        // 2. Total Booking Aktif (Pending/Confirmed)
        $active_bookings = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_bookings WHERE status IN ('pending', 'confirmed')");

        // 3. Omzet Bulan Ini (Income Verified)
        $current_month = date('Y-m');
        $monthly_income = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(amount) FROM {$wpdb->prefix}umh_finance 
             WHERE type = 'income' AND status = 'verified' 
             AND transaction_date LIKE %s", 
            $current_month . '%'
        ));

        // 4. Keberangkatan Terdekat (Next Departure)
        $next_departure = $wpdb->get_row(
            "SELECT d.departure_date, p.name, d.seat_quota, d.seat_booked 
             FROM {$wpdb->prefix}umh_departures d
             JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
             WHERE d.departure_date >= CURDATE() AND d.status = 'open'
             ORDER BY d.departure_date ASC LIMIT 1"
        );

        // 5. Grafik 6 Bulan Terakhir (Income vs Expense)
        $chart_data = $this->get_chart_data();

        return new WP_REST_Response([
            'success' => true,
            'cards' => [
                'total_jamaah' => (int)$total_jamaah,
                'active_bookings' => (int)$active_bookings,
                'monthly_revenue' => (float)$monthly_income,
                'next_departure' => $next_departure
            ],
            'chart' => $chart_data
        ], 200);
    }

    private function get_chart_data() {
        global $wpdb;
        // Ambil data 6 bulan terakhir
        $sql = "SELECT 
                    DATE_FORMAT(transaction_date, '%Y-%m') as month,
                    type,
                    SUM(amount) as total
                FROM {$wpdb->prefix}umh_finance
                WHERE status = 'verified' 
                AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY month, type
                ORDER BY month ASC";
        
        $results = $wpdb->get_results($sql);
        
        // Format ulang agar mudah dibaca Chart.js di frontend
        $data = [];
        foreach ($results as $row) {
            $data[$row->month][$row->type] = $row->total;
        }
        return $data;
    }
}