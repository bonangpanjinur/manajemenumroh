<?php
/**
 * API Handler untuk Marketing (Campaign) & Leads (Prospek)
 * Update: Filter Status, Sumber, dan Statistik Ringkas
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Marketing {
    private $tbl_mkt;
    private $tbl_leads;

    public function __construct() {
        global $wpdb;
        $this->tbl_mkt   = $wpdb->prefix . 'umh_marketing';
        $this->tbl_leads = $wpdb->prefix . 'umh_leads';
    }

    public function register_routes() {
        // CAMPAIGNS
        register_rest_route('umh/v1', '/marketing/campaigns', [
            'methods' => 'GET', 'callback' => [$this, 'get_campaigns'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/marketing/campaigns', [
            'methods' => 'POST', 'callback' => [$this, 'create_campaign'], 'permission_callback' => [$this, 'check_permission']
        ]);
        // Update & Delete Campaign (Baru)
        register_rest_route('umh/v1', '/marketing/campaigns/(?P<id>\d+)', [
            'methods' => 'PUT', 'callback' => [$this, 'update_campaign'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/marketing/campaigns/(?P<id>\d+)', [
            'methods' => 'DELETE', 'callback' => [$this, 'delete_campaign'], 'permission_callback' => [$this, 'check_permission']
        ]);

        // LEADS
        register_rest_route('umh/v1', '/marketing/leads', [
            'methods' => 'GET', 'callback' => [$this, 'get_leads'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/marketing/leads', [
            'methods' => 'POST', 'callback' => [$this, 'create_lead'], 'permission_callback' => [$this, 'check_permission']
        ]);
        // Update Status Lead (Penting untuk Funneling)
        register_rest_route('umh/v1', '/marketing/leads/(?P<id>\d+)', [
            'methods' => 'PUT', 'callback' => [$this, 'update_lead'], 'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/marketing/leads/(?P<id>\d+)', [
            'methods' => 'DELETE', 'callback' => [$this, 'delete_lead'], 'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    // --- CAMPAIGNS ---
    public function get_campaigns($request) {
        global $wpdb;
        $items = $wpdb->get_results("SELECT * FROM {$this->tbl_mkt} ORDER BY created_at DESC");
        
        // Opsional: Hitung jumlah leads per campaign
        foreach ($items as $item) {
            $item->lead_count = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$this->tbl_leads} WHERE marketing_id = %d", $item->id));
        }
        
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function create_campaign($request) {
        global $wpdb;
        $p = $request->get_json_params();
        $wpdb->insert($this->tbl_mkt, [
            'title' => sanitize_text_field($p['title']),
            'platform' => sanitize_text_field($p['platform']),
            'budget' => floatval($p['budget']),
            'start_date' => $p['start_date'],
            'end_date' => $p['end_date'],
            'status' => 'active'
        ]);
        return new WP_REST_Response(['success' => true, 'id' => $wpdb->insert_id], 201);
    }

    public function update_campaign($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $p = $request->get_json_params();
        
        $data = [];
        if(isset($p['title'])) $data['title'] = sanitize_text_field($p['title']);
        if(isset($p['status'])) $data['status'] = sanitize_text_field($p['status']);
        
        if(!empty($data)) $wpdb->update($this->tbl_mkt, $data, ['id' => $id]);
        return new WP_REST_Response(['success' => true, 'message' => 'Updated'], 200);
    }

    public function delete_campaign($request) {
        global $wpdb;
        $id = $request->get_param('id');
        // Set NULL leads yg terkait campaign ini
        $wpdb->update($this->tbl_leads, ['marketing_id' => null], ['marketing_id' => $id]);
        $wpdb->delete($this->tbl_mkt, ['id' => $id]);
        return new WP_REST_Response(['success' => true, 'message' => 'Deleted'], 200);
    }

    // --- LEADS ---
    public function get_leads($request) {
        global $wpdb;
        $status = $request->get_param('status');
        $source = $request->get_param('source');
        
        $where = "WHERE 1=1";
        if ($status) $where .= $wpdb->prepare(" AND status = %s", $status);
        if ($source) $where .= $wpdb->prepare(" AND source = %s", $source);
        
        $items = $wpdb->get_results("SELECT * FROM {$this->tbl_leads} $where ORDER BY created_at DESC");
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    public function create_lead($request) {
        global $wpdb;
        $p = $request->get_json_params();
        $wpdb->insert($this->tbl_leads, [
            'name' => sanitize_text_field($p['name']),
            'phone' => sanitize_text_field($p['phone']),
            'email' => sanitize_email($p['email']),
            'source' => sanitize_text_field($p['source']),
            'marketing_id' => !empty($p['marketing_id']) ? intval($p['marketing_id']) : null,
            'status' => $p['status'] ?? 'new'
        ]);
        return new WP_REST_Response(['success' => true, 'id' => $wpdb->insert_id], 201);
    }

    public function update_lead($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $p = $request->get_json_params();
        
        $data = [];
        if(isset($p['status'])) $data['status'] = sanitize_text_field($p['status']); // new -> contacted -> deal
        if(isset($p['notes'])) $data['notes'] = sanitize_textarea_field($p['notes']);
        
        if(!empty($data)) $wpdb->update($this->tbl_leads, $data, ['id' => $id]);
        return new WP_REST_Response(['success' => true, 'message' => 'Lead Updated'], 200);
    }

    public function delete_lead($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $wpdb->delete($this->tbl_leads, ['id' => $id]);
        return new WP_REST_Response(['success' => true, 'message' => 'Lead Deleted'], 200);
    }
}