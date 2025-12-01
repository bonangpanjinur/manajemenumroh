<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Package_Categories_API extends UMH_CRUD_Controller {
    public function __construct() {
        $schema = [
            'name'        => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'slug'        => ['type' => 'string', 'sanitize_callback' => 'sanitize_title'],
            'description' => ['type' => 'string', 'sanitize_callback' => 'sanitize_textarea_field'],
        ];

        // PENTING: Gunakan tabel 'umh_package_categories'
        // Endpoint: /umh/v1/package-categories
        parent::__construct('package-categories', 'umh_package_categories', $schema, [
            'get_items'   => ['public'],
            'create_item' => ['administrator', 'owner', 'admin_staff', 'marketing_staff'],
            'update_item' => ['administrator', 'owner', 'admin_staff', 'marketing_staff'],
            'delete_item' => ['administrator', 'owner', 'admin_staff']
        ]);
    }
}
new UMH_Package_Categories_API();