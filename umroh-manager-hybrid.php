<?php
/**
 * Plugin Name: Umroh Manager Hybrid Enterprise
 * Description: Sistem Manajemen Travel Umrah Terlengkap (Core + HR + Agen + Private + Tabungan)
 * Version: 6.1.1
 * Author: Bonang Panji Nur
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Define Constants
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_DB_VERSION', '6.1.1');

// 2. Include Core Files
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';

// 3. Activation Hook
register_activation_hook(__FILE__, 'umh_activate_plugin');

function umh_activate_plugin() {
    umh_create_tables();
    umh_setup_roles();
}

function umh_setup_roles() {
    add_role('umh_agent', 'Travel Agent', array('read' => true));
    add_role('umh_staff', 'Travel Staff', array('read' => true, 'edit_posts' => true));
}

// 4. Check DB Update
add_action('plugins_loaded', 'umh_check_db_update');
function umh_check_db_update() {
    if (get_option('umh_db_version') != UMH_DB_VERSION) {
        umh_create_tables();
    }
}

// 5. Initialize API
$api_loader = new UMH_API_Loader();
$api_loader->init();

// 6. Admin Menu & React App Integration
add_action('admin_menu', 'umh_register_admin_page');

function umh_register_admin_page() {
    $hook_suffix = add_menu_page(
        'Umroh Manager',
        'Umroh Manager',
        'manage_options',
        'umroh-manager',
        'umh_render_react_app',
        'dashicons-palmtree',
        2
    );

    // Load script HANYA di halaman plugin kita
    add_action("admin_print_scripts-{$hook_suffix}", 'umh_enqueue_react_app');
}

function umh_enqueue_react_app() {
    $asset_file = include(UMH_PLUGIN_DIR . 'build/index.asset.php');

    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    wp_enqueue_style(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.css',
        array(),
        $asset_file['version']
    );

    // Variable Global untuk React (Nonce & API URL)
    wp_localize_script('umh-react-app', 'umh_settings', array(
        'root'  => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'admin_url' => admin_url(),
        'app_id' => 'umroh-manager' // Gunakan jika perlu identifikasi unik
    ));
}

function umh_render_react_app() {
    echo '<div id="umroh-manager-root"></div>';
}
?>