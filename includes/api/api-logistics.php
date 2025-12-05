<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Logistics extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_inventory_items');
    }

    public function register_routes() {
        parent::register_routes();

        // Endpoint Distribusi Barang ke Jemaah
        register_rest_route('umh/v1', '/logistics/distribute', [
            'methods' => 'POST',
            'callback' => [$this, 'distribute_item'],
            'permission_callback' => '__return_true',
        ]);
        
        // Get Riwayat Distribusi
        register_rest_route('umh/v1', '/logistics/distribution-history', [
            'methods' => 'GET',
            'callback' => [$this, 'get_distribution_history'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function distribute_item($request) {
        $data = $request->get_json_params();
        
        // 1. Validasi Stok
        $item = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $data['item_id']));
        
        if ($item->stock_qty < $data['qty']) {
            return new WP_REST_Response(['message' => 'Stok barang tidak mencukupi'], 400);
        }

        // 2. Catat Distribusi
        $dist_table = $this->db->prefix . 'umh_logistics_distribution';
        $this->db->insert($dist_table, [
            'booking_id' => $data['booking_id'],
            'jamaah_id' => $data['jamaah_id'],
            'item_id' => $data['item_id'],
            'qty' => $data['qty'],
            'status' => 'taken',
            'taken_date' => current_time('mysql'),
            'created_at' => current_time('mysql')
        ]);

        // 3. Kurangi Stok
        $this->db->query($this->db->prepare(
            "UPDATE {$this->table_name} SET stock_qty = stock_qty - %d WHERE id = %d",
            $data['qty'], $data['item_id']
        ));

        return new WP_REST_Response(['success' => true, 'message' => 'Barang berhasil diserahkan'], 201);
    }

    public function get_distribution_history($request) {
        $dist_table = $this->db->prefix . 'umh_logistics_distribution';
        $item_table = $this->table_name;
        $jamaah_table = $this->db->prefix . 'umh_jamaah';

        $results = $this->db->get_results("
            SELECT d.*, i.item_name, j.full_name as jamaah_name
            FROM {$dist_table} d
            JOIN {$item_table} i ON d.item_id = i.id
            JOIN {$jamaah_table} j ON d.jamaah_id = j.id
            ORDER BY d.taken_date DESC LIMIT 50
        ");

        return new WP_REST_Response(['success' => true, 'data' => $results], 200);
    }
}