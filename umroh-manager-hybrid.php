<?php
/**
 * Plugin Name: Umroh Manager Hybrid Enterprise
 * Description: Sistem Manajemen Travel Umrah Terlengkap (Core + HR + Agen + Private + Tabungan)
 * Version: 6.1.0
 * Author: Bonang Panji Nur
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Define Constants
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_DB_VERSION', '6.1.0');

// 2. Include Core Files
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';

// 3. Activation Hook (Membuat Tabel Database)
register_activation_hook(__FILE__, 'umh_activate_plugin');

function umh_activate_plugin() {
    // Panggil fungsi pembuatan tabel dari db-schema.php
    umh_create_tables();
    
    // Set role capabilities jika perlu (opsional)
    umh_setup_roles();
}

function umh_setup_roles() {
    add_role('umh_agent', 'Travel Agent', array('read' => true));
    add_role('umh_staff', 'Travel Staff', array('read' => true, 'edit_posts' => true));
}

// 4. Check DB Update on Load
add_action('plugins_loaded', 'umh_check_db_update');
function umh_check_db_update() {
    if (get_option('umh_db_version') != UMH_DB_VERSION) {
        umh_create_tables();
    }
}

// 5. Initialize API
$api_loader = new UMH_API_Loader();
$api_loader->init();

// 6. Admin Scripts & Styles (Optional)
add_action('admin_enqueue_scripts', 'umh_admin_scripts');
function umh_admin_scripts() {
    // wp_enqueue_style('umh-admin', UMH_PLUGIN_URL . 'assets/css/admin.css');
}

// 7. React Dashboard Integration (Placeholder)
// Fungsi ini akan memuat file build React di halaman admin
add_action('admin_menu', 'umh_register_admin_page');
function umh_register_admin_page() {
    add_menu_page(
        'Umroh Manager',
        'Umroh Manager',
        'manage_options',
        'umroh-manager',
        'umh_render_react_app',
        'dashicons-palmtree',
        2
    );
}

function umh_render_react_app() {
    echo '<div id="umroh-manager-root"></div>';
    // Logic untuk load script React (build/index.js) akan ditambahkan saat setup Frontend
}
?>