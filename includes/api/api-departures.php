<?php

class UMH_API_Departures {

    public function register_routes() {
        register_rest_route('umh/v1', '/departures', [
            ['methods' => 'GET', 'callback' => [$this, 'get_departures'], 'permission_callback' => [$this, 'check_auth']],
            ['methods' => 'POST', 'callback' => [$this, 'create_departure'], 'permission_callback' => [$this, 'check_admin']],
        ]);

        register_rest_route('umh/v1', '/departures/(?P<id>\d+)', [
            ['methods' => 'GET', 'callback' => [$this, 'get_departure_detail'], 'permission_callback' => [$this, 'check_auth']],
            ['methods' => 'PUT', 'callback' => [$this, 'update_departure'], 'permission_callback' => [$this, 'check_admin']],
        ]);

        // Endpoint Khusus Manifest (Untuk Handling & Absensi)
        register_rest_route('umh/v1', '/departures/(?P<id>\d+)/manifest', [
            ['methods' => 'GET', 'callback' => [$this, 'get_manifest'], 'permission_callback' => [$this, 'check_auth']],
            ['methods' => 'PUT', 'callback' => [$this, 'update_manifest_data'], 'permission_callback' => [$this, 'check_admin']], // Update Visa/Paspor massal
        ]);
    }

    public function check_auth() { return is_user_logged_in(); }
    public function check_admin() { return current_user_can('manage_options'); }

    // --- MANIFEST HANDLING ---

    public function get_manifest($request) {
        global $wpdb;
        $id = $request['id'];

        // Ambil semua penumpang di keberangkatan ini
        $sql = "SELECT bp.*, 
                       j.full_name, j.gender, j.passport_number, j.passport_name, 
                       j.passport_expiry_date, j.birth_date,
                       b.booking_code, b.agent_id, a.name as agent_name
                FROM {$wpdb->prefix}umh_booking_passengers bp
                JOIN {$wpdb->prefix}umh_bookings b ON bp.booking_id = b.id
                JOIN {$wpdb->prefix}umh_jamaah j ON bp.jamaah_id = j.id
                LEFT JOIN {$wpdb->prefix}umh_agents a ON b.agent_id = a.id
                WHERE b.departure_id = %d AND b.status = 'confirmed'
                ORDER BY j.full_name ASC";

        $passengers = $wpdb->get_results($wpdb->prepare($sql, $id));
        return rest_ensure_response($passengers);
    }

    public function update_manifest_data($request) {
        global $wpdb;
        $params = $request->get_json_params(); // Array of pax updates
        
        if (empty($params['passengers'])) return new WP_Error('no_data', 'Data tidak ada', ['status' => 400]);

        foreach ($params['passengers'] as $pax) {
            // Update Data Visa (di tabel booking_passengers)
            $visa_data = [];
            if (isset($pax['visa_number'])) $visa_data['visa_number'] = sanitize_text_field($pax['visa_number']);
            if (isset($pax['visa_status'])) $visa_data['visa_status'] = sanitize_text_field($pax['visa_status']);
            
            if (!empty($visa_data)) {
                $wpdb->update("{$wpdb->prefix}umh_booking_passengers", $visa_data, ['id' => $pax['pax_id']]);
            }

            // Update Data Paspor (di tabel jamaah)
            $passport_data = [];
            if (isset($pax['passport_number'])) $passport_data['passport_number'] = sanitize_text_field($pax['passport_number']);
            if (isset($pax['passport_name'])) $passport_data['passport_name'] = sanitize_text_field($pax['passport_name']);
            if (isset($pax['passport_expiry_date'])) $passport_data['passport_expiry_date'] = $pax['passport_expiry_date'];

            if (!empty($passport_data)) {
                $wpdb->update("{$wpdb->prefix}umh_jamaah", $passport_data, ['id' => $pax['jamaah_id']]);
            }
        }

        return rest_ensure_response(['success' => true, 'message' => 'Data manifest berhasil disimpan']);
    }

    // --- STANDARD CRUD ---

    public function get_departures($request) {
        global $wpdb;
        $sql = "SELECT d.*, p.name as package_name, 
                (SELECT COUNT(*) FROM {$wpdb->prefix}umh_bookings b WHERE b.departure_id = d.id AND b.status='confirmed') as confirmed_pax
                FROM {$wpdb->prefix}umh_departures d
                JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
                WHERE d.deleted_at IS NULL ORDER BY d.departure_date ASC";
        return rest_ensure_response($wpdb->get_results($sql));
    }

    public function create_departure($request) {
        global $wpdb;
        $params = $request->get_json_params();
        
        $wpdb->insert("{$wpdb->prefix}umh_departures", [
            'uuid' => wp_generate_uuid4(),
            'package_id' => $params['package_id'],
            'departure_date' => $params['departure_date'],
            'return_date' => $params['return_date'],
            'quota' => $params['quota'],
            'available_seats' => $params['quota'],
            'flight_number_depart' => $params['flight_number_depart'],
            'status' => 'open'
        ]);
        
        return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id]);
    }

    public function get_departure_detail($request) {
        global $wpdb;
        $id = $request['id'];
        $dep = $wpdb->get_row($wpdb->prepare("SELECT d.*, p.name as package_name FROM {$wpdb->prefix}umh_departures d JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id WHERE d.id = %d", $id));
        return rest_ensure_response($dep);
    }

    public function update_departure($request) { return rest_ensure_response(['status'=>'ok']); }
}