<?php
/*
Plugin Name: Manajemen Umrah Hybrid Enterprise
Description: Sistem Manajemen Umrah & Haji Lengkap (React + WordPress)
Version: 2.0.1
Author: Bonang Panji
Text Domain: umroh-manager
*/

if (!defined('ABSPATH')) exit; 

define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));

// 1. LOAD UTILS (Wajib)
require_once UMH_PLUGIN_DIR . 'includes/utils.php';

// 2. Include API Loader
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';

// 3. Menu Admin
function umh_add_admin_menu() {
    add_menu_page(
        'Manajemen Umrah',
        'Manajemen Umrah',
        'manage_options',
        'umroh-manager',
        'umh_render_admin_page',
        'dashicons-groups',
        6
    );
}
add_action('admin_menu', 'umh_add_admin_menu');

// 4. Callback Render Halaman (DENGAN CSS INLINE FIX)
function umh_render_admin_page() {
    // CSS Inline untuk memaksa Full Screen & Menyembunyikan UI WordPress
    ?>
    <style>
        /* Reset Global */
        html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
            height: 100vh !important; 
            overflow: hidden !important; 
            background: #f3f4f6 !important; 
        }
        /* Sembunyikan Admin Bar Atas */
        #wpadminbar { display: none !important; }
        /* Sembunyikan Menu Kiri WordPress */
        #adminmenumain, #adminmenuback, #adminmenuwrap { display: none !important; }
        /* Sembunyikan Footer & Notice */
        #wpfooter, .update-nag, .notice { display: none !important; }
        
        /* Reset Container Konten */
        #wpcontent, #wpbody-content { 
            margin-left: 0 !important; 
            padding: 0 !important; 
            height: 100vh !important; 
        }
        .auto-fold #wpcontent { margin-left: 0 !important; }
        
        /* Container Aplikasi React */
        #umroh-manager-app {
            height: 100vh;
            width: 100vw;
            display: flex;
            flex-direction: column;
            background: #f3f4f6;
        }
    </style>
    <?php
    
    // Panggil file view
    require_once UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
}

// 5. Enqueue Scripts
function umh_enqueue_admin_scripts($hook) {
    if ($hook !== 'toplevel_page_umroh-manager') {
        return;
    }

    // Load CSS Admin Eksternal (Opsional, karena sudah ada inline di atas)
    wp_enqueue_style('umh-admin-style', UMH_PLUGIN_URL . 'assets/css/admin-style.css', [], '1.0.1');

    $asset_file = include(UMH_PLUGIN_DIR . 'build/index.asset.php');

    // React Styles
    wp_enqueue_style('umh-react-style', UMH_PLUGIN_URL . 'build/index.css', [], $asset_file['version']);

    // React Script
    wp_enqueue_script(
        'umh-react-app',
        UMH_PLUGIN_URL . 'build/index.js',
        $asset_file['dependencies'],
        $asset_file['version'],
        true
    );

    // Kirim Data ke JS
    wp_localize_script('umh-react-app', 'umhData', array(
        'apiUrl'  => rest_url('umh/v1/'),
        'root'    => rest_url(),
        'nonce'   => wp_create_nonce('wp_rest'),
        'user'    => wp_get_current_user(),
        'siteUrl' => get_site_url()
    ));
}
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');

// 6. Body Class Hook
function umh_add_admin_body_class($classes) {
    if (isset($_GET['page']) && $_GET['page'] === 'umroh-manager') {
        return "$classes umroh-manager-page";
    }
    return $classes;
}
add_filter('admin_body_class', 'umh_add_admin_body_class');

// 7. Init API
function umh_init_plugin() {
    $api_loader = new UMH_Api_Loader();
    $api_loader->register_routes();
}
add_action('plugins_loaded', 'umh_init_plugin');

// 8. Migrasi DB
register_activation_hook(__FILE__, 'umh_activate_plugin');
function umh_activate_plugin() {
    require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
    umh_run_migration_v3();
}