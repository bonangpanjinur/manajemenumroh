<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Agents extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_agents');
    }

    public function register_routes() {
        parent::register_routes();
        // Custom route untuk Topup Wallet Agen (Manual oleh Admin)
        register_rest_route('umh/v1', '/agents/(?P<id>\d+)/topup', [
            'methods' => 'POST',
            'callback' => [$this, 'manual_topup'],
            'permission_callback' => function() { return current_user_can('manage_options'); }
        ]);
    }

    // Override Get Items untuk Include Wallet Balance
    public function get_items($request) {
        $params = $request->get_params();
        $page = isset($params['page']) ? intval($params['page']) : 1;
        $per_page = isset($params['per_page']) ? intval($params['per_page']) : 10;
        $offset = ($page - 1) * $per_page;
        $search = isset($params['search']) ? sanitize_text_field($params['search']) : '';

        $sql_select = "SELECT a.*, COALESCE(w.balance, 0) as balance";
        $sql_from = "FROM {$this->table_name} a LEFT JOIN {$this->db->prefix}umh_wallets w ON (w.owner_id = a.id AND w.owner_type = 'agent')";
        
        $where = "WHERE a.deleted_at IS NULL";
        if (!empty($search)) {
            $where .= $this->db->prepare(" AND (a.name LIKE %s OR a.code LIKE %s)", "%$search%", "%$search%");
        }

        $sql = "$sql_select $sql_from $where ORDER BY a.created_at DESC LIMIT %d OFFSET %d";
        
        $data = $this->db->get_results($this->db->prepare($sql, $per_page, $offset));
        $total = $this->db->get_var("SELECT COUNT(*) $sql_from $where"); 

        return new WP_REST_Response([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'total_items' => intval($total),
                'total_pages' => ceil($total / $per_page),
                'page' => (int) $page
            ]
        ], 200);
    }

    // Fitur Topup Manual oleh Admin
    public function manual_topup($request) {
        $id = $request->get_param('id');
        $params = $request->get_json_params();
        $amount = floatval($params['amount']);
        $notes = $params['notes'] ?? 'Manual Topup';

        if (!$amount || $amount <= 0) return new WP_REST_Response(['message' => 'Jumlah harus positif'], 400);

        if (!class_exists('UMH_Wallet_Service')) return new WP_REST_Response(['message' => 'Wallet service not loaded.'], 500);
        $wallet = new UMH_Wallet_Service();

        $res = $wallet->process_transaction(
            'agent', $id, $amount, 'topup', "MANUAL-" . time(), $notes
        );

        if (is_wp_error($res)) return new WP_REST_Response(['message' => $res->get_error_message()], 400);

        return new WP_REST_Response(['success' => true, 'message' => 'Topup Berhasil'], 200);
    }
}