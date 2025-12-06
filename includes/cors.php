<?php
/**
 * Menangani header CORS untuk akses API dari Frontend (React/Mobile)
 */

function umh_cors_headers() {
    // Izinkan semua origin (untuk development). 
    // Saat production, ganti '*' dengan domain frontend anda, misal: 'https://app.travelumroh.com'
    header('Access-Control-Allow-Origin: *'); 
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, X-Requested-With');
    
    // Handle request OPTIONS (Preflight) agar tidak lanjut ke logika WordPress
    if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
        status_header(200);
        exit();
    }
}

// Pasang di init sedini mungkin
add_action('init', 'umh_cors_headers');

// Pastikan API merespons dengan JSON error yang benar jika unauthorized
add_filter('rest_authentication_errors', function ($result) {
    if (!empty($result)) {
        return $result;
    }
    if (!is_user_logged_in() && strpos($_SERVER['REQUEST_URI'], 'umh/v1') !== false) {
        // Kecuali endpoint public
        $public_endpoints = ['/packages', '/jamaah/register'];
        $is_public = false;
        foreach($public_endpoints as $ep) {
            if (strpos($_SERVER['REQUEST_URI'], $ep) !== false) $is_public = true;
        }

        if (!$is_public) {
            return new WP_Error('rest_not_logged_in', 'Anda tidak memiliki akses.', ['status' => 401]);
        }
    }
    return $result;
});