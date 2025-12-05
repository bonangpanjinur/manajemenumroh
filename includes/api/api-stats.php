<?php
require_once dirname(__FILE__) . '/../class-umh-rest-api.php';

class UMH_API_Stats extends UMH_REST_API {
    
    public function register_routes() {
        register_rest_route('umh/v1', '/stats/dashboard', [
            'methods' => 'GET',
            'callback' => [$this, 'get_dashboard_stats'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function get_dashboard_stats() {
        global $wpdb;
        
        // Count Data
        $total_bookings = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_bookings WHERE status != 'cancelled'");
        $total_jamaah = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_jamaah WHERE status = 'active_jamaah'");
        $active_departures = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_departures WHERE status = 'open'");
        
        // Finance Summary
        $income = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_finance WHERE type = 'income' AND deleted_at IS NULL");
        $expense = $wpdb->get_var("SELECT SUM(amount) FROM {$wpdb->prefix}umh_finance WHERE type = 'expense' AND deleted_at IS NULL");
        
        // Recent Bookings
        $recent_bookings = $wpdb->get_results("SELECT booking_code, contact_name, total_pax, status, created_at FROM {$wpdb->prefix}umh_bookings ORDER BY created_at DESC LIMIT 5");

        return new WP_REST_Response([
            'success' => true,
            'counts' => [
                'bookings' => $total_bookings,
                'jamaah' => $total_jamaah,
                'departures' => $active_departures,
                'revenue' => $income - $expense
            ],
            'recent_bookings' => $recent_bookings
        ], 200);
    }
}