<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * UTILITIES & HELPER FUNCTIONS
 * ---------------------------------------
 * Kumpulan fungsi bantuan untuk autentikasi dan permission.
 */

if ( ! function_exists( 'umh_is_super_admin' ) ) {
    function umh_is_super_admin() {
        return current_user_can( 'manage_options' );
    }
}

if ( ! function_exists( 'umh_get_current_user_context' ) ) {
    /**
     * Mendapatkan konteks pengguna (Role & ID) baik dari Cookie WP atau Token.
     */
    function umh_get_current_user_context($request) {
        // 1. Cek Super Admin via Cookie WP (Login Biasa)
        $wp_user_id = get_current_user_id();
        if ( $wp_user_id !== 0 && current_user_can('manage_options') ) {
            return [
                'role'    => 'super_admin',
                'user_id' => $wp_user_id,
            ];
        }

        // 2. Cek Token di Header (Login via App/Frontend)
        $auth_header = $request->get_header('authorization');
        if (empty($auth_header)) {
            // Izinkan public access jika tidak ada header (nanti dicek di permission callback)
            return new WP_Error('rest_unauthorized', 'Authorization header missing.', ['status' => 401]);
        }
        
        $token = '';
        if (sscanf($auth_header, 'Bearer %s', $token) !== 1) {
             $token = $auth_header; // Fallback
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'umh_users';
        
        $user = $wpdb->get_row($wpdb->prepare(
            "SELECT id, role FROM $table_name WHERE auth_token = %s AND token_expires > %s",
            $token,
            current_time('mysql')
        ));

        if (!$user) {
             return new WP_Error('rest_invalid_token', 'Token expired or invalid.', ['status' => 403]);
        }

        return [
            'role'    => $user->role,
            'user_id' => $user->id,
        ];
    }
}

if ( ! function_exists( 'umh_check_api_permission' ) ) {
    /**
     * Factory Function untuk Permission Callback.
     * Mengembalikan fungsi closure yang valid untuk WP REST API.
     */
    function umh_check_api_permission( $allowed_roles = [] ) {
        
        return function(WP_REST_Request $request) use ($allowed_roles) {
            // 1. Dapatkan context user
            $context = umh_get_current_user_context($request);

            // Jika return WP_Error (token salah), kembalikan error tersebut
            if (is_wp_error($context)) {
                return $context;
            }

            $user_role = $context['role'];

            // 2. Super Admin & Administrator selalu boleh
            if ($user_role === 'super_admin' || $user_role === 'administrator') {
                return true;
            }

            // 3. Jika roles kosong, berarti public (asal login)
            if (empty($allowed_roles)) {
                return true;
            }

            // 4. Cek apakah role user ada di daftar yang diizinkan
            if (in_array($user_role, $allowed_roles, true)) {
                return true;
            }

            return new WP_Error(
                'rest_forbidden',
                'Anda tidak memiliki izin untuk mengakses data ini.',
                ['status' => 403]
            );
        };
    }
}

if ( ! function_exists( 'umh_format_currency' ) ) {
    function umh_format_currency( $amount ) {
        return 'Rp ' . number_format( (float)$amount, 0, ',', '.' );
    }
}