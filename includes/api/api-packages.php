<?php
defined('ABSPATH') || exit;

class UMH_API_Packages {
    public function register_routes() {
        register_rest_route('umh/v1', '/packages', [
            'methods' => ['GET', 'POST'],
            'callback' => [$this, 'handle_packages'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);
        register_rest_route('umh/v1', '/packages/(?P<id>\d+)', [
            'methods' => ['PUT', 'DELETE'],
            'callback' => [$this, 'handle_single'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);
    }

    public function handle_packages($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';

        if ($request->get_method() === 'POST') {
            $data = $request->get_json_params();
            $wpdb->insert($table, $data);
            return ['id' => $wpdb->insert_id];
        }

        // GET with JOIN Hotels
        $query = "SELECT p.*, 
                  h_makkah.name as hotel_makkah_name, 
                  h_madinah.name as hotel_madinah_name
                  FROM $table p
                  LEFT JOIN {$wpdb->prefix}umh_master_hotels h_makkah ON p.hotel_makkah_id = h_makkah.id
                  LEFT JOIN {$wpdb->prefix}umh_master_hotels h_madinah ON p.hotel_madinah_id = h_madinah.id
                  ORDER BY p.created_at DESC";

        $items = $wpdb->get_results($query);
        
        // Format response standard
        return ['items' => $items, 'totalItems' => count($items), 'page' => 1, 'totalPages' => 1];
    }

    public function handle_single($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        $id = $request['id'];

        if ($request->get_method() === 'DELETE') {
            $wpdb->delete($table, ['id' => $id]);
            return ['success' => true];
        }
        
        $data = $request->get_json_params();
        unset($data['id'], $data['hotel_makkah_name'], $data['hotel_madinah_name']);
        $wpdb->update($table, $data, ['id' => $id]);
        return ['success' => true];
    }
}