<?php
/**
 * Class: UMH_Crud_Controller
 * Deskripsi: Controller dasar untuk operasi CRUD umum (opsional digunakan)
 * Helper methods untuk response format
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_Crud_Controller {

    // Helper untuk sukses response
    protected function success_response($data = [], $message = 'Success', $status = 200) {
        return new WP_REST_Response([
            'success' => true,
            'message' => $message,
            'data'    => $data
        ], $status);
    }

    // Helper untuk error response
    protected function error_response($message = 'Error', $status = 400, $code = 'error') {
        return new WP_REST_Response([
            'success' => false,
            'code'    => $code,
            'message' => $message
        ], $status);
    }

    // Helper untuk cek permission user (bisa disesuaikan dengan role custom)
    public function check_admin_permission() {
        return current_user_can('manage_options');
    }
    
    // Helper sanitasi array
    protected function sanitize_array($array) {
        $sanitized = [];
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $sanitized[$key] = $this->sanitize_array($value);
            } else {
                $sanitized[$key] = sanitize_text_field($value);
            }
        }
        return $sanitized;
    }
}