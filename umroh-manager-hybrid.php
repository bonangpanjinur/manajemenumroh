<?php
/**
 * Plugin Name: Manajemen Umroh Hybrid
 * Description: Sistem Manajemen Travel Umroh Enterprise (React + WP REST API).
 * Version: 4.0.5
 * Author: Bonang Panji Nur
 * Text Domain: umroh-manager
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// 1. Definisi Konstanta Path
define( 'UMH_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'UMH_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// 2. Include File-File Penting
if ( file_exists( UMH_PLUGIN_DIR . 'includes/utils.php' ) ) {
    require_once UMH_PLUGIN_DIR . 'includes/utils.php';
}

require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';

if ( file_exists( UMH_PLUGIN_DIR . 'includes/cors.php' ) ) {
    require_once UMH_PLUGIN_DIR . 'includes/cors.php';
}

if ( file_exists( UMH_PLUGIN_DIR . 'includes/admin-login-customizer.php' ) ) {
    require_once UMH_PLUGIN_DIR . 'includes/admin-login-customizer.php';
}

require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';

// 3. Hook Aktivasi
register_activation_hook( __FILE__, 'umh_activate_plugin' );
function umh_activate_plugin() {
    umh_create_db_tables();
}

// 4. Init API Loader
function umh_init_api() {
    $loader = new UMH_API_Loader();
    $loader->init();
}
add_action( 'plugins_loaded', 'umh_init_api' );

// 5. Daftarkan Menu Admin
function umh_add_admin_menu() {
    $hook = add_menu_page(
        'Manajemen Umroh',      
        'Manajemen Umroh',      
        'manage_options',       
        'umroh-manager',        
        'umh_render_react_page',
        'dashicons-airplane',   
        2                       
    );
    
    // Tambahkan action untuk load script hanya di halaman ini
    add_action( "load-$hook", 'umh_add_body_class' );
}
add_action( 'admin_menu', 'umh_add_admin_menu' );

// Helper: Tambah class ke body tag agar CSS admin-style.css bisa menarget dengan tepat
function umh_add_body_class() {
    add_filter( 'admin_body_class', function( $classes ) {
        return "$classes toplevel_page_umroh-manager";
    });
}

// Callback render halaman
function umh_render_react_page() {
    require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
}

// 6. Enqueue Scripts & Styles
function umh_enqueue_admin_scripts( $hook ) {
    // Hanya load di halaman plugin kita
    if ( $hook !== 'toplevel_page_umroh-manager' ) {
        return;
    }

    // 1. Load CSS Admin Reset (PENTING: Ini yang menyembunyikan layout WP)
    wp_enqueue_style(
        'umroh-manager-admin-reset',
        UMH_PLUGIN_URL . 'assets/css/admin-style.css',
        array(),
        time() // Force reload saat dev
    );

    // 2. Cek file asset React
    $asset_file_path = UMH_PLUGIN_DIR . 'build/index.asset.php';
    
    if ( ! file_exists( $asset_file_path ) ) {
        $asset_file = array( 'dependencies' => array( 'wp-element', 'wp-polyfill' ), 'version' => '1.0.0' );
    } else {
        $asset_file = include( $asset_file_path );
    }

    // 3. Load CSS React (Tailwind)
    wp_enqueue_style(
        'umroh-manager-style',
        UMH_PLUGIN_URL . 'build/index.css',
        array(),
        $asset_file['version']
    );

    // 4. Load JS React
    wp_enqueue_script(
        'umroh-manager-react',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    // 5. Kirim Data ke JS
    wp_localize_script( 'umroh-manager-react', 'umhData', array(
        'root_url' => esc_url_raw( rest_url() ),
        'nonce'    => wp_create_nonce( 'wp_rest' ),
        'admin_url'=> admin_url(),
        'user_id'  => get_current_user_id(),
        'site_name'=> get_bloginfo( 'name' )
    ) );
}
add_action( 'admin_enqueue_scripts', 'umh_enqueue_admin_scripts' );