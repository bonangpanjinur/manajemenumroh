<?php
if (!defined('ABSPATH')) { exit; }

class UMH_Packages_API {
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes() {
        $namespace = 'umh/v1';
        register_rest_route($namespace, '/packages', [
            'methods' => ['GET', 'POST'],
            'callback' => [$this, 'handle_packages'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);
        
        register_rest_route($namespace, '/packages/(?P<id>\d+)', [
            'methods' => ['GET', 'PUT', 'DELETE'],
            'callback' => [$this, 'handle_single_package'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);
    }

    public function handle_packages($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';

        if ($request->get_method() === 'GET') {
            // Join dengan Category dan Airline
            $results = $wpdb->get_results("
                SELECT p.*, c.name as category_name, f.name as airline_name 
                FROM $table p
                LEFT JOIN {$wpdb->prefix}umh_package_categories c ON p.category_id = c.id
                LEFT JOIN {$wpdb->prefix}umh_flights f ON p.airline_id = f.id
                ORDER BY p.created_at DESC
            ");
            return rest_ensure_response($results);
        }

        if ($request->get_method() === 'POST') {
            $data = $request->get_json_params();
            
            // 1. Insert Paket Dasar
            $wpdb->insert($table, [
                'name' => sanitize_text_field($data['name']),
                'category_id' => intval($data['category_id']),
                'airline_id' => intval($data['airline_id']),
                'duration' => intval($data['duration']),
                'description' => wp_kses_post($data['description']),
                'itinerary_type' => $data['itinerary_type'],
                'itinerary_content' => wp_kses_post($data['itinerary_content']),
                'status' => 'active'
            ]);
            $package_id = $wpdb->insert_id;

            // 2. Insert Relasi Hotel (Dynamic)
            if (!empty($data['hotels']) && is_array($data['hotels'])) {
                foreach ($data['hotels'] as $hotel) {
                    $wpdb->insert($wpdb->prefix . 'umh_package_hotels', [
                        'package_id' => $package_id,
                        'hotel_id' => intval($hotel['id']),
                        'city_type' => sanitize_text_field($hotel['city']), // makkah/madinah
                        'nights' => intval($hotel['nights'])
                    ]);
                }
            }

            return rest_ensure_response(['success' => true, 'id' => $package_id]);
        }
    }

    public function handle_single_package($request) {
        global $wpdb;
        $id = $request['id'];
        $table = $wpdb->prefix . 'umh_packages';

        if ($request->get_method() === 'DELETE') {
            $wpdb->delete($table, ['id' => $id]);
            $wpdb->delete($wpdb->prefix . 'umh_package_hotels', ['package_id' => $id]);
            return rest_ensure_response(['success' => true]);
        }

        if ($request->get_method() === 'GET') {
            $package = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id));
            // Fetch Hotels
            $hotels = $wpdb->get_results($wpdb->prepare("
                SELECT ph.*, h.name as hotel_name 
                FROM {$wpdb->prefix}umh_package_hotels ph
                JOIN {$wpdb->prefix}umh_hotels h ON ph.hotel_id = h.id
                WHERE ph.package_id = %d
            ", $id));
            
            $package->hotels = $hotels;
            return rest_ensure_response($package);
        }
    }
}

new UMH_Packages_API();