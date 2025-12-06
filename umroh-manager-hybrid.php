<?php
/**
 * Plugin Name: Umroh Manager Hybrid
 * Description: Sistem Manajemen Travel Umroh (SaaS Ready) - Backend & Frontend React
 * Version: 7.8.0
 * Author: Bonang Panji Nur
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define Constants
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// Load Core Classes
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';
require_once UMH_PLUGIN_DIR . 'includes/cors.php'; 
require_once UMH_PLUGIN_DIR . 'includes/admin-login-customizer.php'; 

// Activation Hook (Database)
register_activation_hook(__FILE__, 'umh_create_db_tables');

/**
 * Inisialisasi Sistem
 * Kita pisahkan logika API dan Frontend agar sesuai standar WordPress
 */

// 1. Init API Routes (Hanya berjalan saat REST API dipanggil)
function umh_register_api_routes() {
    $api_loader = new UMH_API_Loader();
    $api_loader->init();
}
add_action('rest_api_init', 'umh_register_api_routes');

// 2. Init Frontend & Shortcodes (Berjalan saat WordPress loading)
function umh_init_frontend() {
    // Load class frontend jika belum diload oleh API Loader (untuk safety)
    if (!class_exists('UMH_Frontend')) {
        require_once UMH_PLUGIN_DIR . 'includes/class-umh-frontend.php';
    }
    $frontend = new UMH_Frontend();
    $frontend->init();
}
add_action('init', 'umh_init_frontend');


/**
 * =========================================================================
 * 3. ADMIN MENU & ASSETS (Untuk Super Admin di WP Dashboard)
 * =========================================================================
 */
function umh_admin_menu() {
    add_menu_page(
        'Umroh Manager',
        'Umroh Manager',
        'manage_options', // Hanya Administrator
        'umroh-manager',
        'umh_render_admin_page',
        'dashicons-palmtree',
        2
    );
}
add_action('admin_menu', 'umh_admin_menu');

function umh_admin_assets($hook) {
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

    // Kirim data ke React
    wp_localize_script('umh-react-app', 'umhSettings', [
        'root' => esc_url_raw(rest_url()),
        'nonce' => wp_create_nonce('wp_rest'),
        'userId' => get_current_user_id(),
        'siteUrl' => get_site_url(),
        'isFrontend' => false // Ini mode Backend WP
    ]);
}
add_action('admin_enqueue_scripts', 'umh_admin_assets');

function umh_render_admin_page() {
    echo '<div id="umh-admin-app"></div>';
}

/**
 * =========================================================================
 * 4. SECURITY: PROTEKSI WP-ADMIN (HEADLESS ENFORCEMENT)
 * =========================================================================
 */
function umh_restrict_admin_access() {
    // Jika sedang melakukan AJAX atau API call, biarkan lewat
    if (defined('DOING_AJAX') && DOING_AJAX) return;
    if (defined('REST_REQUEST') && REST_REQUEST) return;

    // Cek User Login
    if (is_user_logged_in()) {
        $user = wp_get_current_user();
        
        // Cek Role: Jika TIDAK punya kapabilitas 'manage_options' (Artinya bukan Super Admin)
        // Maka blokir akses ke /wp-admin
        if (!in_array('administrator', (array) $user->roles)) {
            
            // Redirect ke Halaman Aplikasi Frontend (Pastikan halaman dengan slug 'app' ada)
            // Atau redirect ke halaman depan (home) jika belum ada
            wp_redirect(home_url('/app')); 
            exit;
        }
    }
}
add_action('admin_init', 'umh_restrict_admin_access');

/**
 * Sembunyikan Admin Bar untuk Non-Admin
 */
function umh_hide_admin_bar() {
    if (!current_user_can('manage_options')) {
        show_admin_bar(false);
    }
}
add_action('after_setup_theme', 'umh_hide_admin_bar');

/**
 * Redirect Login WP Default ke Halaman Login App Custom
 */
function umh_redirect_login_page() {
    global $pagenow;
    if ($pagenow == 'wp-login.php' && $_SERVER['REQUEST_METHOD'] == 'GET' && !isset($_GET['action'])) {
        if (!is_user_logged_in()) {
            wp_redirect(home_url('/app#/login'));
            exit;
        }
    }
}
add_action('init', 'umh_redirect_login_page');