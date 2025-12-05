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

define('UMH_VERSION', '7.0.0');
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

// 3. Init API
$api_loader = new UMH_API_Loader();
$api_loader->init();

// 4. Menu Admin
add_action('admin_menu', 'umh_register_admin_page');
function umh_register_admin_page() {
    global $umh_admin_hook;
    $umh_admin_hook = add_menu_page('Umroh Manager', 'Umroh Manager', 'read', 'umroh-manager', 'umh_render_react_app', 'dashicons-palmtree', 2);
}

function umh_render_react_app() {
    echo '<div id="umh-admin-app"></div>';
}

// 5. Scripts
add_action('admin_enqueue_scripts', 'umh_enqueue_scripts');
function umh_enqueue_scripts($hook) {
    global $umh_admin_hook;
    if ($hook !== $umh_admin_hook) return;

    $asset_path = UMH_PLUGIN_DIR . 'build/index.asset.php';
    $js_path = UMH_PLUGIN_DIR . 'build/index.js';

    if (!file_exists($asset_path) || !file_exists($js_path)) {
        wp_die('Error: File build React tidak ditemukan. Jalankan "npm run build" dulu.');
    }

    $asset_file = include($asset_path);

    wp_enqueue_script('umh-react-app', UMH_PLUGIN_URL . 'build/index.js', $asset_file['dependencies'], $asset_file['version'], true);
    wp_enqueue_style('umh-react-style', UMH_PLUGIN_URL . 'build/index.css', ['wp-components'], $asset_file['version']);

    wp_localize_script('umh-react-app', 'umhSettings', [
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'adminUrl' => admin_url(),
        'currentUser' => wp_get_current_user()
    ]);
}