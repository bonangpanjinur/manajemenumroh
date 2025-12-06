<?php

class UMH_API_Bookings {

    public function register_routes() {
        register_rest_route('umh/v1', '/bookings', [
            ['methods' => 'GET', 'callback' => [$this, 'get_bookings'], 'permission_callback' => [$this, 'check_auth']],
            ['methods' => 'POST', 'callback' => [$this, 'create_booking'], 'permission_callback' => [$this, 'check_auth']],
        ]);
        
        register_rest_route('umh/v1', '/bookings/(?P<id>\d+)', [
            ['methods' => 'GET', 'callback' => [$this, 'get_booking_detail'], 'permission_callback' => [$this, 'check_read_permission']],
            ['methods' => 'POST', 'callback' => [$this, 'cancel_booking'], 'args' => ['action' => 'cancel'], 'permission_callback' => [$this, 'check_read_permission']],
        ]);
    }

    public function check_auth() { return is_user_logged_in(); }

    public function check_read_permission($request) {
        if (current_user_can('manage_options')) return true;
        global $wpdb;
        $id = $request['id'];
        $user_id = get_current_user_id();
        
        // Cek jika Agen
        $agent_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_agents WHERE user_id = %d", $user_id));
        if ($agent_id) {
            $is_mine = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_bookings WHERE id = %d AND agent_id = %d", $id, $agent_id));
            if ($is_mine) return true;
        }
        
        // Cek jika Jamaah (via Passengers)
        $jamaah_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_jamaah WHERE user_id = %d", $user_id));
        if ($jamaah_id) {
             $is_passenger = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_booking_passengers WHERE booking_id = %d AND jamaah_id = %d", $id, $jamaah_id));
             if ($is_passenger) return true;
        }

        return false;
    }

    // --- READ ---
    public function get_bookings($request) {
        global $wpdb;
        $user_id = get_current_user_id();
        $is_admin = current_user_can('manage_options');

        $sql = "SELECT b.*, d.departure_date, p.name as package_name, j.full_name as contact_person_name
                FROM {$wpdb->prefix}umh_bookings b
                JOIN {$wpdb->prefix}umh_departures d ON b.departure_id = d.id
                JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
                LEFT JOIN {$wpdb->prefix}umh_jamaah j ON b.contact_name = j.full_name 
                WHERE b.deleted_at IS NULL";

        if (!$is_admin) {
            $agent_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_agents WHERE user_id = %d", $user_id));
            if ($agent_id) {
                // Agent View
                $sql .= $wpdb->prepare(" AND b.agent_id = %d", $agent_id);
            } else {
                 // Jamaah View
                 $jamaah_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_jamaah WHERE user_id = %d", $user_id));
                 if ($jamaah_id) {
                     $sql .= $wpdb->prepare(" AND b.id IN (SELECT booking_id FROM {$wpdb->prefix}umh_booking_passengers WHERE jamaah_id = %d)", $jamaah_id);
                 } else {
                     return rest_ensure_response([]);
                 }
            }
        }

        $sql .= " ORDER BY b.created_at DESC";
        return rest_ensure_response($wpdb->get_results($sql));
    }

    public function get_booking_detail($request) {
        global $wpdb;
        $id = $request['id'];
        
        $booking = $wpdb->get_row($wpdb->prepare("
            SELECT b.*, d.departure_date, d.flight_number_depart, p.name as package_name 
            FROM {$wpdb->prefix}umh_bookings b
            JOIN {$wpdb->prefix}umh_departures d ON b.departure_id = d.id
            JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
            WHERE b.id = %d", $id));
            
        if (!$booking) return new WP_Error('not_found', 'Booking tidak ditemukan', ['status' => 404]);

        $booking->passengers = $wpdb->get_results($wpdb->prepare("
            SELECT bp.*, j.full_name, j.passport_number, j.gender
            FROM {$wpdb->prefix}umh_booking_passengers bp
            JOIN {$wpdb->prefix}umh_jamaah j ON bp.jamaah_id = j.id
            WHERE bp.booking_id = %d", $id));
            
        return rest_ensure_response($booking);
    }

    // --- CREATE ---
    public function create_booking($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $user_id = get_current_user_id();
        
        // Identifikasi pembuat booking
        $agent_id = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_agents WHERE user_id = %d", $user_id));

        // Cek Kuota Keberangkatan
        $departure = $wpdb->get_row($wpdb->prepare("SELECT available_seats FROM {$wpdb->prefix}umh_departures WHERE id = %d", $params['departure_id']));
        $req_pax = intval($params['total_pax']);
        
        if (!$departure || $departure->available_seats < $req_pax) {
            return new WP_Error('full_quota', 'Kuota keberangkatan tidak mencukupi', ['status' => 400]);
        }

        $code = 'UM-' . date('Ymd') . '-' . mt_rand(100, 999);

        // 1. Insert Header Booking
        $wpdb->insert("{$wpdb->prefix}umh_bookings", [
            'uuid' => wp_generate_uuid4(),
            'booking_code' => $code,
            'departure_id' => intval($params['departure_id']),
            'agent_id' => $agent_id ? $agent_id : 0, 
            'contact_name' => sanitize_text_field($params['contact_name']),
            'contact_phone' => sanitize_text_field($params['contact_phone']),
            'total_pax' => $req_pax,
            'total_price' => floatval($params['total_price']),
            'status' => 'draft',
            'created_at' => current_time('mysql')
        ]);
        
        $booking_id = $wpdb->insert_id;

        // 2. Insert Passengers
        if (!empty($params['passengers']) && is_array($params['passengers'])) {
            foreach ($params['passengers'] as $pax) {
                $wpdb->insert("{$wpdb->prefix}umh_booking_passengers", [
                    'booking_id' => $booking_id,
                    'jamaah_id' => intval($pax['jamaah_id']),
                    'package_type' => sanitize_text_field($pax['room_type']),
                    'price_pax' => floatval($pax['price'])
                ]);
            }
        }

        // 3. Update Kuota
        $wpdb->query($wpdb->prepare("UPDATE {$wpdb->prefix}umh_departures SET available_seats = available_seats - %d WHERE id = %d", $req_pax, $params['departure_id']));

        return rest_ensure_response(['success' => true, 'booking_code' => $code, 'id' => $booking_id]);
    }

    // --- CANCEL ---
    public function cancel_booking($request) {
        global $wpdb;
        $id = $request['id'];
        
        $booking = $wpdb->get_row($wpdb->prepare("SELECT status, departure_id FROM {$wpdb->prefix}umh_bookings WHERE id = %d", $id));
        
        if ($booking->status === 'cancelled') {
            return new WP_Error('already_cancelled', 'Booking sudah dibatalkan', ['status' => 400]);
        }

        // Hitung Pax untuk pengembalian kuota
        $pax_count = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}umh_booking_passengers WHERE booking_id = %d", $id));

        $wpdb->update("{$wpdb->prefix}umh_bookings", 
            ['status' => 'cancelled', 'updated_at' => current_time('mysql')], 
            ['id' => $id]
        );

        // Kembalikan Kuota
        if ($booking->departure_id && $pax_count > 0) {
            $wpdb->query($wpdb->prepare("UPDATE {$wpdb->prefix}umh_departures SET available_seats = available_seats + %d WHERE id = %d", $pax_count, $booking->departure_id));
        }

        return rest_ensure_response(['success' => true, 'message' => 'Booking berhasil dibatalkan']);
    }
}