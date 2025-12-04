<?php
/**
 * Plugin Name: Manajemen Travel Umroh & Haji (Enterprise V4.0)
 * Plugin URI:  https://umrohweb.site
 * Description: Sistem Manajemen Travel Umroh Terpadu dengan React Dashboard, Booking Engine, HR, dan Finance.
 * Version:     4.0.1
 * Author:      Bonang Panji Nur
 * Author URI:  https://bonangpanjinur.com
 * License:     GPL v2 or later
 * Text Domain: umroh-manager
 */

if (!defined('ABSPATH')) {
    exit;
}

define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_VERSION', '4.0.1');

require_once UMH_PLUGIN_DIR . 'includes/utils.php';
require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';
require_once UMH_PLUGIN_DIR . 'includes/cors.php';
require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';
require_once UMH_PLUGIN_DIR . 'includes/admin-login-customizer.php'; 

register_activation_hook(__FILE__, 'umh_activate_plugin');

function umh_activate_plugin() {
    if (function_exists('umh_create_tables')) {
        umh_create_tables();
    }
    
    $role = get_role('administrator');
    if ($role) {
        $role->add_cap('manage_umroh');
    }
}

function umh_init_api() {
    $api_loader = new UMH_API_Loader();
    $api_loader->init();
}
add_action('plugins_loaded', 'umh_init_api');

function umh_admin_menu() {
    $hook = add_menu_page(
        'Manajemen Travel',
        'Manajemen Travel',
        'manage_options',
        'umroh-manager',
        'umh_render_react_app',
        'dashicons-palmtree',
        2
    );
    
    // Tambahkan action untuk load script hanya di halaman ini
    add_action("load-$hook", 'umh_hide_wp_admin_ui');
}
add_action('admin_menu', 'umh_admin_menu');

// Fungsi menyembunyikan UI WordPress agar App terasa Native/Immersive
function umh_hide_wp_admin_ui() {
    // CSS untuk menyembunyikan Admin Bar dan Sidebar WP
    add_action('admin_head', function() {
        echo '<style>
            /* Sembunyikan Admin Bar Atas */
            #wpadminbar { display: none !important; }
            html.wp-toolbar { padding-top: 0 !important; }
            
            /* Sembunyikan Admin Menu Kiri */
            #adminmenumain, #adminmenuback, #adminmenuwrap { display: none !important; }
            #wpcontent, #wpfooter { margin-left: 0 !important; padding: 0 !important; }
            
            /* Reset Layout agar Full Screen */
            .update-nag, .notice, #wpbody-content > .wrap > h1 { display: none !important; }
            #wpbody-content { padding-bottom: 0 !important; }
            
            /* App Container Full Height */
            #umh-app-root {
                height: 100vh;
                width: 100vw;
                overflow: hidden; /* Scroll dihandle oleh React */
                background-color: #f3f4f6; /* Tailwind bg-gray-50 */
                position: fixed;
                top: 0;
                left: 0;
                z-index: 9999;
            }
        </style>';
    });
}

function umh_render_react_app() {
    echo '<div id="umh-app-root"></div>';
}

function umh_enqueue_admin_scripts($hook) {
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

    wp_localize_script('umh-react-app', 'umh_vars', [
        'nonce' => wp_create_nonce('wp_rest'),
        'api_url' => get_rest_url(null, 'umh/v1/'),
        'user_id' => get_current_user_id(),
        'site_url' => site_url()
    ]);
}
add_action('admin_enqueue_scripts', 'umh_enqueue_admin_scripts');