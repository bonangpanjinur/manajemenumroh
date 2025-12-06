<?php
// Require semua file API yang diperlukan
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
require_once UMH_PLUGIN_DIR . 'includes/api/api-savings.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-documents.php';
require_once UMH_PLUGIN_DIR . 'includes/api/api-auth.php'; 
require_once UMH_PLUGIN_DIR . 'includes/class-umh-frontend.php'; 

class UMH_API_Loader {
    public function init() {
        // Inisialisasi dan registrasi rute untuk setiap modul API
        
        $api_masters = new UMH_API_Masters();
        $api_masters->register_routes();

        $api_packages = new UMH_API_Packages();
        $api_packages->register_routes();

        $api_jamaah = new UMH_API_Jamaah();
        $api_jamaah->register_routes();

        $api_agents = new UMH_API_Agents();
        $api_agents->register_routes();

        $api_bookings = new UMH_API_Bookings();
        $api_bookings->register_routes();

        $api_departures = new UMH_API_Departures();
        $api_departures->register_routes();
        
        $api_users = new UMH_API_Users();
        $api_users->register_routes();

        $api_roles = new UMH_API_Roles();
        $api_roles->register_routes();

        $api_marketing = new UMH_API_Marketing();
        $api_marketing->register_routes();

        $api_leads = new UMH_API_Leads();
        $api_leads->register_routes();
        
        $api_tasks = new UMH_API_Tasks();
        $api_tasks->register_routes();

        $api_finance = new UMH_API_Finance();
        $api_finance->register_routes();

        $api_accounting = new UMH_API_Accounting();
        $api_accounting->register_routes();

        $api_hr = new UMH_API_HR();
        $api_hr->register_routes();

        $api_logistics = new UMH_API_Logistics();
        $api_logistics->register_routes();

        $api_uploads = new UMH_API_Uploads();
        $api_uploads->register_routes();

        $api_stats = new UMH_API_Stats();
        $api_stats->register_routes();

        $api_package_categories = new UMH_API_PackageCategories();
        $api_package_categories->register_routes();

        $api_rooming = new UMH_API_Rooming();
        $api_rooming->register_routes();

        $api_logs = new UMH_API_Logs();
        $api_logs->register_routes();

        $api_export = new UMH_API_Export();
        $api_export->register_routes();
        
        $api_savings = new UMH_API_Savings();
        $api_savings->register_routes();

        $api_documents = new UMH_API_Documents();
        $api_documents->register_routes();

        // Init Auth API untuk login headless
        $api_auth = new UMH_API_Auth();
        $api_auth->register_routes();

        // Init Frontend Shortcode & Assets
        $frontend = new UMH_Frontend();
        $frontend->init();
    }
}