<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Logistics extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_inventory_items');
    }

    public function register_routes() {
        parent::register_routes(); // CRUD Inventory Standar

        // 1. Cari Data Logistik per Booking Code
        register_rest_route('umh/v1', '/logistics/search-booking', [
            'methods' => 'GET', 'callback' => [$this, 'search_booking_logistics'], 'permission_callback' => '__return_true',
        ]);

        // 2. Proses Penyerahan Barang (Distribusi)
        register_rest_route('umh/v1', '/logistics/distribute-items', [
            'methods' => 'POST', 'callback' => [$this, 'distribute_items_bulk'], 'permission_callback' => '__return_true',
        ]);

        // 3. Riwayat
        register_rest_route('umh/v1', '/logistics/history', [
            'methods' => 'GET', 'callback' => [$this, 'get_distribution_history'], 'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Mencari booking dan status pengambilan barang setiap jemaahnya
     */
    public function search_booking_logistics($request) {
        $code = $request->get_param('code');
        if (!$code) return new WP_REST_Response(['message' => 'Kode Booking wajib diisi'], 400);

        // 1. Cari Booking Header
        $booking = $this->db->get_row($this->db->prepare(
            "SELECT id, booking_code, contact_name, status FROM {$this->db->prefix}umh_bookings WHERE booking_code = %s",
            $code
        ));

        if (!$booking) return new WP_REST_Response(['message' => 'Booking tidak ditemukan'], 404);

        // 2. Ambil Jemaah dalam booking ini
        $pax = $this->db->get_results($this->db->prepare(
            "SELECT p.id as pax_id, p.jamaah_id, j.full_name, j.gender 
             FROM {$this->db->prefix}umh_booking_passengers p
             JOIN {$this->db->prefix}umh_jamaah j ON p.jamaah_id = j.id
             WHERE p.booking_id = %d",
            $booking->id
        ));

        // 3. Ambil Item Logistik (Koper, Seragam, dll)
        // Idealnya difilter berdasarkan Paket, tapi kita ambil semua 'perlengkapan' aktif dulu
        $items = $this->db->get_results("SELECT id, item_name, stock_qty FROM {$this->table_name} WHERE category='perlengkapan'");

        // 4. Cek Status Pengambilan per Jemaah
        foreach ($pax as $person) {
            $taken_items = $this->db->get_results($this->db->prepare(
                "SELECT item_id, qty, taken_date FROM {$this->db->prefix}umh_logistics_distribution 
                 WHERE booking_id = %d AND jamaah_id = %d",
                $booking->id, $person->jamaah_id
            ));
            
            // Map status pengambilan ke daftar item master
            $person->logistics_status = [];
            foreach ($items as $item) {
                $is_taken = false;
                $taken_date = null;
                foreach ($taken_items as $taken) {
                    if ($taken->item_id == $item->id) {
                        $is_taken = true;
                        $taken_date = $taken->taken_date;
                        break;
                    }
                }
                $person->logistics_status[] = [
                    'item_id' => $item->id,
                    'item_name' => $item->item_name,
                    'current_stock' => $item->stock_qty,
                    'is_taken' => $is_taken,
                    'taken_date' => $taken_date
                ];
            }
        }

        return new WP_REST_Response([
            'success' => true, 
            'booking' => $booking,
            'pax' => $pax
        ], 200);
    }

    /**
     * Eksekusi Penyerahan Barang (Potong Stok & Catat Log)
     */
    public function distribute_items_bulk($request) {
        $data = $request->get_json_params();
        // Expected: { booking_id, jamaah_id, items: [item_id, item_id] }

        if (empty($data['items']) || !is_array($data['items'])) {
            return new WP_REST_Response(['message' => 'Tidak ada barang dipilih'], 400);
        }

        $this->db->query('START TRANSACTION');
        try {
            foreach ($data['items'] as $item_id) {
                // 1. Cek Stok
                $stock = $this->db->get_var($this->db->prepare("SELECT stock_qty FROM {$this->table_name} WHERE id = %d", $item_id));
                if ($stock <= 0) {
                    throw new Exception("Stok barang ID $item_id habis!");
                }

                // 2. Kurangi Stok
                $this->db->query($this->db->prepare("UPDATE {$this->table_name} SET stock_qty = stock_qty - 1 WHERE id = %d", $item_id));

                // 3. Catat Distribusi
                $this->db->insert("{$this->db->prefix}umh_logistics_distribution", [
                    'booking_id' => $data['booking_id'],
                    'jamaah_id' => $data['jamaah_id'],
                    'item_id' => $item_id,
                    'qty' => 1,
                    'status' => 'taken',
                    'taken_date' => current_time('mysql')
                ]);

                // 4. Catat Transaksi Gudang (Audit Trail)
                $this->db->insert("{$this->db->prefix}umh_inventory_transactions", [
                    'item_id' => $item_id,
                    'type' => 'out',
                    'qty' => 1,
                    'balance_after' => $stock - 1,
                    'reference_no' => 'LOG-DIST-' . $data['jamaah_id'],
                    'notes' => 'Distribusi ke Jemaah',
                    'created_at' => current_time('mysql')
                ]);
            }

            $this->db->query('COMMIT');
            return new WP_REST_Response(['success' => true, 'message' => 'Barang berhasil diserahkan'], 200);

        } catch (Exception $e) {
            $this->db->query('ROLLBACK');
            return new WP_REST_Response(['message' => $e->getMessage()], 500);
        }
    }

    public function get_distribution_history($request) {
        $query = "SELECT d.*, i.item_name, j.full_name as jamaah_name, b.booking_code
                  FROM {$this->db->prefix}umh_logistics_distribution d
                  JOIN {$this->table_name} i ON d.item_id = i.id
                  JOIN {$this->db->prefix}umh_jamaah j ON d.jamaah_id = j.id
                  JOIN {$this->db->prefix}umh_bookings b ON d.booking_id = b.id
                  ORDER BY d.taken_date DESC LIMIT 50";
        
        $data = $this->db->get_results($query);
        return new WP_REST_Response(['success' => true, 'data' => $data], 200);
    }
}