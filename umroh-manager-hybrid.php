<?php
/*
Plugin Name: Manajemen Umrah Hybrid Enterprise
Plugin URI: https://umrohmanager.com
Description: Sistem Manajemen Travel Umrah & Haji Terpadu (Hybrid React + WP API)
Version: 3.0.0
Author: Bonang Panji Nur
Author URI: https://bonangpanjinur.com
License: GPLv2 or later
Text Domain: umroh-manager
*/

if (!defined('ABSPATH')) {
    exit;
}

// Define Constants
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_VERSION', '3.0.0');

// Include Core Files
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';
require_once UMH_PLUGIN_DIR . 'includes/admin-login-customizer.php';
require_once UMH_PLUGIN_DIR . 'includes/cors.php'; // Handle CORS for API

// Activation Hook
register_activation_hook(__FILE__, 'umh_activate_plugin');

function umh_activate_plugin() {
    umh_run_migration_v3();
    flush_rewrite_rules();
}

// Admin Menu & Assets
add_action('admin_menu', 'umh_register_admin_menu');
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');

function umh_register_admin_menu() {
    add_menu_page(
        'Manajemen Umrah',
        'Manajemen Umrah',
        'manage_options', // Capability
        'umroh-manager', // Menu Slug
        'umh_render_react_app', // Callback function
        'dashicons-palmtree',
        2
    );
}

function umh_render_react_app() {
    // This file should contain <div id="umh-app-root"></div>
    require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
}

function umh_enqueue_admin_scripts($hook) {
    // Only load on our plugin page
    if ($hook != 'toplevel_page_umroh-manager') {
        return;
    }

    $asset_file = include(UMH_PLUGIN_DIR . 'build/index.asset.php');

    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    wp_enqueue_style(
        'umh-react-style',
        UMH_PLUGIN_URL . 'build/index.css',
        [],
        $asset_file['version']
    );

    // Pass data to React
    wp_localize_script('umh-react-app', 'umhData', [
        'apiUrl' => home_url('/wp-json/umh/v1/'),
        'siteUrl' => home_url(),
        'nonce' => wp_create_nonce('wp_rest'),
        'currentUser' => wp_get_current_user()
    ]);
}

// Load API
new UMH_API_Loader();