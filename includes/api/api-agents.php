<?php
if (!defined('ABSPATH')) { exit; }

class UMH_Agents_API extends UMH_CRUD_Controller {

    public function __construct() {
        $schema = [
            'name'      => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'phone'     => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'city'      => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
            'code'      => ['type' => 'string', 'required' => false],
            // Ubah dari commission_rate ke commission_nominal
            'commission_nominal' => ['type' => 'number', 'default' => 0],
            'parent_id' => ['type' => 'integer', 'required' => false],
            'type'      => ['type' => 'string', 'default' => 'master'], 
        ];

        parent::__construct('agents', 'umh_agents', $schema, [
            'get_items' => ['owner', 'admin_staff', 'marketing'],
            'create_item' => ['owner', 'admin_staff'],
            'update_item' => ['owner', 'admin_staff'],
            'delete_item' => ['owner'],
        ]);
    }

    public function create_item($request) {
        global $wpdb;
        $params = $request->get_json_params();
        
        if (empty($params['parent_id']) || $params['parent_id'] == '0') {
            $params['parent_id'] = null;
        }
        
        if (empty($params['code'])) {
            $prefix = (isset($params['type']) && $params['type'] === 'sub') ? 'SB' : 'AG';
            $last_id = $wpdb->get_var("SELECT id FROM {$this->table_name} ORDER BY id DESC LIMIT 1");
            $next_num = ($last_id) ? $last_id + 1 : 1;
            
            do {
                $new_code = $prefix . '-' . str_pad($next_num, 4, '0', STR_PAD_LEFT);
                $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$this->table_name} WHERE code = %s", $new_code));
                if ($exists) $next_num++;
            } while ($exists);

            $params['code'] = $new_code;
        }

        $request->set_body_params($params);
        return parent::create_item($request);
    }

    public function update_item($request) {
        $params = $request->get_json_params();
        if (array_key_exists('parent_id', $params) && (empty($params['parent_id']) || $params['parent_id'] == '0')) {
            $params['parent_id'] = null;
            $request->set_body_params($params);
        }
        return parent::update_item($request);
    }
}
new UMH_Agents_API();