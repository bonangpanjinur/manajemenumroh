<?php
/**
 * API Handler untuk Upload File
 * Menyimpan file ke wp-content/uploads/umh-files/
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Uploads {

    public function register_routes() {
        register_rest_route('umh/v1', '/upload', [
            'methods' => 'POST', 
            'callback' => [$this, 'handle_upload'], 
            'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('upload_files'); // WP Capability standard
    }

    public function handle_upload($request) {
        $files = $request->get_file_params();
        
        if (empty($files['file'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'No file uploaded'], 400);
        }

        $file = $files['file'];
        
        // Gunakan fungsi WP untuk handle upload agar aman
        // Perlu include file.php jika di context REST API
        if (!function_exists('wp_handle_upload')) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
        }

        $upload_overrides = ['test_form' => false];
        $movefile = wp_handle_upload($file, $upload_overrides);

        if ($movefile && !isset($movefile['error'])) {
            return new WP_REST_Response([
                'success' => true,
                'url' => $movefile['url'],
                'file' => $movefile['file']
            ], 201);
        } else {
            return new WP_REST_Response([
                'success' => false, 
                'message' => $movefile['error']
            ], 500);
        }
    }
}