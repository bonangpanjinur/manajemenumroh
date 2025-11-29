<?php
/**
 * API endpoints for payments
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// --- FIX: Pastikan Utils dimuat sebelum file ini dijalankan ---
$utils_path = plugin_dir_path(__FILE__) . '../utils.php';
if (file_exists($utils_path)) {
    require_once $utils_path;
}
// --------------------------------------------------------------

class UMH_Payments_API_Controller extends UMH_CRUD_Controller {
    
    public function __construct() {
        // 1. Definisikan Schema
        $schema = [
            'jamaah_id'      => ['type' => 'integer', 'required' => true, 'sanitize_callback' => 'absint'],
            'amount'         => ['type' => 'number', 'required' => true],
            'payment_date'   => ['type' => 'string', 'format' => 'date', 'required' => true],
            'payment_method' => ['type' => 'string', 'required' => false, 'default' => 'cash', 'sanitize_callback' => 'sanitize_text_field'],
            'status'         => ['type' => 'string', 'required' => false, 'default' => 'pending', 'enum' => ['pending', 'verified', 'cancelled']],
            'notes'          => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
            'created_at'     => ['type' => 'datetime', 'readonly' => true],
            'updated_at'     => ['type' => 'datetime', 'readonly' => true],
            'created_by'     => ['type' => 'integer', 'readonly' => true],
        ];

        // 2. Definisikan Izin
        $permissions = [
            'get_items'    => ['owner', 'finance_staff', 'admin_staff', 'administrator'],
            'get_item'     => ['owner', 'finance_staff', 'admin_staff', 'administrator'],
            'create_item'  => ['owner', 'finance_staff', 'admin_staff', 'administrator'],
            'update_item'  => ['owner', 'finance_staff', 'admin_staff', 'administrator'],
            'delete_item'  => ['owner', 'finance_staff', 'administrator'],
        ];

        // 3. Definisikan Kolom Pencarian
        $searchable_fields = ['jamaah_name', 'payment_method', 'status', 'notes'];

        // 4. Panggil Parent Constructor
        parent::__construct(
            'payments',          // $resource_name
            'umh_payments',      // $table_slug
            $schema,             // $schema
            $permissions,        // $permissions
            $searchable_fields   // $searchable_fields
        );
    }

    /**
     * Override register_routes untuk menggunakan metode transaksional
     */
    public function register_routes() {
        $namespace = 'umh/v1';
        $base = $this->resource_name;

        $get_items_perm   = $this->permissions['get_items']   ?? ['owner'];
        $get_item_perm    = $this->permissions['get_item']    ?? ['owner'];
        $create_item_perm = $this->permissions['create_item'] ?? ['owner'];
        $update_item_perm = $this->permissions['update_item'] ?? ['owner'];
        $delete_item_perm = $this->permissions['delete_item'] ?? ['owner'];

        // Pastikan fungsi permission ada sebelum dipanggil
        $check_perm = function_exists('umh_check_api_permission') 
            ? 'umh_check_api_permission' 
            : function() { return current_user_can('manage_options'); };

        // Rute GET
        register_rest_route($namespace, '/' . $base, [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_items'],
                'permission_callback' => call_user_func($check_perm, $get_items_perm),
            ],
            // Rute POST (Create)
            [
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => [$this, 'create_item_transaksional'], 
                'permission_callback' => call_user_func($check_perm, $create_item_perm),
            ],
        ]);

        // Rute ID
        register_rest_route($namespace, '/' . $base . '/(?P<id>\d+)', [
            [
                'methods' => WP_REST_Server::READABLE,
                'callback' => [$this, 'get_item'],
                'permission_callback' => call_user_func($check_perm, $get_item_perm),
            ],
            [
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => [$this, 'update_item_transaksional'],
                'permission_callback' => call_user_func($check_perm, $update_item_perm),
            ],
            [
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => [$this, 'delete_item_transaksional'],
                'permission_callback' => call_user_func($check_perm, $delete_item_perm),
            ],
        ]);
    }

    // ... (Sisa kode di bawah sama persis, tidak perlu diubah) ...
    
    protected function get_base_query() {
        global $wpdb;
        $payments_table = $this->table_name;
        $jamaah_table = $wpdb->prefix . 'umh_jamaah';
        return "SELECT p.*, j.full_name as jamaah_name FROM {$payments_table} p LEFT JOIN {$jamaah_table} j ON p.jamaah_id = j.id";
    }

    protected function get_item_by_id($id) {
        global $wpdb;
        $query = $this->get_base_query() . $wpdb->prepare(" WHERE p.id = %d", $id);
        return $wpdb->get_row($query);
    }
    
    public function prepare_item_for_db($request, $is_update = false) {
        $data = parent::prepare_item_for_db($request, $is_update);
        if (is_wp_error($data)) return $data;
        
        if (!$is_update) {
            $context = function_exists('umh_get_current_user_context') ? umh_get_current_user_context($request) : ['user_id' => get_current_user_id()];
            if (!is_wp_error($context)) $data['created_by'] = $context['user_id'];
        }
        return $data;
    }

    public function create_item_transaksional($request) {
        global $wpdb;
        $data = $this->prepare_item_for_db($request);
        if (is_wp_error($data)) return $data;

        $wpdb->query('START TRANSACTION');
        $result = $wpdb->insert($this->table_name, $data);
        $new_id = $wpdb->insert_id;

        if ($result === false) { $wpdb->query('ROLLBACK'); return new WP_Error('db_error', 'Gagal menyimpan payment.', ['status' => 500]); }
        if ($this->update_jamaah_balance($data['jamaah_id']) === false) { $wpdb->query('ROLLBACK'); return new WP_Error('db_error', 'Gagal update saldo.', ['status' => 500]); }

        $wpdb->query('COMMIT');
        $this->clear_resource_cache();
        return new WP_REST_Response($this->get_item_by_id($new_id), 201);
    }

    public function update_item_transaksional($request) {
        global $wpdb;
        $id = (int) $request['id'];
        $old = $wpdb->get_row($wpdb->prepare("SELECT jamaah_id FROM {$this->table_name} WHERE id = %d", $id));
        if (!$old) return new WP_Error('not_found', 'Payment not found.', ['status' => 404]);

        $data = $this->prepare_item_for_db($request, true);
        if (is_wp_error($data)) return $data;

        $wpdb->query('START TRANSACTION');
        $result = $wpdb->update($this->table_name, $data, ['id' => $id]);
        if ($result === false) { $wpdb->query('ROLLBACK'); return new WP_Error('db_error', 'Gagal update payment.', ['status' => 500]); }

        $this->update_jamaah_balance($old->jamaah_id);
        if (isset($data['jamaah_id']) && $data['jamaah_id'] != $old->jamaah_id) { $this->update_jamaah_balance($data['jamaah_id']); }

        $wpdb->query('COMMIT');
        $this->clear_resource_cache();
        return new WP_REST_Response($this->get_item_by_id($id), 200);
    }

    public function delete_item_transaksional($request) {
        global $wpdb;
        $id = (int) $request['id'];
        $old = $wpdb->get_row($wpdb->prepare("SELECT jamaah_id FROM {$this->table_name} WHERE id = %d", $id));
        if (!$old) return new WP_Error('not_found', 'Payment not found.', ['status' => 404]);

        $wpdb->query('START TRANSACTION');
        $result = $wpdb->delete($this->table_name, ['id' => $id]);
        if ($result === false) { $wpdb->query('ROLLBACK'); return new WP_Error('db_error', 'Gagal hapus payment.', ['status' => 500]); }
        
        $this->update_jamaah_balance($old->jamaah_id);
        $wpdb->query('COMMIT');
        $this->clear_resource_cache();
        return new WP_REST_Response(true, 204);
    }

    protected function update_jamaah_balance($jamaah_id) {
        global $wpdb;
        if (empty($jamaah_id)) return false;

        $jamaah_table = $wpdb->prefix . 'umh_jamaah';
        $payments_table = $this->table_name;

        $jamaah_data = $wpdb->get_row($wpdb->prepare("SELECT package_price FROM {$jamaah_table} WHERE id = %d", $jamaah_id)); // Asumsi kolom package_price menyimpan total tagihan
        $total_price = (float) ($jamaah_data->package_price ?? 0);

        $total_paid = (float) $wpdb->get_var($wpdb->prepare("SELECT COALESCE(SUM(amount), 0) FROM {$payments_table} WHERE jamaah_id = %d AND status = 'verified'", $jamaah_id));
        
        $remaining = $total_price - $total_paid;
        $status = ($total_price > 0 && $remaining <= 0) ? 'lunas' : (($total_paid > 0) ? 'dicicil' : 'registered');

        // Kita tidak perlu kolom 'amount_paid' di tabel jamaah jika kita hitung on-the-fly, 
        // tapi untuk performa, simpan statusnya saja.
        return $wpdb->update($jamaah_table, ['status' => $status], ['id' => $jamaah_id]) !== false;
    }
}

new UMH_Payments_API_Controller();