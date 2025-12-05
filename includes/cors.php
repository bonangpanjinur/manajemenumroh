<?php
/**
 * Handle CORS and Header Pre-flight
 * Hooked to 'init' to prevent "Headers already sent" error.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Gunakan hook 'init' agar dijalankan sebelum output apapun
add_action( 'init', 'umh_send_cors_headers', 1 );

function umh_send_cors_headers() {
    // Allow from any origin
    if ( isset( $_SERVER['HTTP_ORIGIN'] ) ) {
        header( "Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}" );
        header( 'Access-Control-Allow-Credentials: true' );
        header( 'Access-Control-Max-Age: 86400' );    // cache for 1 day
    }

    // Access-Control headers are received during OPTIONS requests
    if ( isset( $_SERVER['REQUEST_METHOD'] ) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS' ) {
        if ( isset( $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'] ) )
            header( "Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH" );         

        if ( isset( $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'] ) )
            header( "Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}" );

        exit( 0 );
    }
}