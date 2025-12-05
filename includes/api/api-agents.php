<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Agents extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_agents');
    }

    public function register_routes() {
        parent::register_routes();

        // Endpoint Kalkulasi Komisi Pending
        register_rest_route('umh/v1', '/agents/(?P<id>\d+)/commissions', [
            'methods' => 'GET',
            'callback' => [$this, 'get_agent_commissions'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function get_agent_commissions($request) {
        $agent_id = $request->get_param('id');
        $comm_table = $this->db->prefix . 'umh_agent_commissions';
        $booking_table = $this->db->prefix . 'umh_bookings';

        // Ambil komisi yang tercatat
        $commissions = $this->db->get_results($this->db->prepare("
            SELECT c.*, b.booking_code, b.total_price 
            FROM {$comm_table} c
            JOIN {$booking_table} b ON c.booking_id = b.id
            WHERE c.agent_id = %d
            ORDER BY c.created_at DESC
        ", $agent_id));

        // Hitung Summary
        $total_unpaid = 0;
        foreach($commissions as $c) {
            if($c->status === 'approved' || $c->status === 'pending') {
                $total_unpaid += floatval($c->amount);
            }
        }

        return new WP_REST_Response([
            'success' => true, 
            'data' => $commissions,
            'summary' => ['unpaid_total' => $total_unpaid]
        ], 200);
    }
}