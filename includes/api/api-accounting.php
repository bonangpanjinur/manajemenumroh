<?php
/**
 * File: includes/api/api-accounting.php
 * Lokasi: includes/api/api-accounting.php
 * Deskripsi: API Endpoint untuk Modul Akuntansi (COA, Jurnal, Laporan Keuangan)
 */

require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Accounting extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_acc_journal_entries');
    }

    public function register_routes() {
        // Route untuk COA
        register_rest_route('umh/v1', '/accounting/coa', [
            'methods' => 'GET',
            'callback' => [$this, 'get_coa'],
            'permission_callback' => '__return_true',
        ]);
        
        // Route untuk Laporan Keuangan
        register_rest_route('umh/v1', '/accounting/reports/balance-sheet', [
            'methods' => 'GET',
            'callback' => [$this, 'get_balance_sheet'],
            'permission_callback' => '__return_true',
        ]);
        
        register_rest_route('umh/v1', '/accounting/reports/profit-loss', [
            'methods' => 'GET',
            'callback' => [$this, 'get_profit_loss'],
            'permission_callback' => '__return_true',
        ]);
    }

    // Helper: Buat Jurnal Otomatis (Dipanggil oleh modul lain)
    public function create_auto_journal($date, $ref, $desc, $total, $source_mod, $source_id, $items) {
        // 1. Buat Header
        $this->db->insert($this->db->prefix . 'umh_acc_journal_entries', [
            'transaction_date' => $date,
            'reference_no' => $ref,
            'description' => $desc,
            'total_amount' => $total,
            'source_module' => $source_mod,
            'source_id' => $source_id,
            'status' => 'posted',
            'created_at' => current_time('mysql')
        ]);
        $journal_id = $this->db->insert_id;

        // 2. Buat Items (Debit/Kredit)
        foreach ($items as $item) {
            // $item format: ['coa_code' => '1-1001', 'debit' => 0, 'credit' => 100000]
            // Cari ID COA berdasarkan Kode
            $coa_id = $this->db->get_var($this->db->prepare("SELECT id FROM {$this->db->prefix}umh_acc_coa WHERE code = %s", $item['coa_code']));
            
            if ($coa_id) {
                $this->db->insert($this->db->prefix . 'umh_acc_journal_items', [
                    'journal_id' => $journal_id,
                    'coa_id' => $coa_id,
                    'debit' => isset($item['debit']) ? $item['debit'] : 0,
                    'credit' => isset($item['credit']) ? $item['credit'] : 0,
                    'description' => isset($item['desc']) ? $item['desc'] : $desc
                ]);
            }
        }
        return $journal_id;
    }

    public function get_coa($request) {
        $data = $this->db->get_results("SELECT * FROM {$this->db->prefix}umh_acc_coa ORDER BY code ASC");
        return new WP_REST_Response(['success' => true, 'data' => $data], 200);
    }

    public function get_balance_sheet($request) {
        // Logika Sederhana Neraca: Sum(Debit) - Sum(Credit) per Akun Aset/Liabilitas/Ekuitas
        $query = "SELECT c.code, c.name, c.type, 
                         SUM(ji.debit) as total_debit, SUM(ji.credit) as total_credit
                  FROM {$this->db->prefix}umh_acc_coa c
                  LEFT JOIN {$this->db->prefix}umh_acc_journal_items ji ON c.id = ji.coa_id
                  WHERE c.type IN ('asset', 'liability', 'equity')
                  GROUP BY c.id ORDER BY c.code ASC";
        
        $raw = $this->db->get_results($query);
        
        // Format Data
        $report = ['assets' => [], 'liabilities' => [], 'equity' => []];
        $totals = ['assets' => 0, 'liabilities' => 0, 'equity' => 0];

        foreach ($raw as $row) {
            $balance = ($row->type == 'asset') ? ($row->total_debit - $row->total_credit) : ($row->total_credit - $row->total_debit);
            $type_key = ($row->type == 'asset') ? 'assets' : (($row->type == 'liability') ? 'liabilities' : 'equity');
            
            $report[$type_key][] = ['code' => $row->code, 'name' => $row->name, 'balance' => $balance];
            $totals[$type_key] += $balance;
        }

        return new WP_REST_Response(['success' => true, 'data' => $report, 'totals' => $totals], 200);
    }

    public function get_profit_loss($request) {
        // Logika Laba Rugi: Pendapatan - Beban
        $query = "SELECT c.code, c.name, c.type, 
                         SUM(ji.debit) as total_debit, SUM(ji.credit) as total_credit
                  FROM {$this->db->prefix}umh_acc_coa c
                  LEFT JOIN {$this->db->prefix}umh_acc_journal_items ji ON c.id = ji.coa_id
                  WHERE c.type IN ('revenue', 'expense')
                  GROUP BY c.id ORDER BY c.code ASC";
        
        $raw = $this->db->get_results($query);
        
        $report = ['revenue' => [], 'expense' => []];
        $totals = ['revenue' => 0, 'expense' => 0];

        foreach ($raw as $row) {
            $balance = ($row->type == 'revenue') ? ($row->total_credit - $row->total_debit) : ($row->total_debit - $row->total_credit);
            $type_key = $row->type;
            
            $report[$type_key][] = ['code' => $row->code, 'name' => $row->name, 'balance' => $balance];
            $totals[$type_key] += $balance;
        }

        $net_income = $totals['revenue'] - $totals['expense'];

        return new WP_REST_Response(['success' => true, 'data' => $report, 'totals' => $totals, 'net_income' => $net_income], 200);
    }
}