<?php

class UMH_API_Masters {

    public function register_routes() {
        // --- MASTER DATA (Cities, Hotels, Airlines) ---
        register_rest_route('umh/v1', '/masters/cities', [
            ['methods' => 'GET', 'callback' => [$this, 'get_cities'], 'permission_callback' => '__return_true'], // Public untuk dropdown
            ['methods' => 'POST', 'callback' => [$this, 'create_city'], 'permission_callback' => [$this, 'check_admin']],
        ]);

        register_rest_route('umh/v1', '/masters/hotels', [
            ['methods' => 'GET', 'callback' => [$this, 'get_hotels'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_hotel'], 'permission_callback' => [$this, 'check_admin']],
        ]);

        register_rest_route('umh/v1', '/masters/airlines', [
            ['methods' => 'GET', 'callback' => [$this, 'get_airlines'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_airline'], 'permission_callback' => [$this, 'check_admin']],
        ]);

        // --- CMS CONTENT (Pages & Menus) ---
        register_rest_route('umh/v1', '/content/page', [
            ['methods' => 'GET', 'callback' => [$this, 'get_page_content'], 'permission_callback' => '__return_true'],
        ]);
        
        register_rest_route('umh/v1', '/content/menu', [
            ['methods' => 'GET', 'callback' => [$this, 'get_custom_menu'], 'permission_callback' => '__return_true'],
        ]);
    }

    public function check_admin() { return current_user_can('manage_options'); }

    // --- CITIES ---
    public function get_cities($request) {
        global $wpdb;
        $search = $request->get_param('search');
        $sql = "SELECT * FROM {$wpdb->prefix}umh_master_cities WHERE 1=1";
        if ($search) $sql .= $wpdb->prepare(" AND name LIKE %s", '%' . $wpdb->esc_like($search) . '%');
        $sql .= " ORDER BY name ASC LIMIT 100";
        return rest_ensure_response($wpdb->get_results($sql));
    }

    public function create_city($request) {
        global $wpdb;
        $params = $request->get_json_params();
        if (empty($params['name'])) return new WP_Error('missing_name', 'Nama kota wajib', ['status' => 400]);
        
        $wpdb->insert("{$wpdb->prefix}umh_master_cities", [
            'name' => sanitize_text_field($params['name']),
            'province' => sanitize_text_field($params['province'] ?? ''),
            'country' => sanitize_text_field($params['country'] ?? 'Indonesia')
        ]);
        return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id]);
    }

    // --- HOTELS ---
    public function get_hotels($request) {
        global $wpdb;
        $city_id = $request->get_param('city_id');
        $sql = "SELECT h.*, c.name as city_name FROM {$wpdb->prefix}umh_master_hotels h 
                LEFT JOIN {$wpdb->prefix}umh_master_cities c ON h.city_id = c.id WHERE 1=1";
        if ($city_id) $sql .= $wpdb->prepare(" AND h.city_id = %d", $city_id);
        $sql .= " ORDER BY h.name ASC";
        return rest_ensure_response($wpdb->get_results($sql));
    }

    public function create_hotel($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $wpdb->insert("{$wpdb->prefix}umh_master_hotels", [
            'uuid' => wp_generate_uuid4(),
            'name' => sanitize_text_field($params['name']),
            'city_id' => intval($params['city_id']),
            'rating' => sanitize_text_field($params['rating'] ?? '5'),
            'distance_to_haram' => intval($params['distance_to_haram'] ?? 0)
        ]);
        return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id]);
    }

    // --- AIRLINES ---
    public function get_airlines($request) {
        global $wpdb;
        return rest_ensure_response($wpdb->get_results("SELECT * FROM {$wpdb->prefix}umh_master_airlines ORDER BY name ASC"));
    }

    public function create_airline($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $wpdb->insert("{$wpdb->prefix}umh_master_airlines", [
            'name' => sanitize_text_field($params['name']),
            'code' => sanitize_text_field($params['code'] ?? ''),
            'type' => sanitize_text_field($params['type'] ?? 'International')
        ]);
        return rest_ensure_response(['success' => true, 'id' => $wpdb->insert_id]);
    }

    // --- CMS LOGIC ---
    public function get_page_content($request) {
        $slug = $request->get_param('slug');
        if (empty($slug)) return new WP_Error('missing_slug', 'Slug halaman diperlukan', ['status' => 400]);

        $args = [
            'name'        => $slug,
            'post_type'   => 'page',
            'post_status' => 'publish',
            'numberposts' => 1
        ];
        
        $posts = get_posts($args);
        if (empty($posts)) return new WP_Error('not_found', 'Halaman tidak ditemukan', ['status' => 404]);

        $post = $posts[0];
        
        $data = [
            'id' => $post->ID,
            'title' => $post->post_title,
            'content' => apply_filters('the_content', $post->post_content),
            'featured_image' => get_the_post_thumbnail_url($post->ID, 'full'),
            'updated_at' => $post->post_modified
        ];

        return rest_ensure_response($data);
    }

    public function get_custom_menu() {
        return rest_ensure_response([
            ['label' => 'Tentang Kami', 'slug' => 'tentang-kami'],
            ['label' => 'Syarat & Ketentuan', 'slug' => 'syarat-ketentuan'],
            ['label' => 'Kontak', 'slug' => 'kontak'],
            ['label' => 'Panduan', 'slug' => 'panduan-umroh'],
        ]);
    }
}