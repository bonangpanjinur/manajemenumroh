<?php
/**
 * API Controller: Private / Custom Umrah
 * Endpoint Base: /wp-json/umh/v1/private
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Private {

    public function register_routes() {
        // 1. Get Options (Untuk Dropdown Hotel, Maskapai, dll di Frontend)
        register_rest_route('umh/v1', '/private/options', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_form_options'),
            'permission_callback' => '__return_true', // Public agar tamu bisa lihat opsi
        ));

        // 2. Submit Request (Jamaah submit form custom)
        register_rest_route('umh/v1', '/private/request', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_request'),
            'permission_callback' => '__return_true', // Bisa guest atau login
        ));

        // 3. Get All Requests (Admin lihat inbox, User lihat history dia)
        register_rest_route('umh/v1', '/private/requests', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_requests'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // 4. Get Single Request Detail (Termasuk Quotation didalamnya)
        register_rest_route('umh/v1', '/private/request/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_request_detail'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // 5. Create Quotation (Admin kirim penawaran)
        register_rest_route('umh/v1', '/private/quotation', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_quotation'),
            'permission_callback' => array($this, 'admin_permissions_check'),
        ));

        // 6. Accept Quotation (User setuju dengan harga)
        register_rest_route('umh/v1', '/private/quotation/(?P<id>\d+)/accept', array(
            'methods' => 'POST',
            'callback' => array($this, 'accept_quotation'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    // --- CALLBACK FUNCTIONS ---

    /**
     * Mengambil data Master Hotel & Maskapai untuk Form Pilihan
     */
    public function get_form_options($request) {
        global $wpdb;
        
        // Ambil Hotel (Makkah & Madinah)
        $hotels = $wpdb->get_results("SELECT id, name, city, rating, distance_to_haram, images FROM {$wpdb->prefix}umh_master_hotels ORDER BY city, rating DESC");
        
        // Ambil Maskapai
        $airlines = $wpdb->get_results("SELECT id, name, code, logo_url FROM {$wpdb->prefix}umh_master_airlines WHERE status='active'");

        // Struktur response dikelompokkan
        $data = array(
            'hotels_makkah' => array_values(array_filter($hotels, function($h) { return $h->city == 'Makkah'; })),
            'hotels_madinah' => array_values(array_filter($hotels, function($h) { return $h->city == 'Madinah'; })),
            'airlines' => $airlines,
            'vehicle_types' => array('Bus', 'HiAce', 'GMC', 'Private Car'),
            'meal_types' => array('Fullboard', 'Catering', 'Breakfast Only', 'None')
        );

        return rest_ensure_response($data);
    }

    /**
     * Simpan Request Private Baru
     */
    public function create_request($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_private_requests';
        $params = $request->get_json_params();

        // Validasi Dasar
        if (empty($params['contact_name']) || empty($params['pax_count'])) {
            return new WP_Error('missing_params', 'Nama Kontak dan Jumlah Pax wajib diisi', array('status' => 400));
        }

        $user_id = get_current_user_id(); // 0 jika guest

        $data = array(
            'user_id' => $user_id ? $user_id : NULL,
            'contact_name' => sanitize_text_field($params['contact_name']),
            'contact_phone' => sanitize_text_field($params['contact_phone']),
            'pax_count' => intval($params['pax_count']),
            'travel_date_start' => $params['travel_date_start'],
            'duration_days' => intval($params['duration_days']),
            
            // Pilihan Spesifik (ID dari Master)
            'hotel_makkah_pref_id' => !empty($params['hotel_makkah_pref_id']) ? intval($params['hotel_makkah_pref_id']) : NULL,
            'hotel_madinah_pref_id' => !empty($params['hotel_madinah_pref_id']) ? intval($params['hotel_madinah_pref_id']) : NULL,
            'airline_pref_id' => !empty($params['airline_pref_id']) ? intval($params['airline_pref_id']) : NULL,
            
            'hotel_rating_pref' => isset($params['hotel_rating_pref']) ? $params['hotel_rating_pref'] : '4_star',
            'vehicle_type' => isset($params['vehicle_type']) ? $params['vehicle_type'] : 'Bus',
            'meal_type' => isset($params['meal_type']) ? $params['meal_type'] : 'Fullboard',
            
            'budget_per_pax' => !empty($params['budget_per_pax']) ? floatval($params['budget_per_pax']) : NULL,
            'additional_notes' => isset($params['additional_notes']) ? sanitize_textarea_field($params['additional_notes']) : '',
            'status' => 'new'
        );

        $wpdb->insert($table, $data);
        $new_id = $wpdb->insert_id;

        if ($new_id) {
            // TODO: Kirim Notifikasi WA ke Admin bahwa ada request baru
            return rest_ensure_response(array('success' => true, 'id' => $new_id, 'message' => 'Request berhasil dikirim. Kami akan segera menghubungi Anda.'));
        }

        return new WP_Error('db_error', 'Gagal menyimpan request', array('status' => 500));
    }

    /**
     * Lihat Daftar Request
     */
    public function get_requests($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_private_requests';
        
        $user_id = get_current_user_id();
        $is_admin = current_user_can('manage_options');

        $sql = "SELECT * FROM $table";
        
        // Jika User biasa, hanya lihat request miliknya
        if (!$is_admin) {
            $sql .= " WHERE user_id = $user_id";
        }

        $sql .= " ORDER BY created_at DESC";
        
        $results = $wpdb->get_results($sql);
        return rest_ensure_response($results);
    }

    /**
     * Detail Request + Quotations
     */
    public function get_request_detail($request) {
        global $wpdb;
        $req_id = $request['id'];
        $table_req = $wpdb->prefix . 'umh_private_requests';
        $table_quote = $wpdb->prefix . 'umh_private_quotations';
        
        // 1. Ambil Data Request
        $req_data = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_req WHERE id = %d", $req_id));

        if (!$req_data) {
            return new WP_Error('not_found', 'Request tidak ditemukan', array('status' => 404));
        }

        // Security Check
        $user_id = get_current_user_id();
        if ($req_data->user_id && $req_data->user_id != $user_id && !current_user_can('manage_options')) {
            return new WP_Error('forbidden', 'Akses ditolak', array('status' => 403));
        }

        // 2. Ambil Pilihan Hotel & Maskapai (Join manual utk nama)
        if ($req_data->hotel_makkah_pref_id) {
            $req_data->hotel_makkah_name = $wpdb->get_var($wpdb->prepare("SELECT name FROM {$wpdb->prefix}umh_master_hotels WHERE id = %d", $req_data->hotel_makkah_pref_id));
        }
        if ($req_data->airline_pref_id) {
            $req_data->airline_name = $wpdb->get_var($wpdb->prepare("SELECT name FROM {$wpdb->prefix}umh_master_airlines WHERE id = %d", $req_data->airline_pref_id));
        }

        // 3. Ambil List Penawaran (Quotations) untuk request ini
        $quotations = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_quote WHERE request_id = %d ORDER BY created_at DESC", $req_id));

        return rest_ensure_response(array(
            'request' => $req_data,
            'quotations' => $quotations
        ));
    }

    /**
     * Buat Penawaran (Admin Only)
     */
    public function create_quotation($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_private_quotations';
        $table_req = $wpdb->prefix . 'umh_private_requests';
        $params = $request->get_json_params();

        $request_id = $params['request_id'];

        // Update status request jadi 'quoted'
        $wpdb->update($table_req, array('status' => 'quoted'), array('id' => $request_id));

        $data = array(
            'request_id' => $request_id,
            'title' => sanitize_text_field($params['title']),
            'itinerary_details' => json_encode($params['itinerary_details']), // JSON Array
            'price_per_pax' => $params['price_per_pax'],
            'total_price' => $params['total_price'],
            'valid_until' => $params['valid_until'],
            'status' => 'sent',
            'created_by' => get_current_user_id()
        );

        $wpdb->insert($table, $data);
        
        return rest_ensure_response(array('success' => true, 'message' => 'Penawaran berhasil dikirim ke User'));
    }

    /**
     * User Menerima Penawaran
     */
    public function accept_quotation($request) {
        global $wpdb;
        $quote_id = $request['id'];
        $table_quote = $wpdb->prefix . 'umh_private_quotations';
        $table_req = $wpdb->prefix . 'umh_private_requests';

        // 1. Cek Quotation
        $quote = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_quote WHERE id = %d", $quote_id));
        if (!$quote) return new WP_Error('not_found', 'Penawaran tidak ditemukan', array('status' => 404));

        // 2. Cek Request Owner
        $req = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_req WHERE id = %d", $quote->request_id));
        if ($req->user_id != get_current_user_id() && !current_user_can('manage_options')) {
            return new WP_Error('forbidden', 'Bukan milik Anda', array('status' => 403));
        }

        // 3. Update Status
        $wpdb->update($table_quote, array('status' => 'accepted'), array('id' => $quote_id));
        $wpdb->update($table_req, array('status' => 'accepted'), array('id' => $quote->request_id));

        // Note: Disini logic lanjutannya bisa otomatis create Booking & Invoice DP
        // Untuk sekarang kita set status dulu.

        return rest_ensure_response(array('success' => true, 'message' => 'Penawaran diterima! Silakan lanjut ke pembayaran.'));
    }

    // --- Permissions ---
    public function permissions_check() {
        return is_user_logged_in();
    }
    public function admin_permissions_check() {
        return current_user_can('manage_options');
    }
}