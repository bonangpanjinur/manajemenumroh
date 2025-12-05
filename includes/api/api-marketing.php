<?php
/**
 * File: includes/api/api-marketing.php
 * Lokasi: includes/api/api-marketing.php
 * Deskripsi: API Endpoint untuk Manajemen Campaign Marketing (Iklan)
 */

require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Marketing extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_marketing');
    }

    public function register_routes() {
        parent::register_routes();

        // Endpoint: Laporan Performa Campaign
        register_rest_route('umh/v1', '/marketing/reports', [
            'methods' => 'GET',
            'callback' => [$this, 'get_campaign_performance'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Menghitung efektivitas iklan:
     * - Berapa leads yang masuk dari campaign ini?
     * - Berapa yang closing (jadi jemaah)?
     */
    public function get_campaign_performance($request) {
        $campaigns = $this->db->get_results("SELECT * FROM {$this->table_name} WHERE status = 'active'");
        
        $report = [];
        foreach ($campaigns as $camp) {
            // Hitung Leads Masuk
            $leads_count = $this->db->get_var($this->db->prepare(
                "SELECT COUNT(*) FROM {$this->db->prefix}umh_leads WHERE marketing_id = %d", 
                $camp->id
            ));

            // Hitung Konversi (Deal)
            $deals_count = $this->db->get_var($this->db->prepare(
                "SELECT COUNT(*) FROM {$this->db->prefix}umh_leads WHERE marketing_id = %d AND status = 'deal'", 
                $camp->id
            ));

            $report[] = [
                'id' => $camp->id,
                'title' => $camp->title,
                'platform' => $camp->platform,
                'budget' => (float)$camp->budget,
                'leads_generated' => (int)$leads_count,
                'deals_closed' => (int)$deals_count,
                'cpl' => ($leads_count > 0) ? $camp->budget / $leads_count : 0 // Cost Per Lead
            ];
        }

        return new WP_REST_Response(['success' => true, 'data' => $report], 200);
    }
}