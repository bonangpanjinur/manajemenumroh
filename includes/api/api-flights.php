<?php
if (!defined('ABSPATH')) {
    exit;
}

$schema = [
    'name'          => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'code'          => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'origin'        => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'destination'   => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'transit'       => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'contact_info'  => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'type'          => ['type' => 'string', 'default' => 'International'],
    'status'        => ['type' => 'string', 'default' => 'active'],
];

// PERBAIKAN: Gunakan nama tabel yang benar 'umh_master_airlines'
new UMH_CRUD_Controller(
    'flights',             
    'umh_master_airlines', 
    $schema,
    [
        'get_items'   => ['public'],
        'create_item' => ['administrator', 'owner', 'admin_staff'],
        'update_item' => ['administrator', 'owner', 'admin_staff'],
        'delete_item' => ['administrator', 'owner'],
    ],
    ['name', 'code', 'transit']
);