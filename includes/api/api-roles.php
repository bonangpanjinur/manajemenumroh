<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Roles_API extends UMH_CRUD_Controller {
    public function __construct() {
        $schema = [
            'role_key'     => ['type' => 'string', 'required' => true],
            'role_name'    => ['type' => 'string', 'required' => true],
            'capabilities' => ['type' => 'array'], // Array checkbox
        ];
        parent::__construct('roles', 'umh_roles', $schema, ['get_items' => ['administrator'], 'create_item' => ['administrator']]);
    }

    public function create_item($request) {
        $params = $request->get_json_params();
        $params['capabilities'] = json_encode($params['capabilities']); // Simpan sebagai JSON string
        $request->set_body_params($params);
        return parent::create_item($request);
    }

    public function update_item($request) {
        $params = $request->get_json_params();
        if (isset($params['capabilities'])) {
            $params['capabilities'] = json_encode($params['capabilities']);
        }
        $request->set_body_params($params);
        return parent::update_item($request);
    }
}
new UMH_Roles_API();
?>