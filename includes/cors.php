<?php
/**
 * Handle CORS headers untuk API
 */

if (!defined('ABSPATH')) {
    exit;
}

function umh_handle_cors() {
    // Izinkan akses dari mana saja (atau batasi ke domain tertentu jika perlu)
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce");
    header("Access-Control-Allow-Credentials: true");

    if ('OPTIONS' === $_SERVER['REQUEST_METHOD']) {
        status_header(200);
        exit();
    }
}
add_action('init', 'umh_handle_cors');

// Tambahan untuk memastikan REST API WP juga support CORS
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
}, 15);