<?php
/**
 * File: includes/api/api-marketing.php
 * Deskripsi: API Endpoint untuk Manajemen Campaign Marketing & Reporting
 * Pembaruan: Menambahkan CRUD untuk Master Campaign (umh_marketing)
 */

require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Marketing extends UMH_CRUD_Controller {

    public function __construct() {
        // Parent constructor akan mengurus CRUD dasar untuk tabel 'umh_marketing'
        parent::__construct('umh_marketing'); 
    }

    public function register_routes() {
        // 1. Mengaktifkan CRUD standar untuk Master Campaign (GET, POST, PUT, DELETE)
        parent::register_routes();

        // 2. Endpoint: Laporan Performa Leads Pipeline (Sudah ada, tapi kita biarkan)
        register_rest_route('umh/v1', '/marketing/pipeline-report', [
            'methods' => 'GET',
            'callback' => [$this, 'get_pipeline_report'],
            'permission_callback' => '__return_true', // Ganti dengan hak akses admin/marketing
        ]);

        // 3. Endpoint: Update Status Leads (Leads ada di api-leads.php, tapi sering dibutuhkan di Marketing)
        register_rest_route('umh/v1', '/leads/(?P<id>\d+)/status', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_leads_status'],
            'permission_callback' => '__return_true', // Ganti dengan hak akses staff
        ]);
        
        // 4. Endpoint: CRUD Leads (Jika belum ada di api-leads, kita daftarkan di sini)
        // Asumsi CRUD Leads sudah dihandle oleh file api-leads.php yang terpisah
    }

    /**
     * Menghitung total leads, leads per status, dan conversion rate
     */
    public function get_pipeline_report($request) {
        // Ambil semua leads
        $all_leads = $this->db->get_results("SELECT status, COUNT(*) as count FROM {$this->db->prefix}umh_leads GROUP BY status");
        
        $total_leads = 0;
        $status_map = [];

        foreach ($all_leads as $lead) {
            $total_leads += (int)$lead->count;
            $status_map[$lead->status] = (int)$lead->count;
        }

        $deals = $status_map['deal'] ?? 0;
        $conversion_rate = $total_leads > 0 ? ($deals / $total_leads) * 100 : 0;

        $report = [
            'total_leads' => $total_leads,
            'deals' => $deals,
            'conversion_rate' => round($conversion_rate, 2),
            'status_breakdown' => $status_map
        ];

        return new WP_REST_Response(['success' => true, 'data' => $report], 200);
    }
    
    /**
     * Update status Leads (Dipanggil dari Kanban Board)
     */
    public function update_leads_status($request) {
        $lead_id = $request->get_param('id');
        $data = $request->get_json_params();
        $new_status = isset($data['status']) ? sanitize_text_field($data['status']) : '';
        
        if (empty($new_status)) {
             return new WP_REST_Response(['message' => 'Status baru wajib diisi.'], 400);
        }

        $updated = $this->db->update(
            $this->db->prefix . 'umh_leads',
            ['status' => $new_status],
            ['id' => $lead_id]
        );

        if ($updated === false) {
             return new WP_REST_Response(['message' => 'Gagal mengupdate status leads. ID tidak ditemukan atau status sama.'], 500);
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Status Leads berhasil diupdate.'], 200);
    }
}