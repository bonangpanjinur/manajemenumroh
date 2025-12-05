<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Agents extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_agents');
    }

    // Override Create: Auto-Generate Kode Referral Unik
    public function create_item($request) {
        $data = $request->get_json_params();
        
        // Jika kode kosong, generate otomatis: AG + 4 digit random
        if (empty($data['code'])) {
            $data['code'] = 'AG-' . strtoupper(substr(md5(time()), 0, 5));
        }

        // Cek duplikasi kode
        $exists = $this->db->get_var($this->db->prepare("SELECT id FROM {$this->table_name} WHERE code = %s", $data['code']));
        if ($exists) {
            return new WP_REST_Response(['message' => 'Kode Agen sudah digunakan, silakan coba lagi.'], 400);
        }

        $request->set_body_params($data);
        return parent::create_item($request);
    }

    /**
     * (Opsional) Endpoint untuk melihat performa agen
     * Menghitung total jemaah yang dibawa oleh agen ini
     */
    public function get_agent_performance($request) {
        $agent_id = $request->get_param('id');
        
        // Hitung jemaah dari tabel bookings yang memiliki agent_id ini
        $total_pax = $this->db->get_var($this->db->prepare(
            "SELECT SUM(total_pax) FROM {$this->db->prefix}umh_bookings 
             WHERE agent_id = %d AND status IN ('confirmed', 'paid', 'completed')",
            $agent_id
        ));

        // Hitung komisi (Misal tabel umh_agent_commissions)
        $total_commission = $this->db->get_var($this->db->prepare(
            "SELECT SUM(amount) FROM {$this->db->prefix}umh_agent_commissions 
             WHERE agent_id = %d AND status = 'paid'",
            $agent_id
        ));

        return new WP_REST_Response([
            'success' => true,
            'total_jamaah' => (int)$total_pax,
            'total_commission' => (float)$total_commission
        ], 200);
    }
}