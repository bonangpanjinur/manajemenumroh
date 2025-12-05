<?php
/**
 * File: includes/api/api-rooming.php
 * Lokasi: includes/api/api-rooming.php
 * Deskripsi: API Endpoint untuk Manajemen Rooming List & Manifest Penerbangan
 */

require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Rooming extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_rooming_list');
    }

    public function register_routes() {
        // GET Data Rooming Board
        register_rest_route('umh/v1', '/departures/(?P<id>\d+)/rooming', [
            'methods' => 'GET',
            'callback' => [$this, 'get_rooming_board'],
            'permission_callback' => '__return_true',
        ]);

        // POST Buat Kamar & Masukkan Jemaah
        register_rest_route('umh/v1', '/departures/(?P<id>\d+)/create-room', [
            'methods' => 'POST',
            'callback' => [$this, 'create_room_with_pax'],
            'permission_callback' => '__return_true',
        ]);

        // DELETE Hapus Kamar
        register_rest_route('umh/v1', '/rooms/(?P<id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'delete_room'],
            'permission_callback' => '__return_true',
        ]);
        
        // GET Manifest
        register_rest_route('umh/v1', '/departures/(?P<id>\d+)/manifest', [
            'methods' => 'GET',
            'callback' => [$this, 'get_manifest'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function get_rooming_board($request) {
        $departure_id = $request->get_param('id');

        // Ambil Kamar
        $rooms = $this->db->get_results($this->db->prepare(
            "SELECT r.*, h.name as hotel_name 
             FROM {$this->db->prefix}umh_rooming_list r
             LEFT JOIN {$this->db->prefix}umh_master_hotels h ON r.hotel_id = h.id
             WHERE r.departure_id = %d ORDER BY r.room_number ASC",
            $departure_id
        ));

        // Ambil Penghuni
        foreach ($rooms as $room) {
            $room->pax = $this->db->get_results($this->db->prepare(
                "SELECT bp.id as pax_id, j.full_name, j.gender, j.passport_number 
                 FROM {$this->db->prefix}umh_booking_passengers bp
                 JOIN {$this->db->prefix}umh_jamaah j ON bp.jamaah_id = j.id
                 WHERE bp.assigned_room_id = %d",
                $room->id
            ));
        }

        // Ambil Unassigned
        $unassigned = $this->db->get_results($this->db->prepare(
            "SELECT bp.id as pax_id, j.full_name, j.gender, j.passport_number, bp.package_type
             FROM {$this->db->prefix}umh_booking_passengers bp
             JOIN {$this->db->prefix}umh_bookings b ON bp.booking_id = b.id
             JOIN {$this->db->prefix}umh_jamaah j ON bp.jamaah_id = j.id
             WHERE b.departure_id = %d AND (bp.assigned_room_id IS NULL OR bp.assigned_room_id = 0)
             AND b.status IN ('confirmed', 'paid', 'dp', 'pending')",
            $departure_id
        ));

        return new WP_REST_Response(['success' => true, 'rooms' => $rooms, 'unassigned' => $unassigned], 200);
    }

    public function create_room_with_pax($request) {
        $departure_id = $request->get_param('id');
        $data = $request->get_json_params();
        
        $this->db->insert($this->db->prefix . 'umh_rooming_list', [
            'departure_id' => $departure_id,
            'hotel_id' => $data['hotel_id'],
            'room_number' => $data['room_number'],
            'capacity' => $data['capacity'],
            'gender' => $data['gender'],
            'notes' => isset($data['notes']) ? $data['notes'] : ''
        ]);
        $room_id = $this->db->insert_id;

        if (!empty($data['pax_ids']) && is_array($data['pax_ids'])) {
            $ids = implode(',', array_map('intval', $data['pax_ids']));
            $this->db->query("UPDATE {$this->db->prefix}umh_booking_passengers SET assigned_room_id = $room_id WHERE id IN ($ids)");
        }

        return new WP_REST_Response(['success' => true], 201);
    }

    public function delete_room($request) {
        $room_id = $request->get_param('id');
        $this->db->query($this->db->prepare("UPDATE {$this->db->prefix}umh_booking_passengers SET assigned_room_id = NULL WHERE assigned_room_id = %d", $room_id));
        $this->db->delete($this->db->prefix . 'umh_rooming_list', ['id' => $room_id]);
        return new WP_REST_Response(['success' => true], 200);
    }

    public function get_manifest($request) {
        $departure_id = $request->get_param('id');
        $query = "SELECT j.full_name, j.gender, j.passport_number, p.name as package_name, a.name as airline_name, d.flight_number_depart
                  FROM {$this->db->prefix}umh_booking_passengers bp
                  JOIN {$this->db->prefix}umh_bookings b ON bp.booking_id = b.id
                  JOIN {$this->db->prefix}umh_jamaah j ON bp.jamaah_id = j.id
                  JOIN {$this->db->prefix}umh_departures d ON b.departure_id = d.id
                  LEFT JOIN {$this->db->prefix}umh_packages p ON d.package_id = p.id
                  LEFT JOIN {$this->db->prefix}umh_master_airlines a ON d.airline_id = a.id
                  WHERE b.departure_id = %d";
        $data = $this->db->get_results($this->db->prepare($query, $departure_id));
        return new WP_REST_Response(['success' => true, 'data' => $data], 200);
    }
}