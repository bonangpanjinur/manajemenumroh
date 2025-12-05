<?php
// includes/api/api-stats.php

defined('ABSPATH') || exit;

class UMH_API_Stats {
    public function register_routes() {
        register_rest_route('umh/v1', '/stats', [
            'methods' => 'GET',
            'callback' => [$this, 'get_dashboard_stats'],
            'permission_callback' => function() { return current_user_can('read'); }
        ]);
    }

    public function get_dashboard_stats($request) {
        global $wpdb;

        // 1. Total Jamaah
        $total_jamaah = $wpdb->get_var("SELECT COUNT(id) FROM {$wpdb->prefix}umh_jamaah");
        
        // 2. Booking Stats
        $bookings_active = $wpdb->get_var("SELECT COUNT(id) FROM {$wpdb->prefix}umh_bookings WHERE status != 'cancelled'");
        $bookings_need_confirm = $wpdb->get_var("SELECT COUNT(id) FROM {$wpdb->prefix}umh_bookings WHERE payment_status = 'unpaid'");
        
        // 3. Keberangkatan Terdekat (30 Hari kedepan)
        $upcoming_departures = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(id) FROM {$wpdb->prefix}umh_departures 
             WHERE departure_date BETWEEN %s AND %s AND status = 'open'",
            date('Y-m-d'),
            date('Y-m-d', strtotime('+30 days'))
        ));

        // 4. Omset Bulan Ini (Booking yang sudah 'paid' atau 'dp')
        $current_month_start = date('Y-m-01');
        $current_month_end = date('Y-m-t');
        $revenue = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(total_paid) FROM {$wpdb->prefix}umh_bookings 
             WHERE (payment_status = 'paid' OR payment_status = 'dp' OR payment_status = 'partial')
             AND created_at BETWEEN %s AND %s",
            $current_month_start, 
            $current_month_end
        ));

        // 5. Recent Bookings (5 Terakhir)
        $recent_bookings = $wpdb->get_results("
            SELECT b.booking_code, b.contact_name, b.total_pax, b.booking_date, b.payment_status, p.name as package_name
            FROM {$wpdb->prefix}umh_bookings b
            LEFT JOIN {$wpdb->prefix}umh_packages p ON b.package_id = p.id
            ORDER BY b.created_at DESC LIMIT 5
        ");

        // 6. Grafik Pendaftaran (12 Bulan di Tahun ini)
        $year = date('Y');
        $monthly_counts = [];
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT MONTH(created_at) as month, COUNT(id) as count 
             FROM {$wpdb->prefix}umh_bookings 
             WHERE YEAR(created_at) = %d 
             GROUP BY MONTH(created_at)",
            $year
        ));

        // Format array [0, 0, 5, 10, ...] untuk chart
        $chart_data = array_fill(0, 12, 0);
        foreach ($results as $row) {
            $chart_data[$row->month - 1] = (int)$row->count;
        }

        return rest_ensure_response([
            'total_jamaah' => (int)$total_jamaah,
            'bookings_active' => (int)$bookings_active,
            'bookings_need_confirm' => (int)$bookings_need_confirm,
            'upcoming_departures' => (int)$upcoming_departures,
            'revenue_month' => (float)$revenue,
            'recent_bookings' => $recent_bookings,
            'chart_data' => $chart_data
        ]);
    }
}