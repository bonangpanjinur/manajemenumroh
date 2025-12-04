<?php
/**
 * API Handler untuk Transaksi Booking (Header + Passengers)
 * Mengelola: Pemesanan, Hitung Harga, dan Input Jemaah ke Manifest
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Bookings {
    private $tbl_bookings;
    private $tbl_pax;
    private $tbl_departures;
    private $tbl_packages;

    public function __construct() {
        global $wpdb;
        $this->tbl_bookings   = $wpdb->prefix . 'umh_bookings';
        $this->tbl_pax        = $wpdb->prefix . 'umh_booking_passengers';
        $this->tbl_departures = $wpdb->prefix . 'umh_departures';
        $this->tbl_packages   = $wpdb->prefix . 'umh_packages';
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/bookings', [
            'methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/bookings/(?P<id>\d+)', [
            'methods' => 'GET', 'callback' => [$this, 'get_item'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/bookings', [
            'methods' => 'POST', 'callback' => [$this, 'create_booking'], 'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    // --- CREATE BOOKING (TRANSACTION) ---
    public function create_booking($request) {
        global $wpdb;
        $p = $request->get_json_params();

        /* Payload Expected:
           {
             "departure_id": 5,
             "agent_id": 1, (Optional)
             "passengers": [
                { "jamaah_id": 101, "package_type": "Quad", "price": 25000000 },
                { "jamaah_id": 102, "package_type": "Quad", "price": 25000000 }
             ],
             "contact_name": "Budi",
             "contact_phone": "0812345678"
           }
        */

        // 1. Generate Booking Code (UMH-YYYYMM-XXXX)
        $date_code = date('Ym');
        $last_id = $wpdb->get_var("SELECT id FROM {$this->tbl_bookings} ORDER BY id DESC LIMIT 1");
        $next_num = str_pad(($last_id + 1), 4, '0', STR_PAD_LEFT);
        $booking_code = "UMH-{$date_code}-{$next_num}";

        // 2. Hitung Total
        $total_price = 0;
        $total_pax = count($p['passengers']);
        foreach($p['passengers'] as $pax) {
            $total_price += floatval($pax['price']);
        }

        // 3. Insert Header Booking
        $data_booking = [
            'booking_code' => $booking_code,
            'departure_id' => intval($p['departure_id']),
            'agent_id' => !empty($p['agent_id']) ? intval($p['agent_id']) : null,
            'branch_id' => !empty($p['branch_id']) ? intval($p['branch_id']) : 0,
            'total_pax' => $total_pax,
            'total_price' => $total_price,
            'total_paid' => 0,
            'status' => 'pending', // Menunggu pembayaran DP
            'payment_status' => 'unpaid',
            'contact_name' => sanitize_text_field($p['contact_name']),
            'contact_phone' => sanitize_text_field($p['contact_phone']),
            'created_at' => current_time('mysql')
        ];

        $wpdb->insert($this->tbl_bookings, $data_booking);
        $booking_id = $wpdb->insert_id;

        if (!$booking_id) return new WP_REST_Response(['success' => false, 'message' => 'DB Error'], 500);

        // 4. Insert Passengers (Manifest)
        foreach($p['passengers'] as $pax) {
            $wpdb->insert($this->tbl_pax, [
                'booking_id' => $booking_id,
                'jamaah_id' => intval($pax['jamaah_id']),
                'package_type' => $pax['package_type'],
                'price_pax' => floatval($pax['price']),
                'visa_status' => 'pending'
            ]);
            
            // TODO: Kurangi kuota seat di umh_departures (bisa ditambahkan nanti)
        }

        return new WP_REST_Response([
            'success' => true, 
            'message' => 'Booking berhasil dibuat', 
            'booking_code' => $booking_code,
            'id' => $booking_id
        ], 201);
    }

    public function get_items($request) {
        global $wpdb;
        // Ambil list booking + nama paket
        $sql = "SELECT b.*, d.departure_date, pkg.name as package_name 
                FROM {$this->tbl_bookings} b
                JOIN {$this->tbl_departures} d ON b.departure_id = d.id
                JOIN {$this->tbl_packages} pkg ON d.package_id = pkg.id
                ORDER BY b.created_at DESC";
        $items = $wpdb->get_results($sql);
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function get_item($request) {
        global $wpdb;
        $id = $request->get_param('id');
        
        // Header
        $booking = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->tbl_bookings} WHERE id = %d", $id));
        if (!$booking) return new WP_REST_Response(['success' => false, 'message' => 'Not found'], 404);

        // Detail Passengers + Nama Jamaah
        $pax_sql = "SELECT p.*, j.full_name, j.passport_number, j.nik 
                    FROM {$this->tbl_pax} p 
                    JOIN {$wpdb->prefix}umh_jamaah j ON p.jamaah_id = j.id 
                    WHERE p.booking_id = %d";
        $booking->passengers = $wpdb->get_results($wpdb->prepare($pax_sql, $id));

        return new WP_REST_Response(['success' => true, 'data' => $booking], 200);
    }
}