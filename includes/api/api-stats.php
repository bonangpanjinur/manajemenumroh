<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Stats extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('options'); 
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/dashboard/stats', [
            'methods' => 'GET',
            'callback' => [$this, 'get_dashboard_stats'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function get_dashboard_stats() {
        global $wpdb;

        // 1. Total Jemaah Aktif (Status != cancelled)
        $total_jamaah = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_bookings WHERE status != 'cancelled'");

        // 2. Omset Bulan Ini (Dari tabel Finance type=income)
        $current_month = date('m');
        $revenue = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(amount) FROM {$wpdb->prefix}umh_finance 
             WHERE type='income' AND MONTH(transaction_date) = %d", 
            $current_month
        ));

        // 3. Keberangkatan Terdekat (Next 30 days)
        $upcoming_departures = $wpdb->get_results(
            "SELECT d.*, p.name as package_name 
             FROM {$wpdb->prefix}umh_departures d
             JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
             WHERE d.departure_date >= CURDATE() 
             ORDER BY d.departure_date ASC LIMIT 5"
        );

        // 4. Booking Terbaru
        $recent_bookings = $wpdb->get_results(
            "SELECT * FROM {$wpdb->prefix}umh_bookings ORDER BY created_at DESC LIMIT 5"
        );

        return new WP_REST_Response([
            'success' => true,
            'counts' => [
                'jamaah' => (int)$total_jamaah,
                'revenue' => (float)$revenue,
                'agents' => (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_agents"),
                'leads' => (int)$wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_leads WHERE status='new'")
            ],
            'upcoming' => $upcoming_departures,
            'recent_bookings' => $recent_bookings
        ], 200);
    }
}