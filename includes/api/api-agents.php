<?php
defined('ABSPATH') || exit;

class UMH_API_Agents {
    public function register_routes() {
        register_rest_route('umh/v1', '/agents', [
            'methods' => ['GET', 'POST'],
            'callback' => [$this, 'handle_agents'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);
        register_rest_route('umh/v1', '/agents/(?P<id>\d+)', [
            'methods' => ['PUT', 'DELETE'],
            'callback' => [$this, 'handle_single_agent'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);
    }

    public function handle_agents($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_agents';

        if ($request->get_method() === 'POST') {
            $data = $request->get_json_params();
            
            // Data Lengkap Sesuai DB Schema
            $insert_data = [
                'name' => sanitize_text_field($data['name']),
                'email' => sanitize_email($data['email']),
                'phone' => sanitize_text_field($data['phone']),
                'city' => sanitize_text_field($data['city']),
                'type' => sanitize_text_field($data['type']),
                'agency_name' => sanitize_text_field($data['agency_name'] ?? ''),
                'bank_name' => sanitize_text_field($data['bank_name'] ?? ''),
                'bank_account_number' => sanitize_text_field($data['bank_account_number'] ?? ''),
                'bank_account_holder' => sanitize_text_field($data['bank_account_holder'] ?? ''),
                'status' => 'active',
                'joined_at' => current_time('mysql')
            ];

            $wpdb->insert($table, $insert_data);
            return ['id' => $wpdb->insert_id, 'message' => 'Agent Created'];
        }

        // GET
        $items = $wpdb->get_results("SELECT * FROM $table ORDER BY created_at DESC");
        return ['items' => $items];
    }

    public function handle_single_agent($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_agents';
        $id = $request['id'];

        if ($request->get_method() === 'DELETE') {
            $wpdb->delete($table, ['id' => $id]);
            return ['success' => true];
        }

        if ($request->get_method() === 'PUT') {
            $data = $request->get_json_params();
            // Cleanup ID
            unset($data['id'], $data['created_at']);
            $wpdb->update($table, $data, ['id' => $id]);
            return ['success' => true];
        }
    }
}