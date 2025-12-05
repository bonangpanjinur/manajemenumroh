<?php
defined('ABSPATH') || exit;

class UMH_API_Departures {
    public function register_routes() {
        register_rest_route('umh/v1', '/departures', [
            'methods' => ['GET', 'POST'],
            'callback' => [$this, 'handle_departures'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);
        
        register_rest_route('umh/v1', '/departures/(?P<id>\d+)', [
            'methods' => ['PUT', 'DELETE'],
            'callback' => [$this, 'handle_single'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);
    }

    public function handle_departures($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_departures';

        if ($request->get_method() === 'POST') {
            $data = $request->get_json_params();
            // Hitung available seats default = quota
            if (!isset($data['available_seats'])) {
                $data['available_seats'] = $data['quota'];
            }
            $wpdb->insert($table, $data);
            return ['id' => $wpdb->insert_id, 'message' => 'Created'];
        }

        // GET
        $status = isset($request['status']) ? sanitize_text_field($request['status']) : '';
        
        // JOIN untuk ambil nama Paket & Maskapai
        $query = "SELECT d.*, 
                  p.name as package_name, 
                  p.base_price_quad as price_quad, 
                  a.name as airline_name, a.code as airline_code
                  FROM $table d
                  LEFT JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
                  LEFT JOIN {$wpdb->prefix}umh_master_airlines a ON d.airline_id = a.id
                  WHERE 1=1";
        
        if ($status) {
            $query .= $wpdb->prepare(" AND d.status = %s", $status);
        }

        $query .= " ORDER BY d.departure_date ASC";
        
        return $wpdb->get_results($query);
    }

    public function handle_single($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_departures';
        $id = $request['id'];

        if ($request->get_method() === 'DELETE') {
            $wpdb->delete($table, ['id' => $id]);
            return ['success' => true];
        }

        if ($request->get_method() === 'PUT') {
            $data = $request->get_json_params();
            unset($data['id'], $data['package_name'], $data['airline_name'], $data['price_quad']);
            $wpdb->update($table, $data, ['id' => $id]);
            return ['success' => true];
        }
    }
}