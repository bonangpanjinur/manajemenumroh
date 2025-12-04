<?php
/**
 * API Handler untuk Keuangan (Pembayaran & Validasi)
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Finance {
    private $tbl_finance;
    private $tbl_bookings;

    public function __construct() {
        global $wpdb;
        $this->tbl_finance  = $wpdb->prefix . 'umh_finance';
        $this->tbl_bookings = $wpdb->prefix . 'umh_bookings';
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/finance', [
            'methods' => 'POST', 'callback' => [$this, 'add_payment'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/finance/(?P<id>\d+)/verify', [
            'methods' => 'PUT', 'callback' => [$this, 'verify_payment'], 'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    // 1. Tambah Pembayaran (Oleh Jemaah/Admin)
    public function add_payment($request) {
        global $wpdb;
        $p = $request->get_json_params();

        $data = [
            'transaction_date' => $p['transaction_date'] ?? current_time('Y-m-d'),
            'type' => 'income', // Default income kalau pembayaran booking
            'category' => $p['category'] ?? 'Cicilan',
            'amount' => floatval($p['amount']),
            'description' => sanitize_textarea_field($p['description']),
            'booking_id' => intval($p['booking_id']),
            'payment_method' => $p['payment_method'],
            'proof_file' => esc_url_raw($p['proof_file']),
            'status' => 'pending', // Butuh validasi finance
            'created_at' => current_time('mysql')
        ];

        $wpdb->insert($this->tbl_finance, $data);
        return new WP_REST_Response(['success' => true, 'message' => 'Pembayaran dikirim, menunggu verifikasi', 'id' => $wpdb->insert_id], 201);
    }

    // 2. Verifikasi Pembayaran (Oleh Staff Finance)
    public function verify_payment($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $p = $request->get_json_params(); // {"status": "verified"}

        if ($p['status'] !== 'verified') {
            return new WP_REST_Response(['success' => false, 'message' => 'Invalid status'], 400);
        }

        // Update status di tabel finance
        $wpdb->update($this->tbl_finance, 
            ['status' => 'verified', 'verified_by' => get_current_user_id()], 
            ['id' => $id]
        );

        // OTOMATIS: Update total_paid di tabel Bookings
        $payment = $wpdb->get_row($wpdb->prepare("SELECT booking_id, amount FROM {$this->tbl_finance} WHERE id = %d", $id));
        if ($payment && $payment->booking_id) {
            $booking_id = $payment->booking_id;
            
            // Recalculate total paid
            $total_paid = $wpdb->get_var($wpdb->prepare("SELECT SUM(amount) FROM {$this->tbl_finance} WHERE booking_id = %d AND status = 'verified'", $booking_id));
            
            // Update Booking Header
            $wpdb->update($this->tbl_bookings, 
                ['total_paid' => $total_paid, 'payment_status' => 'partial'], // Simple logic, bisa dipercanggih
                ['id' => $booking_id]
            );
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Pembayaran diverifikasi & Saldo Booking diupdate'], 200);
    }
}