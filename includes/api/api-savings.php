<?php

class UMH_API_Savings {

    public function register_routes() {
        // 1. PUBLIC: List Paket (Bisa diakses Landing Page / Guest)
        register_rest_route('umh/v1', '/savings/packages', [
            ['methods' => 'GET', 'callback' => [$this, 'get_packages'], 'permission_callback' => '__return_true'], // Public
            ['methods' => 'POST', 'callback' => [$this, 'create_package'], 'permission_callback' => [$this, 'check_admin_permission']], // Admin Only
        ]);

        // 2. JAMAAH & ADMIN: Rekening Tabungan
        // GET: Jika Admin lihat semua, Jika Jamaah lihat punya sendiri
        register_rest_route('umh/v1', '/savings/accounts', [
            ['methods' => 'GET', 'callback' => [$this, 'get_accounts'], 'permission_callback' => [$this, 'check_auth_permission']],
            ['methods' => 'POST', 'callback' => [$this, 'create_account'], 'permission_callback' => [$this, 'check_admin_permission']], // Hanya admin yang boleh Buka Rekening untuk verifikasi KYC
        ]);

        // 3. ADMIN ONLY: Adjust Target (Inflasi)
        register_rest_route('umh/v1', '/savings/accounts/(?P<id>\d+)/adjust-target', [
            ['methods' => 'POST', 'callback' => [$this, 'adjust_target_amount'], 'permission_callback' => [$this, 'check_admin_permission']],
        ]);

        // 4. JAMAAH & ADMIN: Transaksi
        register_rest_route('umh/v1', '/savings/transactions', [
            ['methods' => 'GET', 'callback' => [$this, 'get_transactions'], 'permission_callback' => [$this, 'check_auth_permission']],
            ['methods' => 'POST', 'callback' => [$this, 'create_transaction'], 'permission_callback' => [$this, 'check_auth_permission']], // Jamaah boleh setor (upload bukti)
        ]);

        register_rest_route('umh/v1', '/savings/transactions/(?P<id>\d+)/verify', [
            ['methods' => 'POST', 'callback' => [$this, 'verify_transaction'], 'permission_callback' => [$this, 'check_admin_permission']], // Hanya admin yang boleh verifikasi
        ]);
    }

    // --- PERMISSIONS ---

    public function check_admin_permission() {
        return current_user_can('manage_options') || current_user_can('edit_posts');
    }

    public function check_auth_permission() {
        return is_user_logged_in();
    }

    // --- HELPER: Get Jamaah ID from Current User ---
    private function get_current_jamaah_id() {
        global $wpdb;
        $user_id = get_current_user_id();
        // Cari ID Jamaah berdasarkan user_id WordPress
        $jamaah_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_jamaah WHERE user_id = %d", $user_id));
        return $jamaah_id;
    }

    // --- PAKET (Updated for Public Access) ---

    public function get_packages($request) {
        global $wpdb;
        $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_savings_packages WHERE is_active = 1 ORDER BY id DESC");
        return rest_ensure_response($results);
    }

