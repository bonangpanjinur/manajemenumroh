<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Uploads extends UMH_CRUD_Controller {

    public function __construct() {
        // Tidak pakai tabel khusus, ini utility controller
        parent::__construct('posts'); 
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/upload', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_upload'],
            'permission_callback' => '__return_true', // Nanti amankan dengan nonce/auth
        ]);
    }

    public function handle_upload($request) {
        $files = $request->get_file_params();
        
        if (empty($files['file'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'No file uploaded'], 400);
        }

        $file = $files['file'];
        
        // Gunakan wp_handle_upload untuk memproses file
        if (!function_exists('wp_handle_upload')) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
        }

        $upload_overrides = array('test_form' => false);
        $movefile = wp_handle_upload($file, $upload_overrides);

        if ($movefile && !isset($movefile['error'])) {
            return new WP_REST_Response([
                'success' => true, 
                'url' => $movefile['url'], 
                'file' => $movefile['file']
            ], 201);
        } else {
            return new WP_REST_Response(['success' => false, 'message' => $movefile['error']], 500);
        }
    }
}