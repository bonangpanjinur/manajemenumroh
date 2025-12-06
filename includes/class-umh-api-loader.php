<?php
/**
 * File: includes/class-umh-api-loader.php
 * Deskripsi: Loader utama untuk memuat dan menginisialisasi semua endpoint REST API.
 */

if (!defined('ABSPATH')) {
    exit;
}

// 1. Load Semua File Class API
require_once UMH_PLUGIN_DIR . 'includes/api/api-masters.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-packages.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-jamaah.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-agents.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-bookings.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-departures.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-users.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-roles.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-marketing.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-leads.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-tasks.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-finance.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-accounting.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-hr.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-logistics.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-uploads.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-stats.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-package-categories.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-rooming.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-logs.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-export.php';

// 2. Load Modul Tambahan (Fitur Baru)
require_once UMH_PLUGIN_DIR . 'includes/api/api-savings.php';   // Fitur Tabungan Umroh
require_once UMH_PLUGIN_DIR . 'includes/api/api-documents.php'; // Generator Dokumen (Kwitansi/Surat)
require_once UMH_PLUGIN_DIR . 'includes/api/api-auth.php';      // Auth Headless (Login/Logout Frontend)

// 3. Load Frontend Controller
require_once UMH_PLUGIN_DIR . 'includes/class-umh-frontend.php'; // Shortcode [umroh_app]

class UMH_API_Loader {

    public function init() {
        // --- Inisialisasi Modul Master Data & Operasional ---
        
        $api_masters = new UMH_API_Masters();
        $api_masters->register_routes();

        $api_packages = new UMH_API_Packages();
        $api_packages->register_routes();

        $api_package_categories = new UMH_API_PackageCategories();
        $api_package_categories->register_routes();

        $api_jamaah = new UMH_API_Jamaah();
        $api_jamaah->register_routes();

        $api_agents = new UMH_API_Agents();
        $api_agents->register_routes();

        $api_bookings = new UMH_API_Bookings();
        $api_bookings->register_routes();

        $api_departures = new UMH_API_Departures();
        $api_departures->register_routes();
        
        // --- Inisialisasi Modul Manajemen User & HR ---

        $api_users = new UMH_API_Users();
        $api_users->register_routes();

        $api_roles = new UMH_API_Roles();
        $api_roles->register_routes();

        $api_hr = new UMH_API_HR();
        $api_hr->register_routes();

        // --- Inisialisasi Modul Marketing & CRM ---

        $api_marketing = new UMH_API_Marketing();
        $api_marketing->register_routes();

        $api_leads = new UMH_API_Leads();
        $api_leads->register_routes();
        
        $api_tasks = new UMH_API_Tasks();
        $api_tasks->register_routes();

        // --- Inisialisasi Modul Keuangan & Akuntansi ---

        $api_finance = new UMH_API_Finance();
        $api_finance->register_routes();

        $api_accounting = new UMH_API_Accounting();
        $api_accounting->register_routes();

        // --- Inisialisasi Modul Logistik & Utilitas ---

        $api_logistics = new UMH_API_Logistics();
        $api_logistics->register_routes();

        $api_uploads = new UMH_API_Uploads();
        $api_uploads->register_routes();

        $api_stats = new UMH_API_Stats();
        $api_stats->register_routes();

        $api_rooming = new UMH_API_Rooming();
        $api_rooming->register_routes();

        $api_logs = new UMH_API_Logs();
        $api_logs->register_routes();

        $api_export = new UMH_API_Export();
        $api_export->register_routes();
        
        // --- Inisialisasi Fitur Khusus (New Features) ---

        $api_savings = new UMH_API_Savings();
        $api_savings->register_routes();

        $api_documents = new UMH_API_Documents();
        $api_documents->register_routes();

        // --- Inisialisasi Auth Headless ---
        
        $api_auth = new UMH_API_Auth();
        $api_auth->register_routes();

        // --- Inisialisasi Frontend App (Shortcode) ---
        
        $frontend = new UMH_Frontend();
        $frontend->init();
    }
}