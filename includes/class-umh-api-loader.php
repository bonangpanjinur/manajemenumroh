<?php
/**
 * Class: UMH_API_Loader
 * Deskripsi: Memuat semua file API V4.0 dan mendaftarkan route
 * Update: Membersihkan referensi file lama yang sudah dihapus
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Loader {

    public function init() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes() {
        // 1. Load File Fisik
        $this->load_api_files();

        // 2. Inisialisasi Class API
        $apis = [
            new UMH_API_Masters(),            // Master Data (Hotel, Airline, Location)
            new UMH_API_Agents(),             // Agen & Kemitraan
            new UMH_API_Jamaah(),             // Data Jemaah (Profile Only)
            new UMH_API_Package_Categories(), // Kategori Paket Dinamis
            new UMH_API_Packages(),           // Paket (Header + Itinerary)
            new UMH_API_Departures(),         // Jadwal Keberangkatan
            new UMH_API_Bookings(),           // Booking Engine (Transaksi + Manifest)
            new UMH_API_Finance(),            // Keuangan & Validasi Pembayaran
            new UMH_API_HR(),                 // HRD & Absensi
            new UMH_API_Tasks(),              // Task Management
            new UMH_API_Logistics(),          // Logistik Inventory & Distribusi
            new UMH_API_Marketing(),          // CRM & Leads
            new UMH_API_Users(),              // Custom User Management
            new UMH_API_Roles(),              // Custom Roles
            new UMH_API_Uploads(),            // File Upload Handler
            new UMH_API_Export(),             // Export Data ke Excel
            new UMH_API_Logs(),               // Audit Trail / Log Aktivitas
            new UMH_API_Stats()               // Dashboard Statistics
        ];

        // 3. Register Route WordPress
        foreach ($apis as $api) {
            if (method_exists($api, 'register_routes')) {
                $api->register_routes();
            }
        }
    }

    private function load_api_files() {
        // Daftar File API V4.0 (Total 18 File)
        $files = [
            'api-masters.php',
            'api-agents.php',
            'api-jamaah.php',
            'api-package-categories.php',
            'api-packages.php',
            'api-departures.php',
            'api-bookings.php',
            'api-finance.php',
            'api-hr.php',
            'api-tasks.php',
            'api-logistics.php',
            'api-marketing.php',
            'api-users.php',
            'api-roles.php',
            'api-uploads.php',
            'api-export.php',
            'api-logs.php',
            'api-stats.php'
        ];

        foreach ($files as $file) {
            $path = plugin_dir_path(dirname(__FILE__)) . 'includes/api/' . $file;
            if (file_exists($path)) {
                require_once $path;
            } else {
                // Opsional: Log error jika file hilang agar tidak blank screen
                error_log("UMH Plugin Error: File API tidak ditemukan - " . $file);
            }
        }
    }
}