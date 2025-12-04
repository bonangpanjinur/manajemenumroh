<?php
/**
 * Plugin Name: Manajemen Travel Umroh & Haji (Enterprise V4.0)
 * Plugin URI:  https://umrohweb.site
 * Description: Sistem Manajemen Travel Umroh Terpadu dengan React Dashboard, Booking Engine, HR, dan Finance.
 * Version:     4.0.0
 * Author:      Bonang Panji Nur
 * Author URI:  https://bonangpanjinur.com
 * License:     GPL v2 or later
 * Text Domain: umroh-manager
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Definisi Konstanta
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_VERSION', '4.0.0');

// 2. Load File Dependensi Utama
require_once UMH_PLUGIN_DIR . 'includes/utils.php';
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/cors.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';
require_once UMH_PLUGIN_DIR . 'includes/admin-login-customizer.php'; // Optional

// 3. Aktivasi Plugin (Membuat Tabel Database)
register_activation_hook(__FILE__, 'umh_activate_plugin');

function umh_activate_plugin() {
    // Memanggil fungsi pembuatan tabel dari includes/db-schema.php
    // Pastikan nama fungsi ini SAMA PERSIS dengan yang ada di db-schema.php
    if (function_exists('umh_create_tables')) {
        umh_create_tables();
    } else {
        // Fallback error logging jika fungsi tidak ketemu
        error_log('UMH Error: Fungsi umh_create_tables tidak ditemukan saat aktivasi.');
    }
    
    // Set role capability default
    $role = get_role('administrator');
    if ($role) {
        $role->add_cap('manage_umroh');
    }
}

// 4. Inisialisasi API Loader
function umh_init_api() {
    $api_loader = new UMH_API_Loader();
    $api_loader->init();
}
add_action('plugins_loaded', 'umh_init_api');

// 5. Menu Admin & Halaman React
function umh_admin_menu() {
    add_menu_page(
        'Manajemen Travel',
        'Manajemen Travel',
        'manage_options',
        'umroh-manager',
        'umh_render_react_app',
        'dashicons-palmtree',
        25
    );
}
add_action('admin_menu', 'umh_admin_menu');

// 6. Render Halaman React (Container)
function umh_render_react_app() {
    echo '<div id="umh-app-root"></div>';
}

// 7. Enqueue Scripts (Load File Build React)
function umh_enqueue_admin_scripts($hook) {
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

    // Kirim data penting ke React (Nonce & Info User)
    wp_localize_script('umh-react-app', 'umh_vars', [
        'nonce' => wp_create_nonce('wp_rest'),
        'api_url' => get_rest_url(null, 'umh/v1/'),
        'user_id' => get_current_user_id(),
        'site_url' => site_url()
    ]);
}
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');

// 8. Redirect setelah login (Optional - Langsung ke Dashboard App)
function umh_login_redirect($redirect_to, $request, $user) {
    if (isset($user->roles) && is_array($user->roles)) {
        if (in_array('administrator', $user->roles) || in_array('editor', $user->roles)) {
            // Uncomment baris di bawah jika ingin redirect paksa ke halaman plugin
            // return admin_url('admin.php?page=umroh-manager');
        }
    }
    return $redirect_to;
}
add_filter('login_redirect', 'umh_login_redirect', 10, 3);