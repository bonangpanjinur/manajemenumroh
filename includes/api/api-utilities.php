<?php
/**
 * API Controller: Utilities (Bank, Addons, Templates)
 * Endpoint Base: /wp-json/umh/v1/utils
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Utilities {

    public function register_routes() {
        // --- BANK ACCOUNTS ---
        register_rest_route('umh/v1', '/utils/banks', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_banks'),
            'permission_callback' => '__return_true', // Public untuk halaman pembayaran
        ));
        
        register_rest_route('umh/v1', '/utils/banks', array(
            'methods' => 'POST',
            'callback' => array($this, 'save_bank'),
            'permission_callback' => array($this, 'admin_permissions_check'),
        ));

        // --- BOOKING ADDONS ---
        register_rest_route('umh/v1', '/utils/addons/(?P<booking_id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_addons'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        register_rest_route('umh/v1', '/utils/addons', array(
            'methods' => 'POST',
            'callback' => array($this, 'add_addon'),
            'permission_callback' => array($this, 'admin_permissions_check'),
        ));

        // --- NOTIFICATION TEMPLATES ---
        register_rest_route('umh/v1', '/utils/templates', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_templates'),
            'permission_callback' => array($this, 'admin_permissions_check'),
        ));
    }

    // --- BANK LOGIC ---
    public function get_banks($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_master_bank_accounts';
        return rest_ensure_response($wpdb->get_results("SELECT * FROM $table WHERE is_active = 1"));
    }

    public function save_bank($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_master_bank_accounts';
        $params = $request->get_json_params();
        
        // Simple insert logic
        $wpdb->insert($table, array(
            'bank_name' => $params['bank_name'],
            'account_number' => $params['account_number'],
            'account_holder' => $params['account_holder'],
            'is_primary' => isset($params['is_primary']) ? $params['is_primary'] : 0
        ));
        
        return rest_ensure_response(array('success' => true));
    }

    // --- ADDONS LOGIC ---
    public function get_addons($request) {
        global $wpdb;
        $id = $request['booking_id'];
        $table = $wpdb->prefix . 'umh_booking_addons';
        return rest_ensure_response($wpdb->get_results($wpdb->prepare("SELECT * FROM $table WHERE booking_id = %d", $id)));
    }

    public function add_addon($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_booking_addons';
        $params = $request->get_json_params();
        
        $price = floatval($params['price']);
        $qty = intval($params['qty']);
        $total = $price * $qty;

        $wpdb->insert($table, array(
            'booking_id' => $params['booking_id'],
            'addon_name' => $params['addon_name'],
            'price' => $price,
            'qty' => $qty,
            'total' => $total,
            'notes' => isset($params['notes']) ? $params['notes'] : ''
        ));

        return rest_ensure_response(array('success' => true));
    }

    // --- TEMPLATE LOGIC ---
    public function get_templates($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_notification_templates';
        return rest_ensure_response($wpdb->get_results("SELECT * FROM $table"));
    }

    public function permissions_check() {
        return is_user_logged_in();
    }
    public function admin_permissions_check() {
        return current_user_can('manage_options');
    }
}