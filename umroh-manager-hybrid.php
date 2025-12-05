<?php
/**
 * Plugin Name: Umroh Manager Hybrid Enterprise
 * Description: Sistem Manajemen Travel Umroh & Haji Berbasis React + WP REST API.
 * Version: 7.0.0
 * Author: Bonang Panji
 * Text Domain: umh
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define Constants
define('UMH_VERSION', '7.0.0');
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// 1. Load DB Schema & Run Migration on Activation
register_activation_hook(__FILE__, 'umh_install_plugin');
function umh_install_plugin() {
    require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
    umh_create_db_tables();
}

// 2. Load Core Classes
require_once UMH_PLUGIN_DIR . 'includes/utils.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';
require_once UMH_PLUGIN_DIR . 'includes/admin-login-customizer.php'; // Optional: Custom WP Login

// 3. Initialize API
$api_loader = new UMH_API_Loader();
$api_loader->init();

// 4. Register Admin Menu & Load React App
add_action('admin_menu', 'umh_register_admin_page');
function umh_register_admin_page() {
    add_menu_page(
        'Umroh Manager', 
        'Umroh Manager', 
        'read', // Capability minimal (bisa diadjust)
        'umroh-manager', 
        'umh_render_react_app', 
        'dashicons-palmtree', 
        2
    );
}

function umh_render_react_app() {
    // Container untuk React mounting
    echo '<div id="umh-admin-app"></div>';
}

// 5. Enqueue React Scripts
add_action('admin_enqueue_scripts', 'umh_enqueue_scripts');
function umh_enqueue_scripts($hook) {
    // Hanya load di halaman plugin kita
    if ($hook !== 'toplevel_page_umroh-manager') {
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

    // Kirim data penting ke JS (Nonce & URL API)
    wp_localize_script('umh-react-app', 'umhSettings', [
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'adminUrl' => admin_url(),
        'currentUser' => wp_get_current_user()
    ]);
}