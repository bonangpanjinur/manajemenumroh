<?php
// includes/api/api-uploads.php

defined('ABSPATH') || exit;

class UMH_API_Uploads {
    public function register_routes() {
        register_rest_route('umh/v1', '/upload', [
            'methods' => 'POST',
            'callback' => [$this, 'handle_upload'],
            'permission_callback' => function() { return current_user_can('upload_files'); }
        ]);
    }

    public function handle_upload($request) {
        $files = $request->get_file_params();
        
        if (empty($files['file'])) {
            return new WP_Error('no_file', 'No file uploaded', ['status' => 400]);
        }

        $file = $files['file'];
        
        // Gunakan fungsi native WordPress untuk handle upload
        if (!function_exists('wp_handle_upload')) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
        }

        $upload_overrides = ['test_form' => false];
        $movefile = wp_handle_upload($file, $upload_overrides);

        if ($movefile && !isset($movefile['error'])) {
            return rest_ensure_response([
                'url' => $movefile['url'],
                'file' => $movefile['file'],
                'type' => $movefile['type']
            ]);
        } else {
            return new WP_Error('upload_error', $movefile['error'], ['status' => 500]);
        }
    }
}