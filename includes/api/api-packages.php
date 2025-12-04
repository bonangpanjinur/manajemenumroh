<?php
/**
 * API Handler untuk Manajemen Paket (Header + Itinerary + Facilities)
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Packages {
    private $table_pkg;
    private $table_itin;
    private $table_fac;

    public function __construct() {
        global $wpdb;
        $this->table_pkg = $wpdb->prefix . 'umh_packages';
        $this->table_itin = $wpdb->prefix . 'umh_package_itineraries';
        $this->table_fac = $wpdb->prefix . 'umh_package_facilities';
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/packages', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_items'],
                'permission_callback' => [$this, 'check_permission']
            ],
            [
                'methods' => 'POST',
                'callback' => [$this, 'create_item'],
                'permission_callback' => [$this, 'check_permission']
            ]
        ]);

        register_rest_route('umh/v1', '/packages/(?P<id>\d+)', [
            [
                'methods' => 'GET',
                'callback' => [$this, 'get_item'],
                'permission_callback' => [$this, 'check_permission']
            ],
            [
                'methods' => 'PUT',
                'callback' => [$this, 'update_item'],
                'permission_callback' => [$this, 'check_permission']
            ],
            [
                'methods' => 'DELETE',
                'callback' => [$this, 'delete_item'],
                'permission_callback' => [$this, 'check_permission']
            ]
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    // GET ALL (Header Only for listing)
    public function get_items($request) {
        global $wpdb;
        $items = $wpdb->get_results("SELECT * FROM {$this->table_pkg} ORDER BY created_at DESC");
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    // GET SINGLE (Include Itinerary & Facilities)
    public function get_item($request) {
        global $wpdb;
        $id = $request->get_param('id');
        
        $package = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_pkg} WHERE id = %d", $id));
        if (!$package) return new WP_REST_Response(['success' => false, 'message' => 'Not found'], 404);

        // Fetch Detail
        $package->itinerary = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$this->table_itin} WHERE package_id = %d ORDER BY day_number ASC", $id));
        $package->facilities = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$this->table_fac} WHERE package_id = %d", $id));

        return new WP_REST_Response(['success' => true, 'data' => $package], 200);
    }

    // CREATE (Complex Transaction)
    public function create_item($request) {
        global $wpdb;
        $params = $request->get_json_params();

        // 1. Insert Header Paket
        $data_pkg = [
            'category_id' => $params['category_id'],
            'name' => sanitize_text_field($params['name']),
            'slug' => sanitize_title($params['name']),
            'description' => wp_kses_post($params['description']), // Allow HTML basic
            'duration_days' => intval($params['duration_days']),
            'currency' => sanitize_text_field($params['currency'] ?? 'IDR'),
            'base_price_quad' => floatval($params['base_price_quad']),
            'base_price_triple' => floatval($params['base_price_triple']),
            'base_price_double' => floatval($params['base_price_double']),
            'hotel_makkah_id' => isset($params['hotel_makkah_id']) ? intval($params['hotel_makkah_id']) : null,
            'hotel_madinah_id' => isset($params['hotel_madinah_id']) ? intval($params['hotel_madinah_id']) : null,
            'airline_id' => isset($params['airline_id']) ? intval($params['airline_id']) : null,
            'status' => 'draft'
        ];

        $wpdb->insert($this->table_pkg, $data_pkg);
        $pkg_id = $wpdb->insert_id;

        if (!$pkg_id) {
            return new WP_REST_Response(['success' => false, 'message' => 'Gagal membuat paket header'], 500);
        }

        // 2. Insert Itinerary (Looping)
        if (!empty($params['itinerary']) && is_array($params['itinerary'])) {
            foreach ($params['itinerary'] as $day) {
                $wpdb->insert($this->table_itin, [
                    'package_id' => $pkg_id,
                    'day_number' => intval($day['day_number']),
                    'title' => sanitize_text_field($day['title']),
                    'description' => sanitize_textarea_field($day['description']),
                    'meals' => sanitize_text_field($day['meals'] ?? '')
                ]);
            }
        }

        // 3. Insert Facilities
        if (!empty($params['facilities']) && is_array($params['facilities'])) {
            foreach ($params['facilities'] as $fac) {
                $wpdb->insert($this->table_fac, [
                    'package_id' => $pkg_id,
                    'item_name' => sanitize_text_field($fac['item_name']),
                    'type' => in_array($fac['type'], ['include', 'exclude']) ? $fac['type'] : 'include'
                ]);
            }
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Paket berhasil dibuat', 'id' => $pkg_id], 201);
    }
    
    // UPDATE
    public function update_item($request) {
        // Logic Update mirip Create: Update Header -> Delete old Itinerary -> Insert new Itinerary
        // Implementasikan sesuai logika Anda nanti
        return new WP_REST_Response(['success' => true, 'message' => 'Update endpoint ready (logic pending)'], 200);
    }
    
    public function delete_item($request) {
        global $wpdb;
        $id = $request->get_param('id');
        // Delete childs first
        $wpdb->delete($this->table_itin, ['package_id' => $id]);
        $wpdb->delete($this->table_fac, ['package_id' => $id]);
        $wpdb->delete($this->table_pkg, ['id' => $id]);
        
        return new WP_REST_Response(['success' => true, 'message' => 'Paket dihapus'], 200);
    }
}