<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Packages extends UMH_CRUD_Controller {
    
    public function __construct() {
        parent::__construct('umh_packages');
    }

    public function register_routes() {
        // Route standar CRUD (GET, POST, PUT, DELETE) akan dihandle parent, tapi method-nya kita override di bawah
        parent::register_routes();
        
        // Custom Route: Ambil detail lengkap untuk Admin (Edit Mode)
        register_rest_route('umh/v1', '/packages/(?P<id>\d+)/full', [
            'methods' => 'GET',
            'callback' => [$this, 'get_full_package_for_admin'],
            'permission_callback' => [$this, 'check_permission']
        ]);

        // Custom Route: Endpoint Khusus Frontend (Storefront)
        register_rest_route('umh/v1', '/storefront/package/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_storefront_detail'],
            'permission_callback' => '__return_true' // Public access
        ]);
    }

    /**
     * OVERRIDE CREATE: Simpan Paket + Hotel + Itinerary
     */
    public function create_item($request) {
        $data = $request->get_json_params();
        
        $this->db->query('START TRANSACTION');

        try {
            // 1. Simpan Data Utama Paket
            // Generate UUID jika belum ada
            if (empty($data['uuid'])) $data['uuid'] = wp_generate_uuid4();
            
            // Pisahkan data nested agar tidak error saat insert ke tabel packages
            $hotels = isset($data['hotels']) ? $data['hotels'] : [];
            $itineraries = isset($data['itineraries']) ? $data['itineraries'] : [];
            
            unset($data['hotels']);
            unset($data['itineraries']);

            $request->set_body_params($data);
            $res = parent::create_item($request);
            
            if ($res->status !== 201) {
                throw new Exception('Gagal menyimpan data paket utama.');
            }
            
            $package_id = $res->get_data()['data']->id;

            // 2. Simpan Relasi Hotel
            $this->save_related_hotels($package_id, $hotels);

            // 3. Simpan Relasi Itinerary
            $this->save_related_itineraries($package_id, $itineraries);

            $this->db->query('COMMIT');
            return $res;

        } catch (Exception $e) {
            $this->db->query('ROLLBACK');
            return new WP_REST_Response(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * OVERRIDE UPDATE: Update Paket + Refresh Hotel & Itinerary
     */
    public function update_item($request) {
        $data = $request->get_json_params();
        $id = $request->get_param('id'); // Bisa ID atau UUID dari URL

        // Jika ID adalah UUID, cari ID aslinya
        if (!is_numeric($id)) {
            $id = $this->db->get_var($this->db->prepare("SELECT id FROM {$this->table_name} WHERE uuid = %s", $id));
            if (!$id) return new WP_REST_Response(['message' => 'Paket tidak ditemukan'], 404);
        }

        $this->db->query('START TRANSACTION');

        try {
            $hotels = isset($data['hotels']) ? $data['hotels'] : [];
            $itineraries = isset($data['itineraries']) ? $data['itineraries'] : [];

            unset($data['hotels']);
            unset($data['itineraries']);

            $request->set_body_params($data);
            $res = parent::update_item($request);

            if ($res->status !== 200) {
                throw new Exception('Gagal mengupdate data paket utama.');
            }

            // Replace Relasi (Hapus lama, insert baru - strategi paling aman untuk update nested)
            $this->db->delete($this->db->prefix . 'umh_package_hotels', ['package_id' => $id]);
            $this->save_related_hotels($id, $hotels);

            $this->db->delete($this->db->prefix . 'umh_package_itineraries', ['package_id' => $id]);
            $this->save_related_itineraries($id, $itineraries);

            $this->db->query('COMMIT');
            return $res;

        } catch (Exception $e) {
            $this->db->query('ROLLBACK');
            return new WP_REST_Response(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Helper: Simpan Hotel
     */
    private function save_related_hotels($package_id, $hotels) {
        $table = $this->db->prefix . 'umh_package_hotels';
        foreach ($hotels as $h) {
            if (empty($h['hotel_id'])) continue;
            $this->db->insert($table, [
                'package_id' => $package_id,
                'hotel_id' => $h['hotel_id'],
                'city_name' => $h['city_name'] ?? 'Makkah',
                'nights' => $h['nights'] ?? 1,
                'created_at' => current_time('mysql')
            ]);
        }
    }

    /**
     * Helper: Simpan Itinerary
     */
    private function save_related_itineraries($package_id, $items) {
        $table = $this->db->prefix . 'umh_package_itineraries';
        foreach ($items as $idx => $item) {
            if (empty($item['title'])) continue;
            $this->db->insert($table, [
                'package_id' => $package_id,
                'day_number' => $item['day_number'] ?? ($idx + 1),
                'title' => $item['title'],
                'description' => $item['description'] ?? '',
                'location' => $item['location'] ?? '',
                'created_at' => current_time('mysql')
            ]);
        }
    }

    /**
     * Custom GET untuk Admin (agar Form Edit terisi lengkap)
     */
    public function get_full_package_for_admin($request) {
        $id = $request->get_param('id');
        
        // Cek ID atau UUID
        $query_col = is_numeric($id) ? 'id' : 'uuid';
        $package = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE $query_col = %s", $id));
        
        if (!$package) return new WP_REST_Response(['message' => 'Not Found'], 404);

        // Ambil Hotels
        $package->hotels = $this->db->get_results($this->db->prepare(
            "SELECT * FROM {$this->db->prefix}umh_package_hotels WHERE package_id = %d", 
            $package->id
        ));

        // Ambil Itineraries
        $package->itineraries = $this->db->get_results($this->db->prepare(
            "SELECT * FROM {$this->db->prefix}umh_package_itineraries WHERE package_id = %d ORDER BY day_number ASC", 
            $package->id
        ));

        return new WP_REST_Response(['success' => true, 'data' => $package], 200);
    }

    /**
     * Custom GET untuk Frontend Storefront (Simulasi Harga & Jadwal)
     */
    public function get_storefront_detail($request) {
        $id = $request->get_param('id');
        
        // 1. Ambil Data Paket Utama
        $package = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d AND status = 'active'", $id));
        
        if (!$package) {
            return new WP_REST_Response(['message' => 'Paket tidak ditemukan atau tidak aktif'], 404);
        }

        // 2. Ambil Fasilitas Hotel (JOIN dengan Master Hotel untuk nama & rating)
        $hotels = $this->db->get_results($this->db->prepare(
            "SELECT ph.*, mh.name as hotel_name, mh.rating 
             FROM {$this->db->prefix}umh_package_hotels ph
             LEFT JOIN {$this->db->prefix}umh_master_hotels mh ON ph.hotel_id = mh.id
             WHERE ph.package_id = %d", 
            $id
        ));

        // 3. Ambil Itinerary
        $itineraries = $this->db->get_results($this->db->prepare(
            "SELECT * FROM {$this->db->prefix}umh_package_itineraries WHERE package_id = %d ORDER BY day_number ASC", 
            $id
        ));

        // 4. AMBIL JADWAL KEBERANGKATAN (Available Only)
        // Logika: Hanya ambil yang tanggalnya belum lewat & status open
        // Harga di sini adalah harga final per tanggal
        $departures = $this->db->get_results($this->db->prepare(
            "SELECT id, departure_date, return_date, available_seats, quota,
                    price_quad, price_triple, price_double, flight_number_depart
             FROM {$this->db->prefix}umh_departures 
             WHERE package_id = %d 
               AND status = 'open' 
               AND departure_date >= CURDATE() 
             ORDER BY departure_date ASC", 
            $id
        ));

        // 5. Gabungkan Data
        $data = [
            'info' => $package,
            'hotels' => $hotels,
            'itinerary' => $itineraries,
            'available_departures' => $departures
        ];

        return new WP_REST_Response(['success' => true, 'data' => $data], 200);
    }
}