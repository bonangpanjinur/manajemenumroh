<?php
/**
 * API Controller: Tabungan Umroh (Savings)
 * Endpoint Base: /wp-json/umh/v1/savings
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Savings {

    public function register_routes() {
        // 1. Get All Savings Accounts (Admin/Agent melihat list)
        register_rest_route('umh/v1', '/savings', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_savings_accounts'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // 2. Create New Savings Account (Buka Tabungan Baru)
        register_rest_route('umh/v1', '/savings', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_savings_account'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // 3. Get Single Account Details (Detail + Riwayat Transaksi)
        register_rest_route('umh/v1', '/savings/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_savings_detail'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // 4. Submit Deposit / Topup (Setor Tabungan)
        register_rest_route('umh/v1', '/savings/deposit', array(
            'methods' => 'POST',
            'callback' => array($this, 'submit_deposit'),
            'permission_callback' => array($this, 'permissions_check'), // User login bisa setor
        ));
        
        // 5. Verify Transaction (Admin memverifikasi setoran)
        register_rest_route('umh/v1', '/savings/verify/(?P<id>\d+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'verify_transaction'),
            'permission_callback' => array($this, 'admin_permissions_check'),
        ));
    }

    // --- CALLBACK FUNCTIONS ---

    public function get_savings_accounts($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_savings_accounts';
        $table_users = $wpdb->prefix . 'users'; // WP Users atau UMH Users tergantung setup
        
        // Filter by user_id jika yang request adalah jamaah biasa
        $current_user_id = get_current_user_id();
        $is_admin = current_user_can('manage_options');
        
        $sql = "SELECT s.*, u.display_name as jamaah_name 
                FROM $table s 
                LEFT JOIN $table_users u ON s.user_id = u.ID";

        if (!$is_admin) {
            $sql .= " WHERE s.user_id = $current_user_id";
        }
        
        $sql .= " ORDER BY s.created_at DESC";

        $results = $wpdb->get_results($sql);
        return rest_ensure_response($results);
    }

    public function create_savings_account($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_savings_accounts';
        
        $params = $request->get_json_params();
        
        // Validasi
        if (empty($params['target_amount']) || empty($params['tenure_years'])) {
            return new WP_Error('missing_params', 'Target dan Tenor wajib diisi', array('status' => 400));
        }

        $user_id = get_current_user_id();
        // Jika admin yang buatkan, bisa override user_id
        if (!empty($params['user_id']) && current_user_can('manage_options')) {
            $user_id = $params['user_id'];
        }

        // Hitung tanggal selesai otomatis
        $start_date = current_time('Y-m-d');
        $end_date = date('Y-m-d', strtotime("+" . $params['tenure_years'] . " years"));

        $data = array(
            'user_id' => $user_id,
            'package_id' => isset($params['package_id']) ? $params['package_id'] : NULL,
            'tenure_years' => $params['tenure_years'],
            'target_amount' => $params['target_amount'],
            'current_balance' => 0,
            'start_date' => $start_date,
            'end_date' => $end_date,
            'status' => 'active'
        );

        $format = array('%d', '%d', '%d', '%f', '%f', '%s', '%s', '%s');
        
        $wpdb->insert($table, $data, $format);
        $new_id = $wpdb->insert_id;

        if ($new_id) {
            return rest_ensure_response(array('success' => true, 'id' => $new_id, 'message' => 'Rekening tabungan berhasil dibuat.'));
        }
        
        return new WP_Error('db_error', 'Gagal membuat rekening', array('status' => 500));
    }

    public function get_savings_detail($request) {
        global $wpdb;
        $account_id = $request['id'];
        $table_acc = $wpdb->prefix . 'umh_savings_accounts';
        $table_trx = $wpdb->prefix . 'umh_savings_transactions';

        // Ambil Header Akun
        $account = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_acc WHERE id = %d", $account_id));

        if (!$account) {
            return new WP_Error('not_found', 'Akun tidak ditemukan', array('status' => 404));
        }

        // Cek permission (Hanya pemilik atau admin)
        $current_user = get_current_user_id();
        if ($account->user_id != $current_user && !current_user_can('manage_options')) {
            return new WP_Error('forbidden', 'Akses ditolak', array('status' => 403));
        }

        // Ambil Riwayat Transaksi
        $transactions = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_trx WHERE savings_account_id = %d ORDER BY transaction_date DESC", $account_id));

        return rest_ensure_response(array(
            'account' => $account,
            'transactions' => $transactions
        ));
    }

    public function submit_deposit($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_savings_transactions';
        $params = $request->get_json_params();

        // Validasi input
        if (empty($params['savings_account_id']) || empty($params['amount'])) {
            return new WP_Error('missing_data', 'Data tidak lengkap', array('status' => 400));
        }

        $data = array(
            'savings_account_id' => $params['savings_account_id'],
            'amount' => $params['amount'],
            'transaction_date' => current_time('Y-m-d'),
            'proof_file_url' => isset($params['proof_file_url']) ? $params['proof_file_url'] : '',
            'payment_method' => isset($params['payment_method']) ? $params['payment_method'] : 'transfer',
            'status' => 'pending', // Default pending, nunggu admin verify
            'notes' => isset($params['notes']) ? $params['notes'] : ''
        );

        $wpdb->insert($table, $data, array('%d', '%f', '%s', '%s', '%s', '%s', '%s'));

        return rest_ensure_response(array('success' => true, 'message' => 'Setoran berhasil dikirim, menunggu verifikasi admin.'));
    }

    public function verify_transaction($request) {
        global $wpdb;
        $trx_id = $request['id'];
        $params = $request->get_json_params();
        $status = isset($params['status']) ? $params['status'] : 'verified'; // verified atau rejected

        $table_trx = $wpdb->prefix . 'umh_savings_transactions';
        $table_acc = $wpdb->prefix . 'umh_savings_accounts';
        $table_finance = $wpdb->prefix . 'umh_finance'; // Integrasi ke Keuangan Utama

        // 1. Ambil data transaksi
        $trx = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_trx WHERE id = %d", $trx_id));
        if (!$trx || $trx->status != 'pending') {
            return new WP_Error('invalid_trx', 'Transaksi tidak valid atau sudah diproses', array('status' => 400));
        }

        // 2. Update Status Transaksi
        $wpdb->update(
            $table_trx, 
            array(
                'status' => $status, 
                'verified_by' => get_current_user_id(),
                'verified_at' => current_time('mysql')
            ),
            array('id' => $trx_id)
        );

        // 3. Jika VERIFIED, Update Saldo Akun & Catat di Finance
        if ($status === 'verified') {
            // A. Update Saldo
            $wpdb->query($wpdb->prepare("UPDATE $table_acc SET current_balance = current_balance + %f WHERE id = %d", $trx->amount, $trx->savings_account_id));

            // B. Masuk ke Laporan Keuangan (General Ledger)
            // Cek apakah kolom related_savings_id ada (untuk jaga2)
            $cols = $wpdb->get_col("DESC $table_finance", 0);
            $finance_data = array(
                'transaction_date' => current_time('Y-m-d'),
                'type' => 'income',
                'category' => 'Tabungan Umroh',
                'amount' => $trx->amount,
                'description' => 'Setoran Tabungan ID #' . $trx->savings_account_id,
                'payment_method' => $trx->payment_method,
                'proof_file' => $trx->proof_file_url,
                'status' => 'verified',
                'created_by' => get_current_user_id()
            );

            // Jika kolom relasi ada, masukkan ID tabungan
            if(in_array('related_savings_id', $cols)) {
                $finance_data['related_savings_id'] = $trx->savings_account_id;
            }

            $wpdb->insert($table_finance, $finance_data);
        }

        return rest_ensure_response(array('success' => true, 'message' => 'Transaksi berhasil diverifikasi.'));
    }

    // --- PERMISSIONS ---
    public function permissions_check() {
        return is_user_logged_in();
    }
    
    public function admin_permissions_check() {
        return current_user_can('manage_options');
    }
}