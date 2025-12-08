<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function () {
    register_rest_route('umh/v1', '/stats/summary', array(
        'methods' => 'GET',
        'callback' => 'umh_get_dashboard_stats',
        'permission_callback' => ['UMH_API_Loader', 'permission_check']
    ));
});

function umh_get_dashboard_stats() {
    global $wpdb;
    
    // Nama Tabel (sesuaikan dengan prefix WP Anda)
    $t_jamaah = $wpdb->prefix . 'umh_jamaah';
    $t_packages = $wpdb->prefix . 'umh_packages';
    $t_departures = $wpdb->prefix . 'umh_departures';
    $t_finance = $wpdb->prefix . 'umh_finance';

    // 1. Hitung Total Jamaah Aktif
    // Cek dulu apakah tabel ada untuk menghindari error 500
    $total_jamaah = 0;
    if ($wpdb->get_var("SHOW TABLES LIKE '$t_jamaah'") == $t_jamaah) {
        $total_jamaah = (int) $wpdb->get_var("SELECT COUNT(*) FROM $t_jamaah WHERE status = 'active'");
    }

    // 2. Hitung Paket Aktif
    $active_packages = 0;
    if ($wpdb->get_var("SHOW TABLES LIKE '$t_packages'") == $t_packages) {
        $active_packages = (int) $wpdb->get_var("SELECT COUNT(*) FROM $t_packages WHERE status = 'active'");
    }

    // 3. Hitung Jadwal Open
    $upcoming_departures = 0;
    if ($wpdb->get_var("SHOW TABLES LIKE '$t_departures'") == $t_departures) {
        $upcoming_departures = (int) $wpdb->get_var("SELECT COUNT(*) FROM $t_departures WHERE status = 'open'");
    }

    // 4. Hitung Pemasukan Bulan Ini
    $monthly_income = 0;
    if ($wpdb->get_var("SHOW TABLES LIKE '$t_finance'") == $t_finance) {
        $current_month = date('Y-m');
        $monthly_income = (int) $wpdb->get_var("
            SELECT SUM(amount) FROM $t_finance 
            WHERE type = 'income' 
            AND status = 'verified' 
            AND DATE_FORMAT(transaction_date, '%Y-%m') = '$current_month'
        ");
    }

    // Return JSON Response yang Benar
    return new WP_REST_Response([
        'success' => true,
        'data' => [
            'total_jamaah' => $total_jamaah,
            'active_packages' => $active_packages,
            'upcoming_departures' => $upcoming_departures,
            'monthly_income' => $monthly_income
        ]
    ], 200);
}