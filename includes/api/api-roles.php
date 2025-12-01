<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Roles_API extends UMH_CRUD_Controller {
    public function __construct() {
        // Schema harus sesuai dengan kolom di tabel umh_roles
        $schema = [
            'role_key'     => ['type' => 'string', 'required' => true],
            'role_name'    => ['type' => 'string', 'required' => true],
            'capabilities' => ['type' => 'string'], // JSON String
        ];

        parent::__construct('roles', 'umh_roles', $schema, [
            'get_items' => ['administrator', 'owner'],
            'create_item' => ['administrator', 'owner'],
            'update_item' => ['administrator', 'owner'],
            'delete_item' => ['administrator', 'owner']
        ]);
    }

    // Override Create: Encode capabilities ke JSON sebelum simpan
    public function create_item($request) {
        $params = $request->get_json_params();
        if (isset($params['capabilities']) && is_array($params['capabilities'])) {
            $params['capabilities'] = json_encode($params['capabilities']);
        }
        $request->set_body_params($params);
        return parent::create_item($request);
    }

    // Override Update: Encode capabilities ke JSON sebelum update
    public function update_item($request) {
        $params = $request->get_json_params();
        if (isset($params['capabilities']) && is_array($params['capabilities'])) {
            $params['capabilities'] = json_encode($params['capabilities']);
        }
        $request->set_body_params($params);
        return parent::update_item($request);
    }
}
new UMH_Roles_API();