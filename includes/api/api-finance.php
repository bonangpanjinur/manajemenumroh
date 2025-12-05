<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Finance extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_finance');
    }

    public function register_routes() {
        parent::register_routes();

        // Endpoint Summary Laporan Keuangan
        register_rest_route('umh/v1', '/finance/summary', [
            'methods' => 'GET',
            'callback' => [$this, 'get_finance_summary'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Override Create: Catat Transaksi Keuangan (Manual)
     * Digunakan untuk input Pengeluaran (Expense) atau Pemasukan Lain-lain
     */
    public function create_item($request) {
        $data = $request->get_json_params();

        // Validasi
        if (empty($data['amount']) || empty($data['type']) || empty($data['title'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'Data tidak lengkap'], 400);
        }

        $data['transaction_date'] = !empty($data['transaction_date']) ? $data['transaction_date'] : current_time('mysql');
        
        // Simpan ke Database
        $format = array_fill(0, count($data), '%s');
        $this->db->insert($this->table_name, $data, $format);
        $new_id = $this->db->insert_id;

        $new_item = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $new_id));
        return new WP_REST_Response(['success' => true, 'data' => $new_item], 201);
    }

    /**
     * Custom Endpoint: Ringkasan Keuangan (Dashboard)
     */
    public function get_finance_summary($request) {
        // Hitung Total Pemasukan
        $income = $this->db->get_var("SELECT SUM(amount) FROM {$this->table_name} WHERE type = 'income' AND deleted_at IS NULL");
        
        // Hitung Total Pengeluaran
        $expense = $this->db->get_var("SELECT SUM(amount) FROM {$this->table_name} WHERE type = 'expense' AND deleted_at IS NULL");

        // Saldo Saat Ini
        $balance = floatval($income) - floatval($expense);

        // Data Grafik (Per Bulan di Tahun Ini)
        $current_year = date('Y');
        $monthly_stats = $this->db->get_results("
            SELECT 
                MONTH(transaction_date) as month, 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
            FROM {$this->table_name}
            WHERE YEAR(transaction_date) = {$current_year} AND deleted_at IS NULL
            GROUP BY MONTH(transaction_date)
            ORDER BY month ASC
        ");

        return new WP_REST_Response([
            'success' => true,
            'summary' => [
                'total_income' => floatval($income),
                'total_expense' => floatval($expense),
                'balance' => $balance
            ],
            'chart_data' => $monthly_stats
        ], 200);
    }
}