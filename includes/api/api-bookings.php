<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Bookings extends UMH_CRUD_Controller {
    private $ledger;
    private $wallet;

    public function __construct() { 
        parent::__construct('umh_bookings'); 
        // Inisialisasi Service (Pastikan class sudah diload oleh API Loader)
        if(class_exists('UMH_Ledger_Service')) $this->ledger = new UMH_Ledger_Service();
        if(class_exists('UMH_Wallet_Service')) $this->wallet = new UMH_Wallet_Service();
    }

    public function register_routes() {
        parent::register_routes();
        
        // Upload Bukti Bayar (Jemaah)
        register_rest_route('umh/v1', '/bookings/(?P<id>\d+)/upload-proof', [
            'methods' => 'POST', 'callback' => [$this, 'upload_proof'], 'permission_callback' => '__return_true'
        ]);

        // Verifikasi Pembayaran (Admin)
        register_rest_route('umh/v1', '/payments/(?P<proof_id>\d+)/verify', [
            'methods' => 'POST', 'callback' => [$this, 'verify_proof'], 'permission_callback' => function(){ return current_user_can('manage_options'); }
        ]);
        
        // Get Bukti Bayar (List)
        register_rest_route('umh/v1', '/bookings/(?P<id>\d+)/payment-proofs', [
            'methods' => 'GET', 'callback' => [$this, 'get_proofs'], 'permission_callback' => '__return_true'
        ]);
    }

    // Override Create: Transactional Booking
    public function create_item($request) {
        $data = $request->get_json_params();
        $this->db->query('START TRANSACTION');
        
        try {
            // 1. Generate Code
            $data['booking_code'] = 'BK-' . date('ymd') . rand(1000,9999);
            $data['status'] = 'pending';
            $data['payment_status'] = 'unpaid';
            
            // 2. Simpan Booking
            $request->set_body_params($data);
            $res = parent::create_item($request);
            
            if ($res->status !== 201) throw new Exception('Gagal menyimpan booking.');
            $booking_id = $res->get_data()['data']->id;

            // 3. Kurangi Seat (Strict Check)
            $update = $this->db->query($this->db->prepare(
                "UPDATE {$this->db->prefix}umh_departures SET available_seats = available_seats - %d WHERE id = %d AND available_seats >= %d",
                $data['total_pax'], $data['departure_id'], $data['total_pax']
            ));

            if (!$update) throw new Exception('Seat penuh atau tidak mencukupi.');

            $this->db->query('COMMIT');
            return $res;

        } catch (Exception $e) {
            $this->db->query('ROLLBACK');
            return new WP_REST_Response(['message' => $e->getMessage()], 400);
        }
    }

    public function upload_proof($request) {
        $id = $request->get_param('id');
        $params = $request->get_body_params();
        $files = $request->get_file_params();

        if (empty($files['file'])) return new WP_REST_Response(['message' => 'File wajib diupload'], 400);
        
        if (!function_exists('wp_handle_upload')) require_once(ABSPATH . 'wp-admin/includes/file.php');
        $uploaded = wp_handle_upload($files['file'], ['test_form' => false]);
        
        if (isset($uploaded['error'])) return new WP_REST_Response(['message' => $uploaded['error']], 500);

        $this->db->insert($this->db->prefix . 'umh_payment_proofs', [
            'booking_id' => $id,
            'user_id' => get_current_user_id(),
            'amount' => $params['amount'],
            'bank_destination' => $params['bank_destination'] ?? 'BCA',
            'file_url' => $uploaded['url'],
            'status' => 'pending',
            'created_at' => current_time('mysql')
        ]);

        // Update status booking jadi 'processing' agar admin tahu ada pembayaran masuk
        $this->db->update($this->table_name, ['status' => 'pending'], ['id' => $id]);

        return new WP_REST_Response(['success' => true, 'message' => 'Bukti terupload'], 201);
    }

    public function verify_proof($request) {
        $proof_id = $request->get_param('proof_id');
        $data = $request->get_json_params(); // action: 'approve' | 'reject'

        $proof = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->db->prefix}umh_payment_proofs WHERE id = %d", $proof_id));
        if (!$proof || $proof->status !== 'pending') return new WP_REST_Response(['message' => 'Invalid proof'], 400);

        $this->db->query('START TRANSACTION');
        try {
            if ($data['action'] === 'reject') {
                $this->db->update($this->db->prefix . 'umh_payment_proofs', 
                    ['status' => 'rejected', 'verified_by' => get_current_user_id(), 'verified_at' => current_time('mysql')], 
                    ['id' => $proof_id]
                );
                $this->db->query('COMMIT');
                return new WP_REST_Response(['success' => true, 'message' => 'Ditolak'], 200);
            }

            // Approve
            $this->db->update($this->db->prefix . 'umh_payment_proofs', 
                ['status' => 'verified', 'verified_by' => get_current_user_id(), 'verified_at' => current_time('mysql')], 
                ['id' => $proof_id]
            );

            // Update Booking Total Paid
            $booking = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $proof->booking_id));
            $new_paid = $booking->total_paid + $proof->amount;
            $new_status = ($new_paid >= $booking->total_price) ? 'paid' : 'dp';
            
            $this->db->update($this->table_name, 
                ['total_paid' => $new_paid, 'payment_status' => $new_status, 'status' => 'confirmed'], 
                ['id' => $booking->id]
            );

            // Auto Journal (Hanya jika class ledger ada)
            if ($this->ledger) {
                $this->ledger->post_payment_verification($proof->id, $booking->booking_code, $proof->amount);
            }

            $this->db->query('COMMIT');
            return new WP_REST_Response(['success' => true], 200);

        } catch (Exception $e) {
            $this->db->query('ROLLBACK');
            return new WP_REST_Response(['message' => $e->getMessage()], 500);
        }
    }

    public function get_proofs($request) {
        $id = $request->get_param('id');
        $data = $this->db->get_results($this->db->prepare("SELECT * FROM {$this->db->prefix}umh_payment_proofs WHERE booking_id = %d ORDER BY created_at DESC", $id));
        return new WP_REST_Response(['success' => true, 'data' => $data], 200);
    }
}