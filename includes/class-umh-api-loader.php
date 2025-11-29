<?php
if (!defined('ABSPATH')) {
    exit;
}

class UMH_Api_Loader {

    public function __construct() {
        $this->load_dependencies();
    }

    private function load_dependencies() {
        // 1. Load Controller Utama (Jantung CRUD)
        require_once UMH_PLUGIN_DIR . 'includes/class-umh-crud-controller.php';

        // 2. Load Module API Utama
        require_once UMH_PLUGIN_DIR . 'includes/api/api-stats.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-jamaah.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-packages.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-agents.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-finance.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-logistics.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-departures.php'; // <--- PASTIKAN INI ADA

        
        // 3. Load Module Tambahan (PERBAIKAN: Menambahkan modul yang hilang)
        require_once UMH_PLUGIN_DIR . 'includes/api/api-marketing.php'; // Fix: Menu Marketing
        require_once UMH_PLUGIN_DIR . 'includes/api/api-tasks.php';     // Fix: Menu Tasks
        require_once UMH_PLUGIN_DIR . 'includes/api/api-uploads.php';   // Fix: Upload File
        require_once UMH_PLUGIN_DIR . 'includes/api/api-print.php';     // Fix: Fitur Print
        
        // 4. Load Module HR & Admin
        require_once UMH_PLUGIN_DIR . 'includes/api/api-hr.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-users.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-roles.php';

        // 5. Load Master Data
        require_once UMH_PLUGIN_DIR . 'includes/api/api-hotels.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-flights.php';
        require_once UMH_PLUGIN_DIR . 'includes/api/api-package-categories.php';
        
        // 6. Booking Modules (Opsional jika file ada)
        if (file_exists(UMH_PLUGIN_DIR . 'includes/api/api-hotel-bookings.php')) {
            require_once UMH_PLUGIN_DIR . 'includes/api/api-hotel-bookings.php';
        }
        if (file_exists(UMH_PLUGIN_DIR . 'includes/api/api-flight-bookings.php')) {
            require_once UMH_PLUGIN_DIR . 'includes/api/api-flight-bookings.php';
        }
    }
}