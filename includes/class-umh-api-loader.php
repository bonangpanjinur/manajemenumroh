<?php
/**
 * Class UMH_API_Loader
 * Bertanggung jawab memuat semua endpoint API secara otomatis
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class UMH_API_Loader {

    public function init() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        $this->load_api_files();
    }

    /**
     * Memuat file API dari folder includes/api/
     */
    private function load_api_files() {
        // 1. PRIORITAS UTAMA: Muat Base Controller terlebih dahulu
        // Ini memperbaiki error "Class 'UMH_Crud_Controller' not found"
        $crud_controller_path = plugin_dir_path( __FILE__ ) . 'class-umh-crud-controller.php';
        
        if ( file_exists( $crud_controller_path ) ) {
            require_once $crud_controller_path;
        } else {
            error_log( 'UMH Error: class-umh-crud-controller.php tidak ditemukan di ' . $crud_controller_path );
            return; // Stop jika base class tidak ada
        }

        // 2. Baru muat file-file API spesifik
        $api_dir = plugin_dir_path( __FILE__ ) . 'api/';
        
        if ( is_dir( $api_dir ) ) {
            $files = scandir( $api_dir );
            
            foreach ( $files as $file ) {
                if ( pathinfo( $file, PATHINFO_EXTENSION ) === 'php' ) {
                    // Hindari memuat file index.php atau file hidden
                    if ( $file !== 'index.php' && $file[0] !== '.' ) {
                        require_once $api_dir . $file;
                    }
                }
            }
        }
    }
}