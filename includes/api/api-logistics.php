<?php
/**
 * File: includes/api/api-logistics.php
 * Deskripsi: API Endpoint untuk Manajemen Inventaris Barang dan Distribusi Perlengkapan Jemaah
 */

require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Logistics extends UMH_CRUD_Controller {

    public function __construct() {
        // Parent: CRUD untuk Master Inventaris
        parent::__construct('umh_inventory_items');
    }

    public function register_routes() {
        // CRUD Standar untuk Item Inventaris
        parent::register_routes(); 

        // Endpoint: CRUD untuk Master Warehouse/Gudang
        register_rest_route('umh/v1', '/warehouses', [
            'methods' => ['GET', 'POST'], 'callback' => [$this, 'handle_warehouses'], 'permission_callback' => '__return_true'
        ]);
        register_rest_route('umh/v1', '/warehouses/(?P<id>\d+)', [
            'methods' => ['PUT', 'DELETE'], 'callback' => [$this, 'handle_warehouses'], 'permission_callback' => '__return_true'
        ]);

        // Endpoint: Distribusi Perlengkapan
        register_rest_route('umh/v1', '/logistics/distribution', [
            'methods' => ['GET', 'POST'], 'callback' => [$this, 'handle_distribution'], 'permission_callback' => '__return_true'
        ]);
        
        // Endpoint: Ambil Stok per Item
        register_rest_route('umh/v1', '/inventory/(?P<id>\d+)/transactions', [
            'methods' => 'GET', 'callback' => [$this, 'get_item_transactions'], 'permission_callback' => '__return_true'
        ]);
    }
    
    // Handler CRUD Warehouse
    public function handle_warehouses($request) {
        $this->table_name = $this->db->prefix . 'umh_warehouses';
        return $this->process_request($request);
    }

    // Handler Distribusi Perlengkapan
    public function handle_distribution($request) {
        $this->table_name = $this->db->prefix . 'umh_logistics_distribution';
        return $this->process_request($request);
    }
    
    // Ambil Riwayat Transaksi Stok (IN/OUT)
    public function get_item_transactions($request) {
        $item_id = $request->get_param('id');
        $data = $this->db->get_results($this->db->prepare(
            "SELECT * FROM {$this->db->prefix}umh_inventory_transactions WHERE item_id = %d ORDER BY created_at DESC", 
            $item_id
        ));
        return new WP_REST_Response(['success' => true, 'data' => $data], 200);
    }

    // Override: Penambahan/Pengurangan Stok harus melalui Transaksi Logistik (Audit Trail)
    public function update_item($request) {
        $data = $request->get_json_params();
        $item_id = $request->get_param('id');

        if (isset($data['stock_adjustment'])) {
            $adjustment = intval($data['stock_adjustment']);
            $notes = $data['notes'] ?? 'Penyesuaian stok manual';
            
            // 1. Ambil Stok Lama
            $current_stock = $this->db->get_var($this->db->prepare("SELECT stock_qty FROM {$this->table_name} WHERE id = %d", $item_id));
            $new_stock = $current_stock + $adjustment;
            
            if ($new_stock < 0) {
                 return new WP_REST_Response(['message' => 'Stok tidak boleh minus.'], 400);
            }

            $this->db->query('START TRANSACTION');
            try {
                // 2. Catat Transaksi Inventaris
                $this->db->insert($this->db->prefix . 'umh_inventory_transactions', [
                    'item_id' => $item_id,
                    'warehouse_id' => $data['warehouse_id'] ?? 1,
                    'type' => $adjustment > 0 ? 'in' : 'out', // Simplifikasi IN/OUT
                    'qty' => abs($adjustment),
                    'reference_no' => 'ADJ-' . time(),
                    'notes' => $notes,
                    'created_at' => current_time('mysql')
                ]);

                // 3. Update Stok Master
                $this->db->update($this->table_name, ['stock_qty' => $new_stock], ['id' => $item_id]);

                $this->db->query('COMMIT');
                return new WP_REST_Response(['success' => true, 'message' => 'Stok berhasil disesuaikan.'], 200);
                
            } catch (Exception $e) {
                $this->db->query('ROLLBACK');
                return new WP_REST_Response(['message' => 'Gagal menyesuaikan stok: ' . $e->getMessage()], 500);
            }
        }

        // Untuk update non-stok (Nama, Harga, dll)
        return parent::update_item($request);
    }
}