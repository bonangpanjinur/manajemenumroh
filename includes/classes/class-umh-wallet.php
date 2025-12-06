<?php
if (!defined('ABSPATH')) {
    exit;
}

class UMH_Wallet_Service {
    private $db;

    public function __construct() {
        global $wpdb;
        $this->db = $wpdb;
    }

    /**
     * Proses Mutasi Saldo (Atomic Transaction)
     */
    public function process_transaction($owner_type, $owner_id, $amount, $type, $ref_id, $desc) {
        try {
            // 1. Start DB Transaction
            $this->db->query('START TRANSACTION');

            $table_wallet = $this->db->prefix . 'umh_wallets';
            
            // 2. Lock Row (SELECT FOR UPDATE) - Mencegah double spending
            $wallet = $this->db->get_row($this->db->prepare(
                "SELECT id, balance FROM $table_wallet WHERE owner_type = %s AND owner_id = %d FOR UPDATE",
                $owner_type, $owner_id
            ));

            if (!$wallet) {
                // Auto create wallet jika belum ada
                $this->db->insert($table_wallet, ['owner_type' => $owner_type, 'owner_id' => $owner_id, 'balance' => 0]);
                $wallet_id = $this->db->insert_id;
                $current_balance = 0;
            } else {
                $wallet_id = $wallet->id;
                $current_balance = (float)$wallet->balance;
            }

            // 3. Hitung & Validasi Saldo
            $new_balance = $current_balance + $amount;
            if ($new_balance < 0) {
                throw new Exception("Saldo tidak mencukupi. Sisa: " . number_format($current_balance));
            }

            // 4. Update Saldo di Master Wallet
            $this->db->update($table_wallet, ['balance' => $new_balance], ['id' => $wallet_id]);

            // 5. Catat di History Mutasi
            $this->db->insert($this->db->prefix . 'umh_wallet_transactions', [
                'wallet_id' => $wallet_id,
                'type' => $type,
                'amount' => $amount,
                'balance_after' => $new_balance,
                'reference_id' => $ref_id,
                'description' => $desc,
                'created_by' => get_current_user_id(),
                'created_at' => current_time('mysql')
            ]);

            // 6. Commit Transaksi
            $this->db->query('COMMIT');
            return true;

        } catch (Exception $e) {
            $this->db->query('ROLLBACK');
            return new WP_Error('wallet_error', $e->getMessage());
        }
    }
}