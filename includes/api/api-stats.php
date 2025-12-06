<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Stats extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_bookings'); // Base dummy, karena ini hanya GET
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/stats/dashboard', [
            'methods' => 'GET',
            'callback' => [$this, 'get_dashboard_stats'],
            'permission_callback' => '__return_true'
        ]);
    }

    public function get_dashboard_stats($request) {
        global $wpdb;
        $stats = [];
        $current_month = date('Y-m');

        // 1. Total Booking & Omzet (Bulan Ini)
        $stats['sales_month'] = $wpdb->get_row("
            SELECT 
                COUNT(*) as total_bookings,
                COALESCE(SUM(total_price), 0) as total_revenue,
                COALESCE(SUM(total_paid), 0) as cash_received
            FROM {$wpdb->prefix}umh_bookings 
            WHERE created_at LIKE '$current_month%' AND status != 'cancelled'
        ");

        // 2. Booking Status (Pipeline)
        $stats['booking_status'] = $wpdb->get_results("
            SELECT status, COUNT(*) as count 
            FROM {$wpdb->prefix}umh_bookings 
            GROUP BY status
        ");

        // 3. Payment Verification Needed (Pending Proofs)
        $stats['pending_payments'] = $wpdb->get_var("
            SELECT COUNT(*) FROM {$wpdb->prefix}umh_payment_proofs WHERE status = 'pending'
        ");

        // 4. Next Departures (Jadwal Terdekat)
        $stats['upcoming_departures'] = $wpdb->get_results("
            SELECT d.*, p.name as package_name, (d.quota - d.available_seats) as seats_filled
            FROM {$wpdb->prefix}umh_departures d
            JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
            WHERE d.departure_date >= CURDATE() AND d.status = 'open'
            ORDER BY d.departure_date ASC 
            LIMIT 5
        ");

        // 5. Agent Wallets Total (Liability)
        $stats['total_wallet_balance'] = $wpdb->get_var("
            SELECT COALESCE(SUM(balance), 0) FROM {$wpdb->prefix}umh_wallets
        ");

        return new WP_REST_Response(['success' => true, 'data' => $stats], 200);
    }
}