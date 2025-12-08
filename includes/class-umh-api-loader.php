<?php
/**
 * File: includes/class-umh-api-loader.php
 * Deskripsi: Class sentral untuk memuat semua endpoint API
 * Update: Menambahkan controller untuk fitur baru (Mutawwif, Badal, Manasik, dll)
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Loader {

    public function init() {
        add_action('rest_api_init', array($this, 'register_all_routes'));
    }

    public function register_all_routes() {
        // Daftar file API dan Nama Class-nya
        // Format: 'nama-file-tanpa-ext' => 'Nama_Class'
        $controllers = array(
            // --- Core Modules ---
            'api-masters'            => 'UMH_API_Masters',
            'api-users'              => 'UMH_API_Users',
            'api-roles'              => 'UMH_API_Roles',
            'api-uploads'            => 'UMH_API_Uploads',
            'api-stats'              => 'UMH_API_Stats',
            'api-logs'               => 'UMH_API_Logs',
            'api-export'             => 'UMH_API_Export',
            'api-utilities'          => 'UMH_API_Utilities', // NEW: Bank, Addons, Templates
            
            // --- Products & Packages ---
            'api-packages'           => 'UMH_API_Packages',
            'api-package-categories' => 'UMH_API_PackageCategories',
            'api-departures'         => 'UMH_API_Departures',
            
            // --- Transactions ---
            'api-bookings'           => 'UMH_API_Bookings',
            'api-jamaah'             => 'UMH_API_Jamaah',
            'api-finance'            => 'UMH_API_Finance',
            
            // --- Operational ---
            'api-logistics'          => 'UMH_API_Logistics',
            'api-tasks'              => 'UMH_API_Tasks',
            'api-visa'               => 'UMH_API_Visa',      // NEW: Visa Batching
            
            // --- HR & Agents ---
            'api-hr'                 => 'UMH_API_HR',
            'api-agents'             => 'UMH_API_Agents',
            'api-marketing'          => 'UMH_API_Marketing',

            // --- FITUR BARU (New Features) ---
            'api-private'            => 'UMH_API_Private',   // Private Umrah
            'api-savings'            => 'UMH_API_Savings',   // Tabungan Umrah
            'api-mutawwif'           => 'UMH_API_Mutawwif',  // NEW: Manajemen Mutawwif
            'api-badal'              => 'UMH_API_Badal',     // NEW: Badal Umrah
            'api-manasik'            => 'UMH_API_Manasik',   // NEW: Jadwal & Absen Manasik
            'api-support'            => 'UMH_API_Support',   // NEW: Tiket Bantuan
            'api-reviews'            => 'UMH_API_Reviews',   // NEW: Testimoni
        );

        foreach ($controllers as $file => $class) {
            $file_path = plugin_dir_path(__FILE__) . 'api/' . $file . '.php';
            
            // Cek apakah file ada sebelum di-load (Mencegah error jika file belum dibuat)
            if (file_exists($file_path)) {
                require_once $file_path;
                
                if (class_exists($class)) {
                    $controller_instance = new $class();
                    if (method_exists($controller_instance, 'register_routes')) {
                        $controller_instance->register_routes();
                    }
                }
            }
        }
    }
}