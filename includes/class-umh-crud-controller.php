<?php
if (!defined('ABSPATH')) exit;

class UMH_CRUD_Controller {
    protected $namespace = 'umh/v1';
    protected $resource_name;
    protected $table_name;
    protected $schema;
    protected $permissions;
    protected $search_fields;

    public function __construct($resource_name, $table_name, $schema, $permissions = [], $search_fields = []) {
        global $wpdb;
        $this->resource_name = $resource_name;
        $this->table_name = $wpdb->prefix . $table_name;
        $this->schema = $schema;
        $this->permissions = wp_parse_args($permissions, [
            'get_items'   => ['administrator', 'admin_staff'],
            'get_item'    => ['administrator', 'admin_staff'],
            'create_item' => ['administrator', 'admin_staff'],
            'update_item' => ['administrator', 'admin_staff'],
            'delete_item' => ['administrator'],
        ]);
        $this->search_fields = $search_fields;

        // PERBAIKAN LOGIKA HOOK (Mencegah Double Hook / No Route)
        // Jika class ini diinisialisasi DI DALAM callback rest_api_init (oleh API Loader),
        // maka kita harus langsung register routes, karena hook rest_api_init sudah lewat/sedang jalan.
        if (did_action('rest_api_init')) {
            $this->register_routes();
        } else {
            add_action('rest_api_init', [$this, 'register_routes']);
        }
    }

    public function register_routes() {
        // Register standard CRUD routes
        register_rest_route($this->namespace, '/' . $this->resource_name, [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_items'],
                'permission_callback' => [$this, 'check_permission'],
                'args'                => $this->get_collection_params(),
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'create_item'],
                'permission_callback' => [$this, 'check_permission'],
            ],
        ]);

        register_rest_route($this->namespace, '/' . $this->resource_name . '/(?P<id>\d+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_item'],
                'permission_callback' => [$this, 'check_permission'],
            ],
            [
                'methods'             => 'POST', // Use POST for update to support file upload if needed
                'callback'            => [$this, 'update_item'],
                'permission_callback' => [$this, 'check_permission'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'delete_item'],
                'permission_callback' => [$this, 'check_permission'],
            ],
        ]);
    }

    public function check_permission($request) {
        if (!is_user_logged_in()) {
            return new WP_Error('rest_forbidden', 'Silakan login terlebih dahulu.', ['status' => 401]);
        }

        // Izinkan Super Admin (bypass logic)
        if (current_user_can('manage_options')) return true;

        $method = $request->get_method();
        $action = '';

        switch ($method) {
            case 'GET':
                $action = $request->get_param('id') ? 'get_item' : 'get_items';
                break;
            case 'POST':
                $action = $request->get_param('id') ? 'update_item' : 'create_item';
                break;
            case 'DELETE':
                $action = 'delete_item';
                break;
            default:
                return true;
        }

        $allowed_roles = $this->permissions[$action] ?? ['administrator'];
        
        // Gunakan helper dari utils.php jika tersedia
        if (function_exists('umh_check_api_permission')) {
             $checker = umh_check_api_permission($allowed_roles);
             $result = call_user_func($checker, $request);
             // Jika result true atau WP_Error, kembalikan
             return $result;
        }

        return true; 
    }
    
    // --- CRUD OPERATIONS ---

    public function get_items($request) {
        global $wpdb;
        $page = $request->get_param('page') ?: 1;
        $per_page = $request->get_param('per_page') ?: 20;
        $offset = ($page - 1) * $per_page;
        $search = $request->get_param('search');

        $where = "WHERE 1=1";

        if ($search && !empty($this->search_fields)) {
            $search_query = [];
            foreach ($this->search_fields as $field) {
                $search_query[] = "$field LIKE '%" . esc_sql($wpdb->esc_like($search)) . "%'";
            }
            $where .= " AND (" . implode(' OR ', $search_query) . ")";
        }
        
        $params = $request->get_params();
        $ignored_params = ['page', 'per_page', 'search', 'order', 'orderby'];
        foreach ($params as $key => $value) {
            if (!in_array($key, $ignored_params) && isset($this->schema[$key])) {
                $where .= $wpdb->prepare(" AND $key = %s", $value);
            }
        }

        $orderby = $request->get_param('orderby') ? esc_sql($request->get_param('orderby')) : 'id';
        $order = $request->get_param('order') ? esc_sql($request->get_param('order')) : 'DESC';

        $sql = "SELECT * FROM {$this->table_name} $where ORDER BY $orderby $order LIMIT %d OFFSET %d";
        $results = $wpdb->get_results($wpdb->prepare($sql, $per_page, $offset), ARRAY_A);
        
        $total = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name} $where");
        
        $response = rest_ensure_response(['items' => $results, 'total_items' => (int)$total, 'total_pages' => ceil($total/$per_page), 'current_page' => (int)$page]);
        return $response;
    }

    public function get_item($request) {
        global $wpdb;
        $id = (int) $request['id'];
        $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id), ARRAY_A);
        if (!$item) return new WP_Error('not_found', 'Data tidak ditemukan', ['status' => 404]);
        return rest_ensure_response($item);
    }

    public function create_item($request) {
        global $wpdb;
        $data = apply_filters("umh_crud_{$this->resource_name}_before_create", $this->prepare_item_for_db($request), $request);
        if (is_wp_error($data)) return $data;

        if ($wpdb->insert($this->table_name, $data)) {
            return $this->get_item(['id' => $wpdb->insert_id]);
        }
        return new WP_Error('db_error', 'Gagal menyimpan: ' . $wpdb->last_error, ['status' => 500]);
    }

    public function update_item($request) {
        global $wpdb;
        $id = (int) $request['id'];
        $data = apply_filters("umh_crud_{$this->resource_name}_before_update", $this->prepare_item_for_db($request), $request);
        if (is_wp_error($data)) return $data;

        $wpdb->update($this->table_name, $data, ['id' => $id]);
        return $this->get_item(['id' => $id]);
    }

    public function delete_item($request) {
        global $wpdb;
        $id = (int) $request['id'];
        $cols = $wpdb->get_col("DESC {$this->table_name}", 0);
        
        if (in_array('status', $cols)) {
             $wpdb->update($this->table_name, ['status' => 'deleted'], ['id' => $id]);
        } else {
             $wpdb->delete($this->table_name, ['id' => $id]);
        }
        
        return rest_ensure_response(['deleted' => true, 'id' => $id]);
    }

    protected function prepare_item_for_db($request) {
        $data = [];
        $params = $request->get_json_params();
        foreach ($this->schema as $key => $config) {
            if (isset($params[$key])) {
                $data[$key] = $params[$key];
            } elseif (isset($config['default']) && $request->get_method() === 'POST' && !isset($request['id'])) {
                $data[$key] = $config['default'];
            }
        }
        return $data;
    }

    protected function get_collection_params() {
        return [
            'page' => ['default' => 1, 'sanitize_callback' => 'absint'],
            'per_page' => ['default' => 20, 'sanitize_callback' => 'absint'],
            'search' => ['sanitize_callback' => 'sanitize_text_field'],
        ];
    }
}