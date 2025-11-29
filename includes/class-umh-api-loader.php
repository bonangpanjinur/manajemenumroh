<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class UMH_Api_Loader
 * Bertugas memuat semua endpoint API REST
 */
class UMH_Api_Loader {

    /**
     * Mendaftarkan routes API.
     * Fungsi ini dipanggil di umroh-manager-hybrid.php
     */
    public function register_routes() {
        // Kita hook ke 'rest_api_init' agar API diload pada saat yang tepat
        add_action('rest_api_init', array($this, 'load_api_endpoints'));
    }

    /**
     * Memuat file-file API fisik
     */
    public function load_api_endpoints() {
        // 1. Load Base CRUD Controller terlebih dahulu (penting untuk inheritance)
        $crud_controller_path = UMH_PLUGIN_DIR . 'includes/class-umh-crud-controller.php';
        if (file_exists($crud_controller_path)) {
            require_once $crud_controller_path;
        }

        // 2. Daftar File API yang harus dimuat
        // Pastikan nama file sesuai dengan yang ada di folder includes/api/
        $api_files = array(
            'api-agents.php',
            'api-categories.php',
            'api-departures.php',
            'api-export.php',
            'api-finance.php',
            'api-flight-bookings.php',
            'api-flights.php',
            'api-hotel-bookings.php',
            'api-hotels.php',
            'api-hr.php',
            'api-jamaah.php',
            'api-logistics.php',
            'api-logs.php',
            'api-marketing.php',
            'api-masters.php',
            'api-package-categories.php',
            'api-packages.php',
            'api-payments.php',
            'api-print.php',
            'api-roles.php',
            'api-stats.php',
            'api-tasks.php',
            'api-uploads.php',
            'api-users.php'
        );

        // 3. Loop dan require setiap file
        foreach ($api_files as $file) {
            $path = UMH_PLUGIN_DIR . 'includes/api/' . $file;
            if (file_exists($path)) {
                require_once $path;
            } else {
                // Opsional: Log error jika file hilang
                error_log("UMH Error: File API tidak ditemukan - " . $file);
            }
        }
    }
}