<?php
/**
 * Plugin Name: Umroh Manager Hybrid Enterprise
 * Description: Sistem Manajemen Travel Umroh & Haji Berbasis React + WP REST API.
 * Version: 7.0.2
 * Author: Bonang Panji
 * Text Domain: umh
 */

if (!defined('ABSPATH')) {
    exit;
}

define('UMH_VERSION', '7.0.2');
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

global $umh_admin_hook;

// 1. Install & DB Migration
register_activation_hook(__FILE__, 'umh_install_plugin');
function umh_install_plugin() {
    require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
    if (function_exists('umh_create_db_tables')) {
        umh_create_db_tables();
    }
}

// 2. Load Classes
require_once UMH_PLUGIN_DIR . 'includes/utils.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';
require_once UMH_PLUGIN_DIR . 'includes/admin-login-customizer.php'; // Optional Login Customizer
require_once UMH_PLUGIN_DIR . 'includes/cors.php'; // Handle CORS

// 3. Init API
$api_loader = new UMH_API_Loader();
$api_loader->init();

// 4. Menu Admin
add_action('admin_menu', 'umh_register_admin_page');
function umh_register_admin_page() {
    global $umh_admin_hook;
    $umh_admin_hook = add_menu_page(
        'Umroh Manager', 
        'Umroh Manager', 
        'read', // Capability minimal read agar staff bisa akses
        'umroh-manager', 
        'umh_render_react_app', 
        'dashicons-palmtree', 
        2
    );
    
    // Tambahkan Submenu Settings (Optional, jika ingin config via WP biasa)
    require_once UMH_PLUGIN_DIR . 'admin/settings-page.php';
    $settings_page = new UMH_Settings_Page();
    $settings_page->register_settings(); // Register settings
}

function umh_render_react_app() {
    // Memanggil file view terpisah agar rapi
    require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
}

// 5. Scripts & Styles
add_action('admin_enqueue_scripts', 'umh_enqueue_scripts');
function umh_enqueue_scripts($hook) {
    global $umh_admin_hook;
    
    // Hanya load di halaman plugin kita
    if ($hook !== $umh_admin_hook) return;

    $asset_path = UMH_PLUGIN_DIR . 'build/index.asset.php';
    $js_path = UMH_PLUGIN_DIR . 'build/index.js';
    $css_path = UMH_PLUGIN_DIR . 'build/index.css';

    // Fallback version jika asset file belum generate
    $version = UMH_VERSION;
    $dependencies = ['wp-element', 'wp-components', 'wp-i18n'];

    if (file_exists($asset_path)) {
        $asset_file = include($asset_path);
        $version = $asset_file['version'];
        $dependencies = $asset_file['dependencies'];
    }

    // Load React App JS
    wp_enqueue_script(
        'umh-react-app', 
        UMH_PLUGIN_URL . 'build/index.js', 
        $dependencies, 
        $version, 
        true
    );
    
    // Load React App CSS
    if (file_exists($css_path)) {
        wp_enqueue_style(
            'umh-react-style', 
            UMH_PLUGIN_URL . 'build/index.css', 
            ['wp-components'], 
            $version
        );
    }

    // Load Admin Style Khusus (Reset UI WordPress)
    wp_enqueue_style(
        'umh-admin-reset', 
        UMH_PLUGIN_URL . 'assets/css/admin-style.css', 
        [], 
        UMH_VERSION
    );

    // Kirim Data ke JS (Global Variable)
    wp_localize_script('umh-react-app', 'umhSettings', [
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'adminUrl' => admin_url(),
        'currentUser' => wp_get_current_user(),
        'siteName' => get_bloginfo('name')
    ]);
}