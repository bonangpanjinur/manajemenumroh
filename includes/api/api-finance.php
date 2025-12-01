<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Finance_API extends UMH_CRUD_Controller {
    
    public function __construct() {
        $schema = [
            'transaction_date' => ['type' => 'string', 'required' => true],
            'type'             => ['type' => 'string', 'required' => true, 'enum' => ['income', 'expense']],
            'category'         => ['type' => 'string', 'default' => 'General'],
            'amount'           => ['type' => 'number', 'required' => true],
            'description'      => ['type' => 'string'],
            'jamaah_id'        => ['type' => 'integer'],
            'employee_id'      => ['type' => 'integer'],
            'payment_method'   => ['type' => 'string'],
            'status'           => ['type' => 'string', 'default' => 'verified'],
            'proof_file'       => ['type' => 'string'], 
        ];

        parent::__construct('finance', 'umh_finance', $schema, [
            'get_items' => ['owner', 'admin_staff', 'finance_staff'],
            'create_item' => ['owner', 'admin_staff', 'finance_staff'],
            'update_item' => ['owner', 'admin_staff', 'finance_staff'],
            'delete_item' => ['owner', 'admin_staff']
        ]);
    }

    public function get_items($request) {
        global $wpdb;
        $jamaah_table = $wpdb->prefix . 'umh_jamaah';
        
        $sql = "SELECT f.*, j.full_name as jamaah_name 
                FROM {$this->table_name} f
                LEFT JOIN $jamaah_table j ON f.jamaah_id = j.id
                WHERE 1=1";

        if ($request->get_param('type')) {
            $sql .= $wpdb->prepare(" AND f.type = %s", $request->get_param('type'));
        }

        $sql .= " ORDER BY f.transaction_date DESC, f.id DESC";
        
        return rest_ensure_response($wpdb->get_results($sql, ARRAY_A));
    }

    public function create_item($request) {
        $response = parent::create_item($request);
        
        // Auto update status jemaah jika ada pembayaran
        if (!is_wp_error($response) && $response->get_status() === 201) {
            $data = $response->get_data();
            if (!empty($data['jamaah_id'])) {
                $this->update_jamaah_status($data['jamaah_id']);
            }
        }
        return $response;
    }

    private function update_jamaah_status($id) {
        global $wpdb;
        $paid = $wpdb->get_var($wpdb->prepare("SELECT SUM(amount) FROM {$this->table_name} WHERE jamaah_id=%d AND type='income'", $id));
        $price = $wpdb->get_var($wpdb->prepare("SELECT package_price FROM {$wpdb->prefix}umh_jamaah WHERE id=%d", $id));
        
        $status = ($paid > 0) ? 'dp' : 'registered';
        if ($price > 0 && $paid >= $price) $status = 'lunas';
        
        $wpdb->update($wpdb->prefix.'umh_jamaah', ['status' => $status], ['id' => $id]);
    }
}
new UMH_Finance_API();