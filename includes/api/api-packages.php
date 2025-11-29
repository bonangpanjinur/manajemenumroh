<?php
if (!defined('ABSPATH')) { exit; }

// Pastikan utils dimuat untuk permission check
$utils_path = plugin_dir_path(__FILE__) . '../utils.php';
if (file_exists($utils_path)) require_once $utils_path;

class UMH_Packages_API {
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    public function register_routes() {
        $namespace = 'umh/v1';
        
        // Menggunakan factory function untuk permission
        $permission = umh_check_api_permission(['owner', 'admin_staff', 'marketing_staff']);

        register_rest_route($namespace, '/packages', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'handle_packages_get'],
                'permission_callback' => '__return_true', // Public read allowed agar bisa dilihat di frontend
            ],
            [
                'methods' => 'POST',
                'callback' => [$this, 'handle_packages_create'],
                'permission_callback' => $permission
            ]
        ]);
        
        register_rest_route($namespace, '/packages/(?P<id>\d+)', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'handle_single_package'],
                'permission_callback' => '__return_true',
            ],
            [
                'methods' => 'POST', // Update pakai POST di REST API WP kadang lebih stabil
                'callback' => [$this, 'handle_packages_update'],
                'permission_callback' => $permission
            ],
            [
                'methods' => 'DELETE',
                'callback' => [$this, 'handle_packages_delete'],
                'permission_callback' => $permission
            ]
        ]);
    }

    public function handle_packages_get($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        
        // Join dengan Category dan Airline
        // Pastikan nama kolom di SELECT sesuai dengan yang ada di DB (base_price, duration_days)
        $results = $wpdb->get_results("
            SELECT p.*, 
                   c.name as category_name, 
                   f.name as airline_name 
            FROM $table p
            LEFT JOIN {$wpdb->prefix}umh_package_categories c ON p.category_id = c.id
            LEFT JOIN {$wpdb->prefix}umh_flights f ON p.airline_id = f.id
            WHERE p.status != 'archived'
            ORDER BY p.created_at DESC
        ");
        return rest_ensure_response($results);
    }

    public function handle_packages_create($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        $data = $request->get_json_params();
        
        // Sanitasi & Mapping Data Frontend ke Database
        $insert_data = [
            'name' => sanitize_text_field($data['name']),
            'category_id' => intval($data['category_id']),
            'airline_id' => intval($data['airline_id']),
            'hotel_makkah_id' => intval($data['hotel_makkah_id']),
            'hotel_madinah_id' => intval($data['hotel_madinah_id']),
            'duration_days' => intval($data['duration_days']), // Sesuai kolom DB baru
            'base_price' => floatval($data['base_price']),     // Sesuai kolom DB baru
            'description' => wp_kses_post($data['description'] ?? ''),
            'included_features' => wp_kses_post($data['included_features'] ?? ''),
            'excluded_features' => wp_kses_post($data['excluded_features'] ?? ''),
            'status' => 'active'
        ];

        $result = $wpdb->insert($table, $insert_data);

        if ($result === false) {
            return new WP_Error('db_insert_error', 'Gagal menyimpan paket: ' . $wpdb->last_error, ['status' => 500]);
        }
        
        $package_id = $wpdb->insert_id;
        return rest_ensure_response(['success' => true, 'id' => $package_id, 'message' => 'Paket berhasil dibuat']);
    }

    public function handle_packages_update($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        $id = $request['id'];
        $data = $request->get_json_params();

        $update_data = [
            'name' => sanitize_text_field($data['name']),
            'category_id' => intval($data['category_id']),
            'airline_id' => intval($data['airline_id']),
            'hotel_makkah_id' => intval($data['hotel_makkah_id']),
            'hotel_madinah_id' => intval($data['hotel_madinah_id']),
            'duration_days' => intval($data['duration_days']),
            'base_price' => floatval($data['base_price']),
            'description' => wp_kses_post($data['description'] ?? ''),
            'included_features' => wp_kses_post($data['included_features'] ?? ''),
            'excluded_features' => wp_kses_post($data['excluded_features'] ?? ''),
        ];

        $result = $wpdb->update($table, $update_data, ['id' => $id]);

        if ($result === false) {
            return new WP_Error('db_update_error', 'Gagal update paket', ['status' => 500]);
        }

        return rest_ensure_response(['success' => true, 'id' => $id]);
    }

    public function handle_packages_delete($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_packages';
        $id = $request['id'];

        // Soft delete (Ubah status jadi archived)
        $wpdb->update($table, ['status' => 'archived'], ['id' => $id]);
        
        return rest_ensure_response(['success' => true]);
    }

    public function handle_single_package($request) {
        global $wpdb;
        $id = $request['id'];
        $table = $wpdb->prefix . 'umh_packages';
        $package = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id));
        
        if (!$package) return new WP_Error('not_found', 'Paket tidak ditemukan', ['status' => 404]);
        
        return rest_ensure_response($package);
    }
}

new UMH_Packages_API();