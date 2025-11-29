<?php
if (!defined('ABSPATH')) {
    exit;
}

// PERBAIKAN: Menambahkan field transit, origin, destination, contact_info ke schema
// agar data yang dikirim dari frontend bisa disimpan ke database.
$schema = [
    'name'          => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'code'          => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'origin'        => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'destination'   => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'transit'       => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'], // Field baru
    'contact_info'  => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'type'          => ['type' => 'string', 'default' => 'International'],
    'status'        => ['type' => 'string', 'default' => 'active'],
];

new UMH_CRUD_Controller(
    'flights',           // Endpoint: umh/v1/flights
    'umh_flights',       // Nama Tabel DB
    $schema,
    [
        'get_items'   => ['owner', 'admin_staff'],
        'create_item' => ['owner', 'admin_staff'],
        'update_item' => ['owner', 'admin_staff'],
        'delete_item' => ['owner'],
    ],
    ['name', 'code', 'transit'] // Bisa cari berdasarkan transit juga
);