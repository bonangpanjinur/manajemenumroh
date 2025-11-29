<?php
if (!defined('ABSPATH')) { exit; }

// Pastikan utils dimuat
$utils_path = plugin_dir_path(__FILE__) . '../utils.php';
if (file_exists($utils_path)) require_once $utils_path;

class UMH_Agents_API extends UMH_CRUD_Controller {

    public function __construct() {
        $schema = [
            'name'      => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'phone'     => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'city'      => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
            'code'      => ['type' => 'string', 'required' => false],
            // FIX: Sesuaikan nama field dengan kolom database (db-schema.php)
            'fixed_commission' => ['type' => 'number', 'default' => 0], 
            'parent_id' => ['type' => 'integer', 'required' => false],
            'type'      => ['type' => 'string', 'default' => 'master'], 
            // Tambahan field profil agen
            'agency_name' => ['type' => 'string'],
            'level'       => ['type' => 'string', 'default' => 'silver'],
            'status'      => ['type' => 'string', 'default' => 'active'],
            'email'       => ['type' => 'string'],
            'bank_name'   => ['type' => 'string'],
            'bank_account_number' => ['type' => 'string'], // Sesuaikan dgn DB (bank_number vs bank_account_number)
            'bank_account_holder' => ['type' => 'string'],
        ];

        parent::__construct('agents', 'umh_agents', $schema, [
            'get_items' => ['owner', 'admin_staff', 'marketing_staff', 'finance_staff'],
            'create_item' => ['owner', 'admin_staff', 'marketing_staff'],
            'update_item' => ['owner', 'admin_staff', 'marketing_staff'],
            'delete_item' => ['owner', 'admin_staff'],
        ]);
    }

    public function create_item($request) {
        global $wpdb;
        $params = $request->get_json_params();
        
        // Mapping frontend 'commission_rate'/'commission_nominal' ke DB 'fixed_commission'
        if (isset($params['commission_rate']) && !isset($params['fixed_commission'])) {
            $params['fixed_commission'] = $params['commission_rate'];
        }
        if (isset($params['commission_nominal'])) {
            $params['fixed_commission'] = $params['commission_nominal'];
        }
        
        // Mapping Bank Fields
        if (isset($params['bank_number'])) $params['bank_account_number'] = $params['bank_number'];
        if (isset($params['bank_holder'])) $params['bank_account_holder'] = $params['bank_holder'];

        if (empty($params['parent_id']) || $params['parent_id'] == '0') {
            $params['parent_id'] = null;
        }
        
        // Auto Generate Code
        if (empty($params['code'])) {
            $prefix = (isset($params['type']) && $params['type'] === 'sub') ? 'SB' : 'AG';
            $last_id = $wpdb->get_var("SELECT id FROM {$this->table_name} ORDER BY id DESC LIMIT 1");
            $next_num = ($last_id) ? $last_id + 1 : 1;
            $params['code'] = $prefix . '-' . str_pad($next_num, 4, '0', STR_PAD_LEFT);
        }

        // Wajib set user_id (karena kolom user_id NOT NULL di DB)
        if (!isset($params['user_id'])) {
            $context = umh_get_current_user_context($request);
            $params['user_id'] = is_wp_error($context) ? 0 : $context['user_id']; 
            // Jika 0 mungkin gagal insert karena FK, idealnya buat user WP baru atau ambil user yang sedang login
        }

        $request->set_body_params($params);
        return parent::create_item($request);
    }

    public function update_item($request) {
        $params = $request->get_json_params();
        
        // Mapping update
        if (isset($params['commission_rate'])) $params['fixed_commission'] = $params['commission_rate'];
        if (isset($params['commission_nominal'])) $params['fixed_commission'] = $params['commission_nominal'];
        
        if (isset($params['bank_number'])) $params['bank_account_number'] = $params['bank_number'];
        if (isset($params['bank_holder'])) $params['bank_account_holder'] = $params['bank_holder'];

        if (array_key_exists('parent_id', $params) && (empty($params['parent_id']) || $params['parent_id'] == '0')) {
            $params['parent_id'] = null;
        }
        
        $request->set_body_params($params);
        return parent::update_item($request);
    }
}
new UMH_Agents_API();