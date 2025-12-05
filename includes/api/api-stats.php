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
        $booking = $wpdb->prefix . 'umh_bookings';
        $jamaah = $wpdb->prefix . 'umh_jamaah';
        $departure = $wpdb->prefix . 'umh_departures';
        $finance = $wpdb->prefix . 'umh_finance';

        $stats = [
            'bookings' => $wpdb->get_var("SELECT COUNT(*) FROM $booking WHERE status != 'cancelled' AND deleted_at IS NULL"),
            'jamaah' => $wpdb->get_var("SELECT COUNT(*) FROM $jamaah WHERE status = 'active_jamaah' AND deleted_at IS NULL"),
            'departures' => $wpdb->get_var("SELECT COUNT(*) FROM $departure WHERE status = 'open' AND deleted_at IS NULL"),
            'revenue' => 0
        ];

        $inc = $wpdb->get_var("SELECT SUM(amount) FROM $finance WHERE type='income' AND deleted_at IS NULL");
        $exp = $wpdb->get_var("SELECT SUM(amount) FROM $finance WHERE type='expense' AND deleted_at IS NULL");
        $stats['revenue'] = floatval($inc) - floatval($exp);

        $recent = $wpdb->get_results("SELECT booking_code, contact_name, total_pax, status, created_at FROM $booking WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5");

        return new WP_REST_Response(['success' => true, 'counts' => $stats, 'recent_bookings' => $recent], 200);
    }
}