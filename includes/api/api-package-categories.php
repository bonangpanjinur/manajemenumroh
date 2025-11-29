<?php
if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', 'umh_register_pkg_categories_routes');

function umh_register_pkg_categories_routes() {
    $base = 'package-categories';

    $schema = [
        'name'        => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
        'slug'        => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_title'],
        'description' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    ];

    new UMH_CRUD_Controller(
        $base,                     // Endpoint: umh/v1/package-categories
        'umh_package_categories',  // Nama Tabel DB
        $schema,
        [
            'get_items'   => ['owner', 'admin_staff'],
            'create_item' => ['owner', 'admin_staff'],
            'update_item' => ['owner', 'admin_staff'],
            'delete_item' => ['owner'],
        ],
        ['name', 'slug']
    );
}