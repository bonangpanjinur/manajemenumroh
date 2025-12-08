<?php
/**
 * UMH API Loader - FIX 500 ERROR
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Loader {

    public function register_routes() {
        // Daftar modul API
        $api_modules = [
            'agents', 'badal', 'bookings', 'departures', 'export', 
            'finance', 'hr', 'jamaah', 'logistics', 'logs', 
            'manasik', 'marketing', 'masters', 'mutawwif', 
            'package-categories', 'packages', 'private', 
            'roles', 'savings', 'stats', 'support', 
            'tasks', 'uploads', 'users', 'utilities'
        ];

        foreach ($api_modules as $module) {
            $file_path = UMH_PLUGIN_DIR . 'includes/api/api-' . $module . '.php';
            
            // Cek file sebelum require untuk mencegah Error 500 Fatal
            if (file_exists($file_path)) {
                try {
                    require_once $file_path;
                } catch (Exception $e) {
                    error_log("Gagal memuat API Module: $module - " . $e->getMessage());
                }
            } else {
                error_log("API Module hilang: $file_path");
            }
        }
    }

    public static function permission_check($request = null) {
        // DEBUG: Aktifkan jika masih 403 terus
        // return true; 

        if (!is_user_logged_in()) {
            return new WP_Error('rest_forbidden', 'Login required', array('status' => 401));
        }
        return true; // Izinkan semua user login akses sementara (untuk debugging)
    }
}