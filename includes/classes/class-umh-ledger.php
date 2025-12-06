<?php
if (!defined('ABSPATH')) {
    exit;
}

class UMH_Ledger_Service {
    private $db;

    public function __construct() {
        global $wpdb;
        $this->db = $wpdb;
    }

    /**
     * Mencatat Transaksi Jurnal (General Ledger)
     */
    public function record_journal($date, $ref, $desc, $module, $source_id, $entries) {
        $total_debit = 0;
        $total_credit = 0;

        foreach ($entries as $e) {
            $total_debit += $e['debit'];
            $total_credit += $e['credit'];
        }

        // Validasi Balance (Toleransi floating point kecil)
        if (abs($total_debit - $total_credit) > 1) {
            return new WP_Error('unbalanced', "Jurnal tidak seimbang. Debit: $total_debit, Kredit: $total_credit");
        }

        // 1. Insert Header Jurnal
        $table_journal = $this->db->prefix . 'umh_acc_journal_entries';
        $this->db->insert($table_journal, [
            'transaction_date' => $date,
            'reference_no' => $ref,
            'description' => $desc,
            'total_amount' => $total_debit,
            'source_module' => $module,
            'source_id' => $source_id,
            'status' => 'posted',
            'created_at' => current_time('mysql')
        ]);
        
        $journal_id = $this->db->insert_id;
        if (!$journal_id) return new WP_Error('db_error', 'Gagal membuat header jurnal');

        // 2. Insert Detail Items (Debit/Kredit)
        $table_items = $this->db->prefix . 'umh_acc_journal_items';
        $table_coa = $this->db->prefix . 'umh_acc_coa';

        foreach ($entries as $item) {
            // Cari ID COA berdasarkan Kode Akun
            $coa_id = $this->db->get_var($this->db->prepare("SELECT id FROM $table_coa WHERE code = %s", $item['code']));
            
            if ($coa_id) {
                $this->db->insert($table_items, [
                    'journal_id' => $journal_id,
                    'coa_id' => $coa_id,
                    'debit' => $item['debit'],
                    'credit' => $item['credit'],
                    'description' => isset($item['desc']) ? $item['desc'] : $desc
                ]);
            }
        }
        return $journal_id;
    }

    /**
     * Helper: Posting Verifikasi Pembayaran Manual (Booking)
     * Alur: Debit Bank (Aset Bertambah) -> Kredit Titipan Jemaah (Kewajiban Bertambah)
     */
    public function post_payment_verification($proof_id, $booking_code, $amount, $bank_name = 'BCA') {
        // Mapping Akun Bank (Idealnya dari settings, ini hardcode untuk contoh)
        $bank_coa = ($bank_name === 'Mandiri') ? '1-1003' : '1-1002'; 
        
        $entries = [
            ['code' => $bank_coa, 'debit' => $amount, 'credit' => 0, 'desc' => "Masuk ke $bank_name"],
            ['code' => '2-1002', 'debit' => 0, 'credit' => $amount, 'desc' => "Deposit Booking $booking_code"]
        ];

        return $this->record_journal(
            current_time('Y-m-d'), 
            "PYM-$booking_code", 
            "Terima Pembayaran Booking #$booking_code", 
            'payment_proof', 
            $proof_id, 
            $entries
        );
    }
}