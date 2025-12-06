<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Packages extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_packages');
    }

    public function register_routes() {
        parent::register_routes();
        
        // Endpoint Khusus: Get Full Details (termasuk relasi Harga, Hotel, Itinerary)
        register_rest_route('umh/v1', '/packages/(?P<id>[a-zA-Z0-9-]+)/full', [
            'methods' => 'GET',
            'callback' => [$this, 'get_package_full_details'],
            'permission_callback' => '__return_true', // Sesuaikan permission di production
        ]);
    }

    /**
     * Create Package dengan Relasi
     */
    public function create_item($request) {
        $data = $request->get_json_params();

        // 1. Validasi Dasar
        if (empty($data['name'])) {
            return new WP_Error('missing_param', 'Nama paket wajib diisi', ['status' => 400]);
        }
        
        // 2. Pisahkan data relasi (Harga, Hotel, Itinerary) dari data utama
        $prices = isset($data['prices']) && is_array($data['prices']) ? $data['prices'] : [];
        $itineraries = isset($data['itineraries']) && is_array($data['itineraries']) ? $data['itineraries'] : [];
        $hotels = isset($data['hotels']) && is_array($data['hotels']) ? $data['hotels'] : [];

        // Hapus dari data utama agar tidak error saat insert ke tabel umh_packages
        unset($data['prices'], $data['itineraries'], $data['hotels']); 

        // 3. Insert Parent (Tabel Packages)
        $response = parent::create_item($request);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        // 4. Insert Relasi jika Parent berhasil dibuat
        if ($response->status === 201) {
            $response_data = $response->get_data();
            $pkg_id = $response_data['data']->id; // ID paket baru
            
            $this->save_relations($pkg_id, $prices, $hotels, $itineraries);

            // Return full data agar frontend langsung dapat state terbaru
            return $this->get_package_full_details(new WP_REST_Request('GET', "/umh/v1/packages/$pkg_id/full"));
        }
        return $response;
    }

    /**
     * Update Package dengan Relasi
     */
    public function update_item($request) {
        $id = $request->get_param('id');
        $data = $request->get_json_params();
        
        // Cek Keberadaan Data
        $pkg = $this->get_record_by_id_or_uuid($id);
        if (!$pkg) return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);

        // Pisahkan Data Relasi
        $prices = isset($data['prices']) ? $data['prices'] : null;
        $itineraries = isset($data['itineraries']) ? $data['itineraries'] : null;
        $hotels = isset($data['hotels']) ? $data['hotels'] : null;

        unset($data['prices'], $data['itineraries'], $data['hotels']);

        // Update Parent
        $res = parent::update_item($request);
        if (is_wp_error($res)) return $res;

        // Update Relasi (Strategy: Delete All & Re-Insert)
        if ($prices !== null) {
            $this->db->delete($this->db->prefix.'umh_package_prices', ['package_id' => $pkg->id]);
            foreach($prices as $p) {
                if (!empty($p['room_type']) && !empty($p['price'])) {
                    $this->db->insert($this->db->prefix.'umh_package_prices', [
                        'package_id' => $pkg->id, 
                        'room_type' => sanitize_text_field($p['room_type']), 
                        'capacity' => intval($p['capacity']), 
                        'price' => floatval($p['price']),
                        'currency' => !empty($p['currency']) ? sanitize_text_field($p['currency']) : 'IDR'
                    ]);
                }
            }
        }
        
        if ($itineraries !== null) {
            $this->save_itineraries($pkg->id, $itineraries);
        }

        if ($hotels !== null) {
            $this->save_hotels($pkg->id, $hotels);
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Paket berhasil diperbarui'], 200);
    }

    /**
     * Delete Package & Cleanup Relasi
     */
    public function delete_item($request) {
        $id = $request->get_param('id');
        $pkg = $this->get_record_by_id_or_uuid($id);

        if (!$pkg) return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);

        // 1. Hapus Data Relasi (Manual Cascade)
        $this->db->delete($this->db->prefix . 'umh_package_prices', ['package_id' => $pkg->id]);
        $this->db->delete($this->db->prefix . 'umh_package_hotels', ['package_id' => $pkg->id]);
        $this->db->delete($this->db->prefix . 'umh_package_itineraries', ['package_id' => $pkg->id]);

        // 2. Hapus Parent
        return parent::delete_item($request);
    }

    // --- Helper Functions ---

    private function save_relations($pkg_id, $prices, $hotels, $itineraries) {
        foreach($prices as $p) {
            if (!empty($p['room_type']) && !empty($p['price'])) {
                $this->db->insert($this->db->prefix.'umh_package_prices', [
                    'package_id' => $pkg_id, 
                    'room_type' => sanitize_text_field($p['room_type']), 
                    'capacity' => intval($p['capacity']), 
                    'price' => floatval($p['price']),
                    'currency' => 'IDR'
                ]);
            }
        }
        $this->save_itineraries($pkg_id, $itineraries);
        $this->save_hotels($pkg_id, $hotels);
    }

    private function save_itineraries($pkg_id, $items) {
        $this->db->delete($this->db->prefix.'umh_package_itineraries', ['package_id' => $pkg_id]);
        foreach ($items as $d) {
            $this->db->insert($this->db->prefix.'umh_package_itineraries', [
                'package_id' => $pkg_id, 
                'day_number' => intval($d['day_number']), 
                'title' => sanitize_text_field($d['title']), 
                'description' => sanitize_textarea_field($d['description'])
            ]);
        }
    }
    
    private function save_hotels($pkg_id, $items) {
        $this->db->delete($this->db->prefix.'umh_package_hotels', ['package_id' => $pkg_id]);
        foreach ($items as $h) {
            if(!empty($h['hotel_id'])) {
                $this->db->insert($this->db->prefix.'umh_package_hotels', [
                    'package_id' => $pkg_id, 
                    'hotel_id' => intval($h['hotel_id']), 
                    'city_name' => sanitize_text_field($h['city_name']), 
                    'nights' => intval($h['nights'])
                ]);
            }
        }
    }

    public function get_package_full_details($request) {
        $id = $request->get_param('id');
        $pkg = $this->get_record_by_id_or_uuid($id);
        if (!$pkg) return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);

        $data = (array) $pkg;

        // Ambil Harga Dinamis
        $data['prices'] = $this->db->get_results($this->db->prepare(
            "SELECT * FROM {$this->db->prefix}umh_package_prices WHERE package_id = %d ORDER BY price ASC", 
            $pkg->id
        ));

        // Ambil Hotel (Join dengan Master Hotel untuk dapat nama & rating)
        $data['hotels'] = $this->db->get_results($this->db->prepare(
            "SELECT ph.*, mh.name as hotel_name, mh.rating, mh.city 
             FROM {$this->db->prefix}umh_package_hotels ph 
             LEFT JOIN {$this->db->prefix}umh_master_hotels mh ON ph.hotel_id = mh.id 
             WHERE ph.package_id = %d", 
            $pkg->id
        ));

        // Ambil Itinerary
        $data['itineraries'] = $this->db->get_results($this->db->prepare(
            "SELECT * FROM {$this->db->prefix}umh_package_itineraries WHERE package_id = %d ORDER BY day_number ASC", 
            $pkg->id
        ));

        return new WP_REST_Response(['success' => true, 'data' => $data], 200);
    }
    
    private function get_record_by_id_or_uuid($id) {
        if (is_numeric($id)) return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
        return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE uuid = %s", $id));
    }
}