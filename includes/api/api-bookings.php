<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';
require_once dirname(__FILE__) . '/api-accounting.php'; 

class UMH_API_Bookings extends UMH_CRUD_Controller {
    private $accounting;
    public function __construct() { 
        parent::__construct('umh_bookings'); 
        $this->accounting = new UMH_API_Accounting();
    }

    public function register_routes() {
        parent::register_routes();
        register_rest_route('umh/v1', '/bookings/(?P<id>\d+)/verify-payment', ['methods' => 'POST', 'callback' => [$this, 'verify_booking_payment'], 'permission_callback' => '__return_true']);
    }

    public function create_item($request) {
        $data = $request->get_json_params();
        // 1. Cek Seat
        $dep = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->db->prefix}umh_departures WHERE id = %d", $data['departure_id']));
        if (!$dep || $dep->available_seats < $data['total_pax']) return new WP_REST_Response(['message' => 'Seat Penuh/Tidak Cukup'], 400);

        // 2. Buat Booking
        $data['booking_code'] = 'BK-' . date('ymd') . rand(100,999);
        $request->set_body_params($data);
        $res = parent::create_item($request);

        // 3. Kurangi Inventory Seat
        if ($res->status === 201) {
            $this->db->query($this->db->prepare("UPDATE {$this->db->prefix}umh_departures SET available_seats = available_seats - %d WHERE id = %d", $data['total_pax'], $data['departure_id']));
        }
        return $res;
    }

    public function verify_booking_payment($request) {
        $id = $request->get_param('id');
        $data = $request->get_json_params(); 
        $booking = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
        
        $amt = $data['amount'];
        $new_paid = $booking->total_paid + $amt;
        $status = ($new_paid >= $booking->total_price) ? 'paid' : 'dp';

        // 1. Update Booking
        $this->db->update($this->table_name, ['total_paid' => $new_paid, 'payment_status' => $status, 'status' => 'confirmed'], ['id' => $id]);

        // 2. Auto Journal (Kas Bertambah, Pendapatan Bertambah)
        $this->accounting->create_auto_journal(
            current_time('Y-m-d'), $booking->booking_code, "Bayar Booking #{$booking->booking_code}", $amt, 'booking', $id,
            [
                ['coa_code' => '1-1002', 'debit' => $amt, 'credit' => 0], // Bank BCA
                ['coa_code' => '4-1001', 'debit' => 0, 'credit' => $amt]  // Pendapatan Umrah
            ]
        );

        // 3. Hitung Komisi Agen (Jika ada agen)
        if ($booking->agent_id && $status === 'paid') {
            $komisi = 500000 * $booking->total_pax; // Logic: 500rb per pax
            $this->db->insert($this->db->prefix . 'umh_agent_commissions', [
                'agent_id' => $booking->agent_id, 'booking_id' => $booking->id, 'amount' => $komisi, 'status' => 'pending'
            ]);
            // Jurnal Beban Komisi (Optional: Accrual Basis)
             $this->accounting->create_auto_journal(
                current_time('Y-m-d'), "COM-{$booking->booking_code}", "Komisi Agen Booking #{$booking->booking_code}", $komisi, 'commission', $id,
                [
                    ['coa_code' => '5-1002', 'debit' => $komisi, 'credit' => 0], // Beban Komisi
                    ['coa_code' => '2-1001', 'debit' => 0, 'credit' => $komisi]  // Hutang (ke Agen)
                ]
            );
        }

        return new WP_REST_Response(['success' => true], 200);
    }
}