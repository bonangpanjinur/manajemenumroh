<?php
/**
 * File: includes/api/api-leads.php
 * Lokasi: includes/api/api-leads.php
 * Deskripsi: API Endpoint untuk CRM Leads (Manajemen Prospek & Pipeline)
 */

require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Leads extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_leads');
    }

    public function register_routes() {
        parent::register_routes();
        
        // Endpoint Custom: Update Status Pipeline (Drag & Drop Kanban)
        register_rest_route('umh/v1', '/leads/(?P<id>\d+)/status', [
            'methods' => 'PUT',
            'callback' => [$this, 'update_lead_status'],
            'permission_callback' => '__return_true',
        ]);
    }

    // Override Create: Set Default Status 'new' & Assign UUID
    public function create_item($request) {
        $data = $request->get_json_params();
        
        // Default status jika tidak ada
        if (empty($data['status'])) {
            $data['status'] = 'new'; 
        }
        
        // Auto-assign branch_id (Mendukung Multi-Cabang V9.0)
        // Idealnya diambil dari user yang login, di sini kita hardcode dulu atau ambil dari header
        if (empty($data['branch_id'])) {
            $data['branch_id'] = 1; // Default Pusat
        }

        $request->set_body_params($data);
        return parent::create_item($request);
    }

    // Fungsi Khusus Update Status
    public function update_lead_status($request) {
        $id = $request->get_param('id');
        $data = $request->get_json_params();
        
        if (empty($data['status'])) {
            return new WP_REST_Response(['message' => 'Status wajib diisi'], 400);
        }

        $updated = $this->db->update(
            $this->table_name,
            ['status' => sanitize_text_field($data['status'])],
            ['id' => $id]
        );

        if ($updated === false) {
            return new WP_REST_Response(['message' => 'Gagal update status'], 500);
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Status pipeline diperbarui'], 200);
    }
}