    public function create_package($request) {
        global $wpdb;
        $params = $request->get_json_params();
        
        $wpdb->insert(
            "{$wpdb->prefix}umh_savings_packages",
            [
                'name' => $params['name'],
                'package_type' => $params['package_type'], 
                'description' => $params['description'],
                'target_amount' => $params['target_amount'],
                'duration_months' => $params['duration_months']
            ]
        );
        return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id]);
    }

    // --- AKUN (Secured Context) ---

    public function get_accounts($request) {
        global $wpdb;
        $user_id = get_current_user_id();
        $is_admin = $this->check_admin_permission();

        $sql = "SELECT a.*, j.full_name as jamaah_name, p.name as package_name, p.package_type 
                FROM {$wpdb->prefix}umh_savings_accounts a
                LEFT JOIN {$wpdb->prefix}umh_jamaah j ON a.jamaah_id = j.id
                LEFT JOIN {$wpdb->prefix}umh_savings_packages p ON a.package_id = p.id";

        // LOGIKA PENTING: Jika bukan admin, filter hanya milik sendiri
        if (!$is_admin) {
            $my_jamaah_id = $this->get_current_jamaah_id();
            if (!$my_jamaah_id) {
                return new WP_Error('no_jamaah', 'User ini belum terhubung ke data Jamaah', ['status' => 403]);
            }
            $sql .= $wpdb->prepare(" WHERE a.jamaah_id = %d", $my_jamaah_id);
        }

        $sql .= " ORDER BY a.created_at DESC";
        
        $results = $wpdb->get_results($sql);
        return rest_ensure_response($results);
    }

    public function create_account($request) {
        global $wpdb;
        $params = $request->get_json_params();

        // Generate Account Number
        $acc_number = 'SV-' . date('y') . '-' . mt_rand(1000, 9999);

        $wpdb->insert(
            "{$wpdb->prefix}umh_savings_accounts",
            [
                'jamaah_id' => $params['jamaah_id'],
                'package_id' => $params['package_id'],
                'account_number' => $acc_number,
                'start_date' => date('Y-m-d'),
                'end_date_estimation' => date('Y-m-d', strtotime("+" . $params['duration_months'] . " months")),
                'target_amount' => $params['target_amount'], 
                'current_balance' => 0,
                'status' => 'active'
            ]
        );

        return rest_ensure_response(['success' => true, 'message' => 'Rekening tabungan berhasil dibuat']);
    }

    public function adjust_target_amount($request) {
        global $wpdb;
        $id = $request['id'];
        $params = $request->get_json_params();
        $new_amount = $params['new_amount'];

        $wpdb->update(
            "{$wpdb->prefix}umh_savings_accounts",
            ['target_amount' => $new_amount],
            ['id' => $id]
        );

        return rest_ensure_response(['success' => true, 'message' => 'Target tabungan disesuaikan']);
    }

    // --- TRANSAKSI (Secured Context) ---

    public function get_transactions($request) {
        global $wpdb;
        $status = $request->get_param('status');
        $is_admin = $this->check_admin_permission();
        
        $sql = "SELECT t.*, a.account_number, j.full_name as jamaah_name 
                FROM {$wpdb->prefix}umh_savings_transactions t
                JOIN {$wpdb->prefix}umh_savings_accounts a ON t.account_id = a.id
                JOIN {$wpdb->prefix}umh_jamaah j ON a.jamaah_id = j.id";
        
        $where_clauses = [];

        // Filter Status (jika ada request)
        if ($status) {
            $where_clauses[] = $wpdb->prepare("t.status = %s", $status);
        }

        // Filter User (Jika Jamaah, lihat trx dia saja)
        if (!$is_admin) {
            $my_jamaah_id = $this->get_current_jamaah_id();
            if (!$my_jamaah_id) {
                return rest_ensure_response([]); // Return kosong jika tidak ada data jamaah
            }
            $where_clauses[] = $wpdb->prepare("a.jamaah_id = %d", $my_jamaah_id);
        }

        if (!empty($where_clauses)) {
            $sql .= " WHERE " . implode(' AND ', $where_clauses);
        }
        
        $sql .= " ORDER BY t.created_at DESC";

        $results = $wpdb->get_results($sql);
        return rest_ensure_response($results);
    }

    public function create_transaction($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $user_id = get_current_user_id();
        $is_admin = $this->check_admin_permission();

        // Validasi Keamanan:
        // Jika User Biasa (Jamaah) mencoba input, pastikan account_id itu milik dia!
        if (!$is_admin) {
            $my_jamaah_id = $this->get_current_jamaah_id();
            
            $ownership = $wpdb->get_var($wpdb->prepare(
                "SELECT id FROM {$wpdb->prefix}umh_savings_accounts WHERE id = %d AND jamaah_id = %d",
                $params['account_id'],
                $my_jamaah_id
            ));

            if (!$ownership) {
                return new WP_Error('forbidden', 'Anda tidak berhak melakukan transaksi untuk rekening ini.', ['status' => 403]);
            }
        }

        // Logic Insert
        $wpdb->insert(
            "{$wpdb->prefix}umh_savings_transactions",
            [
                'account_id' => $params['account_id'],
                'amount' => $params['amount'],
                'type' => 'deposit',
                'proof_url' => $params['proof_url'] ?? '',
                'transaction_date' => date('Y-m-d H:i:s'),
                'status' => 'pending', 
                'notes' => $params['notes'] ?? ''
            ]
        );

        return rest_ensure_response(['success' => true, 'message' => 'Setoran berhasil dicatat, menunggu verifikasi']);
    }

    public function verify_transaction($request) {
        global $wpdb;
        $id = $request['id'];
        $params = $request->get_json_params(); 
        $new_status = $params['status'];
        $user_id = get_current_user_id();

        // 1. Update status transaksi
        $wpdb->update(
            "{$wpdb->prefix}umh_savings_transactions",
            [
                'status' => $new_status,
                'verified_by' => $user_id,
                'verified_at' => current_time('mysql')
            ],
            ['id' => $id]
        );

        // 2. Jika Verified, Update Saldo Akun
        if ($new_status === 'verified') {
            $trx = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_savings_transactions WHERE id = %d", $id));
            
            $sql_update = "UPDATE {$wpdb->prefix}umh_savings_accounts 
                           SET current_balance = current_balance + %f 
                           WHERE id = %d";
            $wpdb->query($wpdb->prepare($sql_update, $trx->amount, $trx->account_id));
        }

        return rest_ensure_response(['success' => true, 'message' => 'Transaksi diperbarui']);
    }
}