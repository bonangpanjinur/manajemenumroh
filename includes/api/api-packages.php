<?php

class UMH_API_Packages {

    public function register_routes() {
        // GET Packages: PUBLIC (Katalog Frontend) - Tidak perlu login
        register_rest_route('umh/v1', '/packages', [
            ['methods' => 'GET', 'callback' => [$this, 'get_packages'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_package'], 'permission_callback' => [$this, 'check_admin_permission']],
        ]);

        register_rest_route('umh/v1', '/packages/(?P<id>\d+)', [
            ['methods' => 'GET', 'callback' => [$this, 'get_package_detail'], 'permission_callback' => '__return_true'],
            ['methods' => 'PUT', 'callback' => [$this, 'update_package'], 'permission_callback' => [$this, 'check_admin_permission']],
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_package'], 'permission_callback' => [$this, 'check_admin_permission']],
        ]);
    }

    public function check_admin_permission() {
        return current_user_can('manage_options');
    }

    // --- READ ---
    public function get_packages($request) {
        global $wpdb;
        $category_id = $request->get_param('category_id');
        $type = $request->get_param('type'); // filter type: umrah, private, haji, tour
        
        $sql = "SELECT p.*, c.name as category_name 
                FROM {$wpdb->prefix}umh_packages p 
                LEFT JOIN {$wpdb->prefix}umh_package_categories c ON p.category_id = c.id
                WHERE p.status = 'active' AND p.deleted_at IS NULL";
        
        if ($category_id) {
            $sql .= $wpdb->prepare(" AND p.category_id = %d", $category_id);
        }
        
        // Filter Type (jika 'all', skip filter ini agar tampil semua)
        if ($type && $type !== 'all') {
            $sql .= $wpdb->prepare(" AND p.type = %s", $type);
        }
        
        $sql .= " ORDER BY p.created_at DESC";
        
        $results = $wpdb->get_results($sql);
        return rest_ensure_response($results);
    }

    public function get_package_detail($request) {
        global $wpdb;
        $id = $request['id'];
        
        $package = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_packages WHERE id = %d AND deleted_at IS NULL", $id));
        
        if (!$package) {
            return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);
        }
        
        // Fetch Relasi untuk Frontend Detail View
        // 1. Hotel
        $package->hotels = $wpdb->get_results($wpdb->prepare(
            "SELECT ph.*, h.name as hotel_name, h.city as hotel_city, h.rating 
             FROM {$wpdb->prefix}umh_package_hotels ph 
             JOIN {$wpdb->prefix}umh_master_hotels h ON ph.hotel_id = h.id 
             WHERE ph.package_id = %d ORDER BY ph.created_at ASC", $id
        ));
        
        // 2. Harga (Varian Room)
        $package->prices = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}umh_package_prices WHERE package_id = %d ORDER BY price ASC", $id
        ));
        
        // 3. Itinerary
        $package->itinerary = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}umh_package_itineraries WHERE package_id = %d ORDER BY day_number ASC", $id
        ));
        
        return rest_ensure_response($package);
    }

    // --- CREATE ---
    public function create_package($request) {
        global $wpdb;
        $params = $request->get_json_params();

        // Validasi dasar
        if (empty($params['name'])) return new WP_Error('missing_name', 'Nama paket wajib diisi', ['status' => 400]);

        $wpdb->insert("{$wpdb->prefix}umh_packages", [
            'uuid' => wp_generate_uuid4(),
            'name' => sanitize_text_field($params['name']),
            'type' => sanitize_text_field($params['type'] ?? 'umrah'),
            'category_id' => intval($params['category_id'] ?? 0),
            'duration_days' => intval($params['duration_days'] ?? 9),
            'down_payment_amount' => floatval($params['down_payment_amount'] ?? 0),
            'description' => wp_kses_post($params['description'] ?? ''),
            'status' => 'active'
        ]);
        
        return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id, 'message' => 'Paket berhasil dibuat']);
    }

    // --- UPDATE ---
    public function update_package($request) {
        global $wpdb;
        $id = $request['id'];
        $params = $request->get_json_params();
        
        // Cek keberadaan paket
        $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_packages WHERE id = %d", $id));
        if (!$exists) return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);

        // Siapkan data update (hanya field yang dikirim)
        $data = [];
        $format = [];

        if (isset($params['name'])) { 
            $data['name'] = sanitize_text_field($params['name']); 
            $format[] = '%s'; 
        }
        if (isset($params['type'])) { 
            $data['type'] = sanitize_text_field($params['type']); 
            $format[] = '%s'; 
        }
        if (isset($params['category_id'])) { 
            $data['category_id'] = intval($params['category_id']); 
            $format[] = '%d'; 
        }
        if (isset($params['duration_days'])) { 
            $data['duration_days'] = intval($params['duration_days']); 
            $format[] = '%d'; 
        }
        if (isset($params['down_payment_amount'])) { 
            $data['down_payment_amount'] = floatval($params['down_payment_amount']); 
            $format[] = '%f'; 
        }
        if (isset($params['description'])) { 
            $data['description'] = wp_kses_post($params['description']); 
            $format[] = '%s'; 
        }
        if (isset($params['status'])) { 
            $data['status'] = sanitize_text_field($params['status']); 
            $format[] = '%s'; 
        }

        if (!empty($data)) {
            $wpdb->update("{$wpdb->prefix}umh_packages", $data, ['id' => $id], $format, ['%d']);
        }

        return rest_ensure_response(['success' => true, 'message' => 'Paket berhasil diperbarui']);
    }

    // --- DELETE (SOFT) ---
    public function delete_package($request) {
        global $wpdb;
        $id = $request['id'];
        
        // Cek keberadaan paket
        $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_packages WHERE id = %d", $id));
        if (!$exists) return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);

        // Soft delete: set deleted_at timestamp & status inactive
        $wpdb->update(
            "{$wpdb->prefix}umh_packages",
            ['deleted_at' => current_time('mysql'), 'status' => 'inactive'],
            ['id' => $id],
            ['%s', '%s'],
            ['%d']
        );
        
        return rest_ensure_response(['success' => true, 'message' => 'Paket berhasil dihapus (soft delete)']);
    }
}