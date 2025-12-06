<?php

class UMH_API_Uploads {

    public function register_routes() {
        register_rest_route('umh/v1', '/uploads', [
            ['methods' => 'POST', 'callback' => [$this, 'handle_upload'], 'permission_callback' => [$this, 'check_auth']],
        ]);
    }

    public function check_auth() { return is_user_logged_in(); }

    public function handle_upload($request) {
        if (empty($_FILES['file'])) {
            return new WP_Error('no_file', 'Tidak ada file yang diunggah', ['status' => 400]);
        }

        $file = $_FILES['file'];
        
        // 1. Security Check: File Type
        $allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!in_array($file['type'], $allowed_types)) {
            return new WP_Error('invalid_type', 'Hanya file JPG, PNG, dan PDF yang diperbolehkan', ['status' => 400]);
        }

        // 2. Security Check: Size (Max 2MB)
        if ($file['size'] > 2 * 1024 * 1024) {
            return new WP_Error('file_too_large', 'Ukuran file maksimal 2MB', ['status' => 400]);
        }

        // 3. WordPress Upload Process
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        
        $upload_overrides = ['test_form' => false];
        $movefile = wp_handle_upload($file, $upload_overrides);

        if ($movefile && !isset($movefile['error'])) {
            // Sukses
            return rest_ensure_response([
                'success' => true,
                'url' => $movefile['url'],
                'file' => $movefile['file'] // Path server (jangan expose ke frontend jika tidak perlu, cukup URL)
            ]);
        } else {
            return new WP_Error('upload_error', $movefile['error'], ['status' => 500]);
        }
    }
}