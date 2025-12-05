<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Bookings extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_bookings');
    }

    public function register_routes() {
        parent::register_routes();
        
        // Endpoint Cek Status
        register_rest_route('umh/v1', '/bookings/status/(?P<code_or_uuid>[a-zA-Z0-9-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'get_booking_status'],
            'permission_callback' => '__return_true',
        ]);

        // Endpoint Pembayaran Manual (Verifikasi Transfer)
        register_rest_route('umh/v1', '/bookings/(?P<id>[a-zA-Z0-9-]+)/pay', [
            'methods' => 'POST',
            'callback' => [$this, 'record_payment'],
            'permission_callback' => '__return_true', // Nanti batasi ke Admin/Finance
        ]);
    }

    /**
     * Override Create: Booking + Auto Invoice
     */
    public function create_item($request) {
        $data = $request->get_json_params();

        // 1. Validasi & Hitung Harga (Sama seperti sebelumnya)
        $data['uuid'] = $this->generate_uuid();
        $data['booking_code'] = $this->generate_booking_code();
        $data['booking_date'] = current_time('mysql');
        $data['status'] = 'pending';
        $data['payment_status'] = 'unpaid';

        if (empty($data['departure_id'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'Departure ID wajib diisi'], 400);
        }

        $departure = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->db->prefix}umh_departures WHERE id = %d", $data['departure_id']));
        
        if (!$departure || $departure->available_seats < ($data['total_pax'] ?? 1)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Kuota penuh.'], 400);
        }

        $base_price = floatval($departure->price_quad); 
        $subtotal = $base_price * intval($data['total_pax']);
        $discount = 0; // Logika diskon bisa ditambah di sini
        
        $data['subtotal_price'] = $subtotal;
        $data['discount_amount'] = $discount;
        $data['total_price'] = $subtotal - $discount;
        $data['total_paid'] = 0;

        // 2. Simpan Booking
        $format = array_fill(0, count($data), '%s');
        $this->db->insert($this->table_name, $data, $format);
        $booking_id = $this->db->insert_id;

        // 3. Kurangi Kuota
        $this->db->query($this->db->prepare(
            "UPDATE {$this->db->prefix}umh_departures SET available_seats = available_seats - %d WHERE id = %d",
            $data['total_pax'], $data['departure_id']
        ));

        // 4. AUTO-GENERATE INVOICE (Tagihan Pertama)
        $this->generate_invoice($booking_id, $data['uuid'], $data['total_price']);

        $new_booking = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $booking_id));
        return new WP_REST_Response(['success' => true, 'data' => $new_booking], 201);
    }

    /**
     * Helper: Buat Invoice Otomatis
     */
    private function generate_invoice($booking_id, $booking_uuid, $amount) {
        $invoice_code = 'INV-' . date('Ymd') . '-' . strtoupper(substr($booking_uuid, 0, 4));
        
        $this->db->insert($this->db->prefix . 'umh_invoices', [
            'uuid' => $this->generate_uuid(),
            'invoice_number' => $invoice_code,
            'booking_id' => $booking_id,
            'amount' => $amount,
            'due_date' => date('Y-m-d', strtotime('+3 days')), // Jatuh tempo 3 hari
            'status' => 'unpaid',
            'description' => 'Tagihan Booking Baru',
            'created_at' => current_time('mysql')
        ]);
    }

    /**
     * Custom Endpoint: Catat Pembayaran (Manual Transfer)
     */
    public function record_payment($request) {
        $id = $request->get_param('id'); // Bisa ID atau UUID Booking
        $data = $request->get_json_params();
        
        // Cari Booking
        if (is_numeric($id)) {
            $booking = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
        } else {
            $booking = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE uuid = %s", $id));
        }

        if (!$booking) return new WP_REST_Response(['message' => 'Booking tidak ditemukan'], 404);

        $amount_paid = floatval($data['amount']);
        
        // 1. Simpan ke Tabel Payments
        $this->db->insert($this->db->prefix . 'umh_payments', [
            'uuid' => $this->generate_uuid(),
            'booking_id' => $booking->id,
            'amount' => $amount_paid,
            'payment_date' => current_time('mysql'),
            'payment_method' => $data['payment_method'] ?? 'transfer',
            'status' => 'verified', // Anggap admin yang input sudah verifikasi
            'verified_by' => 1, // Default Admin ID
            'created_at' => current_time('mysql')
        ]);

        // 2. Update Total Paid di Booking
        $new_total_paid = floatval($booking->total_paid) + $amount_paid;
        $new_status = 'partial';
        if ($new_total_paid >= floatval($booking->total_price)) {
            $new_status = 'paid';
        } elseif ($new_total_paid > 0) {
            $new_status = 'dp'; // Jika baru bayar sebagian kecil
        }

        $this->db->update($this->table_name, [
            'total_paid' => $new_total_paid,
            'payment_status' => $new_status,
            'status' => ($new_status === 'paid') ? 'confirmed' : $booking->status
        ], ['id' => $booking->id]);

        // 3. Update Status Invoice (Cari invoice unpaid terakhir)
        $invoice = $this->db->get_row($this->db->prepare(
            "SELECT * FROM {$this->db->prefix}umh_invoices WHERE booking_id = %d AND status != 'paid' ORDER BY created_at DESC LIMIT 1",
            $booking->id
        ));

        if ($invoice) {
            // Logika sederhana: jika bayar >= tagihan invoice, tandai paid
            if ($amount_paid >= floatval($invoice->amount)) {
                $this->db->update($this->db->prefix . 'umh_invoices', ['status' => 'paid'], ['id' => $invoice->id]);
            } else {
                $this->db->update($this->db->prefix . 'umh_invoices', ['status' => 'partial'], ['id' => $invoice->id]);
            }
        }

        // 4. Catat ke Jurnal Keuangan (Finance)
        $this->db->insert($this->db->prefix . 'umh_finance', [
            'transaction_date' => current_time('mysql'),
            'type' => 'income',
            'category' => 'Pembayaran Paket',
            'title' => 'Pembayaran Booking #' . $booking->booking_code,
            'amount' => $amount_paid,
            'description' => 'Pembayaran diterima via ' . ($data['payment_method'] ?? 'transfer'),
            'reference_id' => $booking->id,
            'reference_type' => 'booking',
            'created_at' => current_time('mysql')
        ]);

        return new WP_REST_Response(['success' => true, 'message' => 'Pembayaran berhasil dicatat'], 200);
    }

    // ... (Helper generate_booking_code & generate_uuid sama seperti sebelumnya) ...
    private function generate_booking_code() {
        $prefix = 'BK'; 
        $date = date('ym'); 
        $random = strtoupper(substr(md5(uniqid()), 0, 5));
        return $prefix . $date . $random;
    }
}