<?php
/**
 * File: includes/utils.php
 * Deskripsi: Fungsi bantuan global
 */

if (!defined('ABSPATH')) {
    exit;
}

// Format Rupiah
function umh_format_idr($nominal) {
    return 'Rp ' . number_format($nominal, 0, ',', '.');
}

// Generate Booking Code: UMH-YYYYMM-XXXX
function umh_generate_booking_code() {
    global $wpdb;
    $table = $wpdb->prefix . 'umh_bookings';
    $prefix = 'UMH-' . date('Ym') . '-';
    
    // Cari booking terakhir di bulan ini
    $sql = "SELECT booking_code FROM $table WHERE booking_code LIKE %s ORDER BY id DESC LIMIT 1";
    $last_code = $wpdb->get_var($wpdb->prepare($sql, $prefix . '%'));

    if ($last_code) {
        // Ambil 4 digit terakhir
        $last_num = (int) substr($last_code, -4);
        $new_num = $last_num + 1;
    } else {
        $new_num = 1;
    }

    return $prefix . str_pad($new_num, 4, '0', STR_PAD_LEFT);
}

// Konversi Tanggal ke Format Indonesia (contoh: 2023-10-01 -> 1 Oktober 2023)
function umh_date_indo($date) {
    $bulan = [
        1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    $split = explode('-', $date);
    if(count($split) !== 3) return $date; // Invalid format return as is
    
    return $split[2] . ' ' . $bulan[(int)$split[1]] . ' ' . $split[0];
}

// Logging Aktivitas
function umh_log_activity($user_id, $action, $details = '') {
    global $wpdb;
    $table = $wpdb->prefix . 'umh_activity_logs';
    $wpdb->insert($table, [
        'user_id' => $user_id,
        'action' => $action,
        'details' => is_array($details) ? json_encode($details) : $details,
        'ip_address' => $_SERVER['REMOTE_ADDR']
    ]);
}