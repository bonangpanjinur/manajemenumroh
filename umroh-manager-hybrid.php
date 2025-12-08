<?php
/**
 * Plugin Name: Umroh Manager Hybrid Enterprise
 * Plugin URI: https://bonang.my.id
 * Description: Sistem Manajemen Travel Umrah & Haji Terpadu (React + WordPress REST API).
 * Version: 2.5.0
 * Author: Tim IT Berkah
 * Author URI: https://berkahtravel.com
 * License: GPL v2 or later
 * Text Domain: umroh-manager
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define Constants
define('UMH_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UMH_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UMH_VERSION', '2.5.0');

/**
 * Main Class Umroh_Manager_Hybrid
 */
class Umroh_Manager_Hybrid {

    private static $instance = null;

    public static function get_instance() {
        if (self::$instance == null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        // 1. Load Dependencies
        $this->load_dependencies();

        // 2. Register Hooks
        add_action('admin_menu', array($this, 'register_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        add_action('rest_api_init', array($this, 'init_rest_api'));
        
        // 3. Handle CORS (Optional but recommended for React)
        add_action('init', array($this, 'handle_cors'));

        // 4. Custom Login Screen (Optional)
        if (file_exists(UMH_PLUGIN_DIR . 'includes/admin-login-customizer.php')) {
            require_once UMH_PLUGIN_DIR . 'includes/admin-login-customizer.php';
        }
    }

    /**
     * Load required files
     */
    private function load_dependencies() {
        // Utilities & Helpers
        require_once UMH_PLUGIN_DIR . 'includes/utils.php';
        
        // Database Schema (untuk aktivasi)
        require_once UMH_PLUGIN_DIR . 'includes/db-schema.php';

        // API Handler Classes
        require_once UMH_PLUGIN_DIR . 'includes/class-umh-api-loader.php';
        require_once UMH_PLUGIN_DIR . 'includes/class-umh-crud-controller.php';
        
        // CORS Handler
        if (file_exists(UMH_PLUGIN_DIR . 'includes/cors.php')) {
            require_once UMH_PLUGIN_DIR . 'includes/cors.php';
        }
    }

    /**
     * Register Admin Menu
     * Membuat menu di sidebar kiri WordPress yang membuka aplikasi React
     */
    public function register_admin_menu() {
        add_menu_page(
            'Umroh Manager',       // Page Title
            'Umroh Manager',       // Menu Title
            'manage_options',      // Capability (Admin Only)
            'umroh-manager',       // Menu Slug (PENTING: Harus match dengan src/index.jsx)
            array($this, 'render_react_app'), // Callback function
            'dashicons-groups',    // Icon
            2                      // Position
        );
    }

    /**
     * Render React App Wrapper
     * Memanggil file template PHP yang berisi container <div id="umroh-manager-app">
     */
    public function render_react_app() {
        $template_path = UMH_PLUGIN_DIR . 'admin/dashboard-react.php';
        
        if (file_exists($template_path)) {
            require_once $template_path;
        } else {
            echo '<div class="error"><p>Error: Template aplikasi tidak ditemukan. Pastikan file admin/dashboard-react.php ada.</p></div>';
        }
    }

    /**
     * Enqueue Scripts & Styles
     * Memuat file build React dan mengirimkan variabel global (Nonce) ke JS
     */
    public function enqueue_admin_assets($hook) {
        // HANYA load di halaman plugin kita untuk performa & menghindari konflik
        if (strpos($hook, 'umroh-manager') === false) {
            return;
        }

        // Cek keberadaan file asset manifest dari build process
        $asset_file_path = UMH_PLUGIN_DIR . 'build/index.asset.php';
        
        if (!file_exists($asset_file_path)) {
            // Fallback development mode atau error handling
            $asset_file = array('dependencies' => array('wp-element', 'wp-polyfill'), 'version' => time());
        } else {
            $asset_file = include($asset_file_path);
        }

        // 1. Load CSS Aplikasi
        wp_enqueue_style(
            'umroh-manager-style',
            UMH_PLUGIN_URL . 'build/index.css',
            array(),
            $asset_file['version']
        );
        
        // 2. Load CSS Khusus Admin (untuk Fullscreen / Immersive Mode)
        wp_enqueue_style(
            'umroh-manager-admin-css',
            UMH_PLUGIN_URL . 'assets/css/admin-style.css',
            array(),
            UMH_VERSION
        );

        // 3. Load JavaScript React App
        wp_enqueue_script(
            'umroh-manager-app',
            UMH_PLUGIN_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true // Load di footer
        );

        // 4. PENTING: Localize Script (Inject Data Server ke JS)
        // Ini solusi untuk error 403 Forbidden dan endpoint detection
        wp_localize_script('umroh-manager-app', 'umh_api_settings', array(
            'root'        => esc_url_raw(rest_url('umh/v1')),
            'nonce'       => wp_create_nonce('wp_rest'), // Nonce 'wp_rest' adalah standar WP API
            'user_id'     => get_current_user_id(),
            'user_roles'  => wp_get_current_user()->roles,
            'plugin_url'  => UMH_PLUGIN_URL,
            'site_name'   => get_bloginfo('name'),
            'date_format' => get_option('date_format'),
            'time_format' => get_option('time_format')
        ));
    }

    /**
     * Initialize REST API
     * Memanggil loader yang akan me-register semua route (/jamaah, /bookings, dll)
     */
    public function init_rest_api() {
        if (class_exists('UMH_API_Loader')) {
            $api_loader = new UMH_API_Loader();
            $api_loader->register_routes();
        }
    }

    /**
     * Handle CORS Headers
     * Diperlukan jika API diakses dari domain berbeda (misal development localhost:3000)
     */
    public function handle_cors() {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, X-WP-Nonce");
        
        if ('OPTIONS' == $_SERVER['REQUEST_METHOD']) {
            status_header(200);
            exit();
        }
    }

    /**
     * Plugin Activation Hook
     * Membuat tabel database saat plugin diaktifkan
     */
    public static function activate() {
        // Panggil fungsi create_tables dari includes/db-schema.php
        if (function_exists('umh_create_tables')) {
            umh_create_tables();
        }
        
        // Flush rewrite rules untuk memastikan API endpoint terbaca
        flush_rewrite_rules();
    }

    /**
     * Plugin Deactivation Hook
     */
    public static function deactivate() {
        flush_rewrite_rules();
    }
}

// Inisialisasi Plugin
if (class_exists('Umroh_Manager_Hybrid')) {
    // Register Hooks Aktivasi/Deaktivasi
    register_activation_hook(__FILE__, array('Umroh_Manager_Hybrid', 'activate'));
    register_deactivation_hook(__FILE__, array('Umroh_Manager_Hybrid', 'deactivate'));

    // Jalankan Instance
    Umroh_Manager_Hybrid::get_instance();
}