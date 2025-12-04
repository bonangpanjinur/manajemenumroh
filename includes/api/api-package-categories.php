<?php
/**
 * API Handler untuk Kategori Paket (Dynamic Categories)
 * Endpoint: /umh/v1/package-categories
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Package_Categories {
    private $table_name;
    private $table_packages;

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_package_categories';
        $this->table_packages = $wpdb->prefix . 'umh_packages';
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/package-categories', [
            'methods' => 'GET', 
            'callback' => [$this, 'get_items'], 
            'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/package-categories', [
            'methods' => 'POST', 
            'callback' => [$this, 'create_item'], 
            'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/package-categories/(?P<id>\d+)', [
            'methods' => 'PUT', 
            'callback' => [$this, 'update_item'], 
            'permission_callback' => [$this, 'check_permission']
        ]);
        register_rest_route('umh/v1', '/package-categories/(?P<id>\d+)', [
            'methods' => 'DELETE', 
            'callback' => [$this, 'delete_item'], 
            'permission_callback' => [$this, 'check_permission']
        ]);
    }

    public function check_permission() {
        return current_user_can('manage_options');
    }

    // GET ALL CATEGORIES
    public function get_items($request) {
        global $wpdb;
        $type = $request->get_param('type'); // Filter: umroh, haji, tour
        
        $where = "WHERE 1=1";
        if ($type) {
            $where .= $wpdb->prepare(" AND type = %s", $type);
        }

        // Ambil kategori beserta jumlah paket di dalamnya (Count)
        $sql = "SELECT c.*, COUNT(p.id) as package_count 
                FROM {$this->table_name} c
                LEFT JOIN {$this->table_packages} p ON c.id = p.category_id
                $where
                GROUP BY c.id
                ORDER BY c.name ASC";
        
        $items = $wpdb->get_results($sql);
        return new WP_REST_Response(['success' => true, 'data' => $items], 200);
    }

    // CREATE CATEGORY
    public function create_item($request) {
        global $wpdb;
        $p = $request->get_json_params();

        // Validasi
        if (empty($p['name'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'Nama kategori wajib diisi'], 400);
        }

        $wpdb->insert($this->table_name, [
            'name' => sanitize_text_field($p['name']),
            'slug' => sanitize_title($p['name']), // Auto-generate slug dari nama
            'type' => !empty($p['type']) ? sanitize_text_field($p['type']) : 'umrah',
            'description' => sanitize_textarea_field($p['description'] ?? '')
        ]);

        if ($wpdb->last_error) {
            return new WP_REST_Response(['success' => false, 'message' => $wpdb->last_error], 500);
        }

        return new WP_REST_Response(['success' => true, 'id' => $wpdb->insert_id], 201);
    }

    // UPDATE CATEGORY
    public function update_item($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $p = $request->get_json_params();

        $data = [];
        if (isset($p['name'])) {
            $data['name'] = sanitize_text_field($p['name']);
            $data['slug'] = sanitize_title($p['name']);
        }
        if (isset($p['type'])) $data['type'] = sanitize_text_field($p['type']);
        if (isset($p['description'])) $data['description'] = sanitize_textarea_field($p['description']);

        if (empty($data)) return new WP_REST_Response(['success' => false, 'message' => 'No data'], 400);

        $wpdb->update($this->table_name, $data, ['id' => $id]);

        return new WP_REST_Response(['success' => true, 'message' => 'Kategori diperbarui'], 200);
    }

    // DELETE CATEGORY
    public function delete_item($request) {
        global $wpdb;
        $id = $request->get_param('id');

        // Cek apakah ada paket yang pakai kategori ini?
        $count = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$this->table_packages} WHERE category_id = %d", $id));

        if ($count > 0) {
            return new WP_REST_Response([
                'success' => false, 
                'message' => 'Gagal hapus: Masih ada ' . $count . ' paket dalam kategori ini. Pindahkan atau hapus paketnya dulu.'
            ], 400);
        }

        $wpdb->delete($this->table_name, ['id' => $id]);
        return new WP_REST_Response(['success' => true, 'message' => 'Kategori dihapus'], 200);
    }
}