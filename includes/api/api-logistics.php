<?php
/**
 * API Handler untuk Logistik (Inventory & Distribusi ke Jemaah)
 * Mendukung manajemen stok gudang dan pencatatan pengambilan barang oleh jemaah.
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Logistics {
    private $tbl_inv;
    private $tbl_dist;
    private $tbl_pax;
    private $tbl_jamaah;

    public function __construct() {
        global $wpdb;
        $this->tbl_inv    = $wpdb->prefix . 'umh_inventory_items';
        $this->tbl_dist   = $wpdb->prefix . 'umh_logistics_distribution';
        $this->tbl_pax    = $wpdb->prefix . 'umh_booking_passengers'; // Jika tracking per booking
        $this->tbl_jamaah = $wpdb->prefix . 'umh_jamaah'; // Jika tracking per person
    }

    public function register_routes() {
        // --- INVENTORY (BARANG) ---
        register_rest_route('umh/v1', '/logistics/items', [
            'methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/logistics/items', [
            'methods' => 'POST', 'callback' => [$this, 'create_item'], 'permission_callback' => [$this, 'check_permission']
        ]);
        // Update Stok (Opname/Adjustment)
        register_rest_route('umh/v1', '/logistics/items/(?P<id>\d+)', [
            'methods' => 'PUT', 'callback' => [$this, 'update_item'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/logistics/items/(?P<id>\d+)', [
            'methods' => 'DELETE', 'callback' => [$this, 'delete_item'], 'permission_callback' => [$this, 'check_permission']
        ]);

        // --- DISTRIBUSI (PENGAMBILAN) ---
        register_rest_route('umh/v1', '/logistics/distribution', [
            'methods' => 'POST', 'callback' => [$this, 'record_distribution'], 'permission_callback' => [$this, 'check_permission']
        ]);
        // Riwayat Distribusi
        register_rest_route('umh/v1', '/logistics/distribution', [
            'methods' => 'GET', 'callback' => [$this, 'get_distribution_history'], 'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    // ==========================================================================
    // MODULE 1: INVENTORY MANAGEMENT
    // ==========================================================================

    public function get_items($request) {
        global $wpdb;
        $items = $wpdb->get_results("SELECT * FROM {$this->tbl_inv} ORDER BY item_name ASC");
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function create_item($request) {
        global $wpdb;
        $p = $request->get_json_params();
        
        // Validasi
        if (empty($p['item_name'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'Nama barang wajib diisi'], 400);
        }

        $wpdb->insert($this->tbl_inv, [
            'item_code' => strtoupper(sanitize_text_field($p['item_code'])),
            'item_name' => sanitize_text_field($p['item_name']),
            'stock_qty' => intval($p['stock_qty']),
            'min_stock_alert' => intval($p['min_stock_alert'] ?? 10)
        ]);

        return new WP_REST_Response(['success' => true, 'id' => $wpdb->insert_id, 'message' => 'Barang ditambahkan'], 201);
    }

    public function update_item($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $p = $request->get_json_params();
        
        $data = [];
        if(isset($p['item_name'])) $data['item_name'] = sanitize_text_field($p['item_name']);
        if(isset($p['stock_qty'])) $data['stock_qty'] = intval($p['stock_qty']);
        if(isset($p['min_stock_alert'])) $data['min_stock_alert'] = intval($p['min_stock_alert']);

        if (!empty($data)) {
            $wpdb->update($this->tbl_inv, $data, ['id' => $id]);
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Barang diupdate'], 200);
    }

    public function delete_item($request) {
        global $wpdb;
        $id = $request->get_param('id');
        
        // Cek apakah barang sudah pernah didistribusikan?
        $used = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$this->tbl_dist} WHERE item_id = %d LIMIT 1", $id));
        if ($used) {
            return new WP_REST_Response(['success' => false, 'message' => 'Gagal hapus: Barang sudah memiliki riwayat distribusi'], 400);
        }

        $wpdb->delete($this->tbl_inv, ['id' => $id]);
        return new WP_REST_Response(['success' => true, 'message' => 'Barang dihapus'], 200);
    }

    // ==========================================================================
    // MODULE 2: DISTRIBUTION (TRANSAKSI BARANG KELUAR)
    // ==========================================================================

    public function record_distribution($request) {
        global $wpdb;
        $p = $request->get_json_params();
        /*
          Payload Expected: 
          { 
            "booking_passenger_id": 105, (ID dari tabel umh_booking_passengers / umh_jamaah) 
            "item_id": 1, 
            "qty": 1,
            "status": "taken" 
          }
        */

        $item_id = intval($p['item_id']);
        $qty = intval($p['qty']);
        $pax_id = intval($p['booking_passenger_id']);

        if (!$item_id || !$qty || !$pax_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Data tidak lengkap'], 400);
        }

        // 1. Cek Stok Terlebih Dahulu
        $stock = $wpdb->get_var($wpdb->prepare("SELECT stock_qty FROM {$this->tbl_inv} WHERE id = %d", $item_id));
        
        if ($stock < $qty) {
            return new WP_REST_Response(['success' => false, 'message' => "Stok tidak mencukupi. Sisa stok: $stock"], 400);
        }

        // 2. Insert Record Distribusi
        // Note: Kita menggunakan 'booking_passenger_id' sesuai schema V4.0. 
        // Jika frontend mengirim ID Jamaah (master), pastikan logikanya konsisten.
        // Di sini kita asumsikan ID yang dikirim valid.
        $wpdb->insert($this->tbl_dist, [
            'booking_passenger_id' => $pax_id,
            'item_id' => $item_id,
            'qty' => $qty,
            'status' => 'taken', // Barang diambil
            'taken_date' => current_time('mysql')
        ]);

        // 3. Kurangi Stok Gudang (Automatic Inventory Deduction)
        $wpdb->query($wpdb->prepare("UPDATE {$this->tbl_inv} SET stock_qty = stock_qty - %d WHERE id = %d", $qty, $item_id));

        return new WP_REST_Response(['success' => true, 'message' => 'Barang berhasil diserahkan & stok dikurangi'], 200);
    }
    
    public function get_distribution_history($request) {
        global $wpdb;
        $search = $request->get_param('search');
        
        // Query untuk melihat riwayat pengambilan barang
        // Join ke tabel Jamaah agar muncul nama orangnya
        // Catatan: Jika booking_passenger_id merujuk ke tabel pax, kita perlu join ke pax dulu lalu ke jamaah
        // Asumsi simplifikasi: booking_passenger_id menyimpan ID Jamaah (jika sistem simple) 
        // ATAU join kompleks jika sistem strict.
        
        // Versi Strict V4.0 (Join ke Pax -> Jamaah)
        // Jika Pax belum ada, fallback direct join ke Jamaah (untuk fleksibilitas)
        
        $sql = "SELECT d.*, i.item_name, j.full_name as jamaah_name, j.passport_number
                FROM {$this->tbl_dist} d
                JOIN {$this->tbl_inv} i ON d.item_id = i.id
                -- Disini kita asumsikan ID yang disimpan adalah ID Jamaah langsung untuk memudahkan pencarian di master data
                -- Jika menggunakan ID Pax, querynya: JOIN umh_booking_passengers p ON d.booking_passenger_id = p.id JOIN umh_jamaah j ON p.jamaah_id = j.id
                LEFT JOIN {$this->tbl_jamaah} j ON d.booking_passenger_id = j.id 
                ORDER BY d.taken_date DESC LIMIT 50";
                
        $items = $wpdb->get_results($sql);
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }
}