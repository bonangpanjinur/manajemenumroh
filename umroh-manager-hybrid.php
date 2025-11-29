<?php
/*
Plugin Name: Manajemen Umrah Hybrid Enterprise
Description: Sistem Manajemen Umrah & Haji Lengkap (React + WordPress)
Version: 2.0.0
Author: Bonang Panji
Text Domain: umroh-manager
*/

if (!defined('ABSPATH')) exit; // Exit if accessed directly

// Define Constants
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// 1. Include Dependensi API (Biarkan yang sudah ada)
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';

// 2. Menu Admin
function umh_add_admin_menu() {
    add_menu_page(
        'Manajemen Umrah',      // Page Title
        'Manajemen Umrah',      // Menu Title
        'manage_options',       // Capability
        'umroh-manager',        // Menu Slug
        'umh_render_admin_page',// Callback Function (PENTING!)
        'dashicons-groups',     // Icon
        6                       // Position
    );
}
add_action('admin_menu', 'umh_add_admin_menu');

// 3. Callback Function untuk Render Halaman (INI YANG SERING SALAH)
function umh_render_admin_page() {
    // Panggil file view yang berisi <div id="umroh-manager-app">
    require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
}

// 4. Enqueue Scripts & Styles (React Build)
function umh_enqueue_admin_scripts($hook) {
    // Hanya load di halaman plugin kita agar tidak bentrok dengan plugin lain
    if ($hook !== 'toplevel_page_umroh-manager') {
        return;
    }

    $asset_file = include(UMH_PLUGIN_DIR . 'build/index.asset.php');

    // Load CSS
    wp_enqueue_style(
        'umh-react-style',
        UMH_PLUGIN_URL . 'build/index.css',
        array(),
        $asset_file['version']
    );

    // Load JS (React)
    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'], // Ini otomatis include wp-element (React)
        $asset_file['version'],
        true // Load di footer (PENTING AGAR DIV SUDAH ADA SAAT JS JALAN)
    );

    // Kirim Data dari PHP ke JS (Global Variables)
    wp_localize_script('umh-react-app', 'umhData', array(
        'apiUrl' => rest_url('umh/v1/'),
        'nonce'  => wp_create_nonce('wp_rest'),
        'userId' => get_current_user_id(),
        'siteUrl' => get_site_url()
    ));
}
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');

// 5. Inisialisasi API
function umh_init_plugin() {
    $api_loader = new UMH_Api_Loader();
    $api_loader->register_routes();
}
add_action('plugins_loaded', 'umh_init_plugin');