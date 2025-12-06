<?php
/**
 * File: includes/api/api-rooming.php
 * Deskripsi: API Endpoint untuk Rooming Management (Penempatan Kamar Jemaah)
 */

require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Rooming extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_rooming_list'); // Master daftar kamar per departure
    }

    public function register_routes() {
        parent::register_routes();
        
        // Endpoint: Ambil Daftar Jemaah untuk Rooming (per Departure ID)
        register_rest_route('umh/v1', '/rooming/departure/(?P<dep_id>\d+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_rooming_pax_list'],
            'permission_callback' => '__return_true',
        ]);
        
        // Endpoint: Assign Jemaah ke Kamar
        register_rest_route('umh/v1', '/rooming/assign', [
            'methods' => 'POST',
            'callback' => [$this, 'assign_jamaah_to_room'],
            'permission_callback' => '__return_true',
        ]);
    }
    
    /**
     * Mengambil Jemaah yang sudah CONFIRMED dalam satu Keberangkatan
     */
    public function get_rooming_pax_list($request) {
        $dep_id = $request->get_param('dep_id');
        
        $pax_list = $this->db->get_results($this->db->prepare(
            "SELECT 
                bp.id as pax_id, bp.package_type, bp.assigned_room_id,
                j.id as jamaah_id, j.full_name, j.gender, j.phone,
                b.booking_code,
                rl.room_number, rl.capacity
             FROM {$this->db->prefix}umh_booking_passengers bp
             JOIN {$this->db->prefix}umh_jamaah j ON bp.jamaah_id = j.id
             JOIN {$this->db->prefix}umh_bookings b ON bp.booking_id = b.id
             LEFT JOIN {$this->db->prefix}umh_rooming_list rl ON bp.assigned_room_id = rl.id
             WHERE b.departure_id = %d AND b.status = 'confirmed'", 
            $dep_id
        ));

        // Ambil daftar kamar yang sudah dibuat untuk departure ini
        $rooms = $this->db->get_results($this->db->prepare(
            "SELECT * FROM {$this->db->prefix}umh_rooming_list WHERE departure_id = %d", 
            $dep_id
        ));
        
        // Kelompokkan jemaah yang belum dapat kamar
        $unassigned_pax = array_filter($pax_list, function($p) {
            return empty($p->assigned_room_id);
        });
        
        // Kelompokkan jemaah yang sudah dapat kamar ke dalam struktur kamar
        $room_assignments = [];
        foreach ($rooms as $room) {
            $room->pax_in_room = array_filter($pax_list, function($p) use ($room) {
                return $p->assigned_room_id == $room->id;
            });
            $room->current_occupancy = count($room->pax_in_room);
            $room_assignments[] = $room;
        }


        return new WP_REST_Response([
            'success' => true, 
            'data' => [
                'unassigned_pax' => $unassigned_pax,
                'rooms' => $room_assignments,
                'all_pax_list' => $pax_list // Jika perlu list lengkap
            ]
        ], 200);
    }
    
    /**
     * Assign / Pindahkan Jemaah ke Kamar tertentu
     * Menerima: { pax_id: int, room_id: int | null }
     */
    public function assign_jamaah_to_room($request) {
        $data = $request->get_json_params();
        $pax_id = $data['pax_id'];
        $room_id = $data['room_id'] ? intval($data['room_id']) : null; // null jika unassign
        
        // 1. Validasi Room (Jika ada room_id)
        if ($room_id) {
            $room = $this->db->get_row($this->db->prepare("SELECT capacity FROM {$this->db->prefix}umh_rooming_list WHERE id = %d", $room_id));
            if (!$room) return new WP_REST_Response(['message' => 'Kamar tidak valid.'], 404);
            
            // Cek Occupancy (walaupun frontend sudah cegah, backend tetap harus cek)
            $current_occupancy = $this->db->get_var($this->db->prepare("SELECT COUNT(*) FROM {$this->db->prefix}umh_booking_passengers WHERE assigned_room_id = %d", $room_id));
            if ($current_occupancy >= $room->capacity) {
                return new WP_REST_Response(['message' => 'Kamar sudah penuh (Max ' . $room->capacity . ' orang).'], 400);
            }
        }

        // 2. Update status penempatan di tabel booking_passengers
        $updated = $this->db->update(
            $this->db->prefix . 'umh_booking_passengers',
            ['assigned_room_id' => $room_id],
            ['id' => $pax_id]
        );

        if ($updated === false) {
             return new WP_REST_Response(['message' => 'Gagal mengupdate penempatan kamar.'], 500);
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Penempatan kamar berhasil.'], 200);
    }
}