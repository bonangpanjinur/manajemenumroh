<?php
/**
 * API Controller: Support Tickets (Bantuan)
 * Endpoint Base: /wp-json/umh/v1/support
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Support {

    public function register_routes() {
        // 1. Get Tickets (User lihat tiket dia, Admin lihat semua)
        register_rest_route('umh/v1', '/support/tickets', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_tickets'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // 2. Create Ticket
        register_rest_route('umh/v1', '/support/ticket', array(
            'methods' => 'POST',
            'callback' => array($this, 'create_ticket'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // 3. Get Ticket Detail & Messages
        register_rest_route('umh/v1', '/support/ticket/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_ticket_detail'),
            'permission_callback' => array($this, 'permissions_check'),
        ));

        // 4. Reply / Send Message
        register_rest_route('umh/v1', '/support/reply', array(
            'methods' => 'POST',
            'callback' => array($this, 'send_reply'),
            'permission_callback' => array($this, 'permissions_check'),
        ));
    }

    public function get_tickets($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_support_tickets';
        $user_id = get_current_user_id();
        $is_admin = current_user_can('manage_options');

        $sql = "SELECT * FROM $table";
        if (!$is_admin) {
            $sql .= " WHERE user_id = $user_id";
        }
        $sql .= " ORDER BY updated_at DESC";

        return rest_ensure_response($wpdb->get_results($sql));
    }

    public function create_ticket($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_support_tickets';
        $params = $request->get_json_params();

        $data = array(
            'user_id' => get_current_user_id(),
            'subject' => sanitize_text_field($params['subject']),
            'category' => isset($params['category']) ? $params['category'] : 'General',
            'priority' => isset($params['priority']) ? $params['priority'] : 'Medium',
            'status' => 'Open',
            'booking_id' => !empty($params['booking_id']) ? $params['booking_id'] : NULL
        );

        $wpdb->insert($table, $data);
        $ticket_id = $wpdb->insert_id;

        // Auto create first message if content provided
        if ($ticket_id && !empty($params['message'])) {
            $table_msg = $wpdb->prefix . 'umh_support_messages';
            $wpdb->insert($table_msg, array(
                'ticket_id' => $ticket_id,
                'sender_id' => get_current_user_id(),
                'sender_type' => 'User',
                'message' => sanitize_textarea_field($params['message'])
            ));
        }

        return rest_ensure_response(array('success' => true, 'id' => $ticket_id, 'message' => 'Tiket bantuan dibuat'));
    }

    public function get_ticket_detail($request) {
        global $wpdb;
        $ticket_id = $request['id'];
        $table_ticket = $wpdb->prefix . 'umh_support_tickets';
        $table_msg = $wpdb->prefix . 'umh_support_messages';

        $ticket = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_ticket WHERE id = %d", $ticket_id));
        
        if (!$ticket) return new WP_Error('not_found', 'Tiket tidak ditemukan', array('status' => 404));

        // Security
        if ($ticket->user_id != get_current_user_id() && !current_user_can('manage_options')) {
            return new WP_Error('forbidden', 'Akses Ditolak', array('status' => 403));
        }

        // Get Messages
        $messages = $wpdb->get_results($wpdb->prepare(
            "SELECT m.*, u.display_name as sender_name 
             FROM $table_msg m 
             LEFT JOIN {$wpdb->prefix}users u ON m.sender_id = u.ID 
             WHERE ticket_id = %d ORDER BY created_at ASC", 
            $ticket_id
        ));

        return rest_ensure_response(array('ticket' => $ticket, 'messages' => $messages));
    }

    public function send_reply($request) {
        global $wpdb;
        $table_msg = $wpdb->prefix . 'umh_support_messages';
        $table_ticket = $wpdb->prefix . 'umh_support_tickets';
        $params = $request->get_json_params();

        if (empty($params['ticket_id']) || empty($params['message'])) {
            return new WP_Error('missing_data', 'Pesan tidak boleh kosong', array('status' => 400));
        }

        $is_admin = current_user_can('manage_options');
        $sender_type = $is_admin ? 'Staff' : 'User';

        // Insert Message
        $wpdb->insert($table_msg, array(
            'ticket_id' => $params['ticket_id'],
            'sender_id' => get_current_user_id(),
            'sender_type' => $sender_type,
            'message' => sanitize_textarea_field($params['message']),
            'attachment_url' => isset($params['attachment_url']) ? $params['attachment_url'] : NULL
        ));

        // Update Ticket Status & Timestamp
        $new_status = $is_admin ? 'Resolved' : 'In Progress'; // Default logic simple
        if (isset($params['status'])) $new_status = $params['status']; // Override if provided

        $wpdb->update($table_ticket, 
            array('status' => $new_status, 'updated_at' => current_time('mysql')), 
            array('id' => $params['ticket_id'])
        );

        return rest_ensure_response(array('success' => true, 'message' => 'Pesan terkirim'));
    }

    public function permissions_check() {
        return is_user_logged_in();
    }
}