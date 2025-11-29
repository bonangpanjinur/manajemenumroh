<?php
/**
 * File: includes/api/api-categories.php
 * Menangani data Kategori Keuangan (Finance Categories).
 * Endpoint: /umh/v1/categories
 */

if (!defined('ABSPATH')) {
    exit;
}

// Pastikan class controller sudah dimuat
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

// Schema untuk Kategori Keuangan (umh_categories)
$categories_schema = [
    'name'        => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'description' => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    'type'        => ['type' => 'string', 'required' => false, 'default' => 'expense', 'enum' => ['income', 'expense']],
];

// Izin akses
$categories_permissions = [
    'get_items'    => ['owner', 'admin_staff', 'finance_staff'],
    'get_item'     => ['owner', 'admin_staff', 'finance_staff'],
    'create_item'  => ['owner', 'admin_staff', 'finance_staff'],
    'update_item'  => ['owner', 'admin_staff', 'finance_staff'],
    'delete_item'  => ['owner', 'admin_staff'],
];

// Inisialisasi Controller
// Endpoint: /wp-json/umh/v1/categories
new UMH_CRUD_Controller('categories', 'umh_categories', $categories_schema, $categories_permissions);
?>