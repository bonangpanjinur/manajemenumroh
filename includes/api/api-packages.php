<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Packages extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_packages');
    }

    public function register_routes() {
        parent::register_routes();
        
        // Endpoint khusus untuk mengambil detail lengkap paket (termasuk Itinerary & Keberangkatan)
        register_rest_route('umh/v1', '/packages/(?P<id>[a-zA-Z0-9-]+)/full', [
            'methods' => 'GET',
            'callback' => [$this, 'get_package_full_details'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Override Create: Simpan Paket + Itinerary sekaligus
     */
    public function create_item($request) {
        $data = $request->get_json_params();
        $itineraries = isset($data['itineraries']) ? $data['itineraries'] : [];
        
        // Bersihkan data agar tidak error saat insert ke tabel paket
        unset($data['itineraries']); 

        // 1. Simpan Header Paket
        $response = parent::create_item($request);
        
        if ($response->status !== 201) {
            return $response;
        }

        $package_data = $response->get_data()['data'];
        $package_id = $package_data->id;

        // 2. Simpan Itineraries (Looping)
        if (!empty($itineraries)) {
            $this->save_itineraries($package_id, $itineraries);
        }

        return $response;
    }

    /**
     * Override Update: Update Paket + Sync Itinerary
     */
    public function update_item($request) {
        $data = $request->get_json_params();
        $id = $request->get_param('id');
        
        // Ambil ID numerik jika inputnya UUID
        $package = $this->get_record_by_id_or_uuid($id);
        if (!$package) return new WP_REST_Response(['message' => 'Paket tidak ditemukan'], 404);

        $itineraries = isset($data['itineraries']) ? $data['itineraries'] : null;
        unset($data['itineraries']);

        // 1. Update Header Paket
        $response = parent::update_item($request);

        // 2. Update Itineraries (Hapus Lama -> Insert Baru)
        // Ini metode paling aman untuk sinkronisasi data relasi one-to-many
        if ($itineraries !== null) {
            $this->db->delete($this->db->prefix . 'umh_package_itineraries', ['package_id' => $package->id]);
            $this->save_itineraries($package->id, $itineraries);
        }

        return $response;
    }

    /**
     * Helper: Simpan array itinerary ke database
     */
    private function save_itineraries($package_id, $items) {
        $table = $this->db->prefix . 'umh_package_itineraries';
        foreach ($items as $day) {
            $this->db->insert($table, [
                'package_id' => $package_id,
                'day_number' => $day['day_number'],
                'title' => $day['title'],
                'description' => $day['description'],
                'location' => isset($day['location']) ? $day['location'] : '',
                'created_at' => current_time('mysql')
            ]);
        }
    }

    /**
     * Custom Endpoint: Ambil Data Paket LENGKAP untuk halaman Detail E-commerce
     */
    public function get_package_full_details($request) {
        $id = $request->get_param('id');
        $package = $this->get_record_by_id_or_uuid($id);

        if (!$package) {
            return new WP_REST_Response(['success' => false, 'message' => 'Not Found'], 404);
        }

        // Ambil Itinerary
        $itineraries = $this->db->get_results($this->db->prepare(
            "SELECT * FROM {$this->db->prefix}umh_package_itineraries WHERE package_id = %d ORDER BY day_number ASC",
            $package->id
        ));

        // Ambil Jadwal Keberangkatan Aktif
        $departures = $this->db->get_results($this->db->prepare(
            "SELECT * FROM {$this->db->prefix}umh_departures WHERE package_id = %d AND status = 'open' AND deleted_at IS NULL",
            $package->id
        ));

        $data = (array) $package;
        $data['itineraries'] = $itineraries;
        $data['departures'] = $departures;

        return new WP_REST_Response(['success' => true, 'data' => $data], 200);
    }

    private function get_record_by_id_or_uuid($id) {
        if (is_numeric($id)) {
            return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
        } else {
            return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE uuid = %s", $id));
        }
    }
}