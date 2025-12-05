<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class UMH_CRUD_Controller (Enterprise Edition)
 * Menangani standar baru: UUID, Soft Deletes, dan Strict Types.
 */
class UMH_CRUD_Controller {
    protected $table_name;
    protected $db;
    protected $namespace = 'umh/v1'; // Namespace API standar
    protected $rest_base; // Base URL endpoint (misal: /users, /roles)
    protected $primary_key = 'id'; 
    protected $public_key = 'uuid'; 

    public function __construct($table_name) {
        global $wpdb;
        $this->db = $wpdb;
        $this->table_name = $wpdb->prefix . $table_name;
        
        // Auto-detect rest base dari nama tabel (remove prefix umh_)
        $base = str_replace('umh_', '', $table_name);
        $this->rest_base = str_replace('_', '-', $base); // umh_user_log -> user-log
    }

    /**
     * PERBAIKAN UTAMA: Method ini sebelumnya HILANG, menyebabkan Fatal Error.
     * Mendaftarkan route standar: GET, POST, PUT, DELETE
     */
    public function register_routes() {
        // 1. Route Koleksi (GET All & POST Create)
        // Contoh: /wp-json/umh/v1/roles
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_items'],
                'permission_callback' => [$this, 'check_permission'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'create_item'],
                'permission_callback' => [$this, 'check_permission'],
            ],
        ]);

        // 2. Route Single Item (GET One, PUT Update, DELETE)
        // Contoh: /wp-json/umh/v1/roles/123
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<id>[a-zA-Z0-9-]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_item'],
                'permission_callback' => [$this, 'check_permission'],
            ],
            [
                'methods'             => 'PUT',
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

    /**
     * Permission Check Sederhana (Bisa di-override di child class)
     */
    public function check_permission($request) {
        // Sementara return true agar tidak 401/403 saat development.
        // Nanti ganti: return current_user_can('manage_options');
        return true; 
    }

    /**
     * Helper: Generate UUID V4
     */
    protected function generate_uuid() {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    /**
     * READ: Get Items dengan Soft Delete filtering
     */
    public function get_items($request) {
        $params = $request->get_params();
        $page = isset($params['page']) ? intval($params['page']) : 1;
        $per_page = isset($params['per_page']) ? intval($params['per_page']) : 10;
        $search = isset($params['search']) ? sanitize_text_field($params['search']) : '';
        $offset = ($page - 1) * $per_page;

        // Cek apakah tabel punya kolom deleted_at
        $cols = $this->db->get_col("DESC {$this->table_name}", 0);
        $has_soft_delete = in_array('deleted_at', $cols);

        $where = "WHERE 1=1";
        if ($has_soft_delete) {
            $where .= " AND deleted_at IS NULL";
        }
        
        // Search Logic
        if (!empty($search)) {
            $search_conditions = [];
            foreach ($cols as $col) {
                // Cari di kolom yang relevan (nama, email, kode, judul)
                if (preg_match('/(name|title|code|email|username)/', $col)) {
                    $search_conditions[] = "$col LIKE '%" . esc_sql($this->db->esc_like($search)) . "%'";
                }
            }
            if (!empty($search_conditions)) {
                $where .= " AND (" . implode(' OR ', $search_conditions) . ")";
            }
        }

        $query = "SELECT * FROM {$this->table_name} $where ORDER BY id DESC";

        // Pagination
        $total_query = "SELECT COUNT(*) FROM {$this->table_name} $where";
        $total_items = $this->db->get_var($total_query);
        $total_pages = ceil($total_items / $per_page);

        $query .= $this->db->prepare(" LIMIT %d OFFSET %d", $per_page, $offset);
        
        $items = $this->db->get_results($query);

        return new WP_REST_Response([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'page' => $page,
                'per_page' => $per_page,
                'total_items' => intval($total_items),
                'total_pages' => $total_pages
            ]
        ], 200);
    }

    /**
     * READ SINGLE
     */
    public function get_item($request) {
        $id = $request->get_param('id');
        $column = is_numeric($id) ? $this->primary_key : $this->public_key;

        // Cek soft delete
        $cols = $this->db->get_col("DESC {$this->table_name}", 0);
        $soft_delete_sql = in_array('deleted_at', $cols) ? "AND deleted_at IS NULL" : "";

        $item = $this->db->get_row($this->db->prepare(
            "SELECT * FROM {$this->table_name} WHERE {$column} = %s $soft_delete_sql", 
            $id
        ));

        if ($item) {
            return new WP_REST_Response(['success' => true, 'data' => $item], 200);
        }
        return new WP_REST_Response(['success' => false, 'message' => 'Data not found'], 404);
    }

    /**
     * CREATE
     */
    public function create_item($request) {
        $data = $request->get_json_params();
        $cols = $this->db->get_col("DESC {$this->table_name}", 0);

        // Auto UUID
        if (in_array('uuid', $cols) && empty($data['uuid'])) {
            $data['uuid'] = $this->generate_uuid();
        }
        // Timestamp
        if (in_array('created_at', $cols)) {
            $data['created_at'] = current_time('mysql');
        }
        
        // Bersihkan data yang tidak ada di kolom tabel
        foreach ($data as $key => $val) {
            if (!in_array($key, $cols)) unset($data[$key]);
        }

        $format = array_fill(0, count($data), '%s');
        $result = $this->db->insert($this->table_name, $data, $format);

        if ($result) {
            $new_id = $this->db->insert_id;
            $new_item = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $new_id));
            return new WP_REST_Response(['success' => true, 'message' => 'Data created', 'data' => $new_item], 201);
        }

        return new WP_REST_Response(['success' => false, 'message' => 'DB Error: ' . $this->db->last_error], 500);
    }

    /**
     * UPDATE
     */
    public function update_item($request) {
        $id = $request->get_param('id');
        $data = $request->get_json_params();
        $cols = $this->db->get_col("DESC {$this->table_name}", 0);

        $where = is_numeric($id) ? ['id' => $id] : ['uuid' => $id];

        if (in_array('updated_at', $cols)) {
            $data['updated_at'] = current_time('mysql');
        }

        // Proteksi kolom vital & bersihkan input
        unset($data['id'], $data['uuid'], $data['created_at']);
        foreach ($data as $key => $val) {
            if (!in_array($key, $cols)) unset($data[$key]);
        }

        $result = $this->db->update($this->table_name, $data, $where);

        if ($result !== false) {
            return new WP_REST_Response(['success' => true, 'message' => 'Data updated'], 200);
        }
        return new WP_REST_Response(['success' => false, 'message' => 'Failed to update'], 500);
    }

    /**
     * DELETE
     */
    public function delete_item($request) {
        $id = $request->get_param('id');
        $cols = $this->db->get_col("DESC {$this->table_name}", 0);
        $where = is_numeric($id) ? ['id' => $id] : ['uuid' => $id];
        
        if (in_array('deleted_at', $cols)) {
            $result = $this->db->update($this->table_name, ['deleted_at' => current_time('mysql')], $where);
        } else {
            $result = $this->db->delete($this->table_name, $where);
        }

        if ($result) {
            return new WP_REST_Response(['success' => true, 'message' => 'Data deleted'], 200);
        }
        return new WP_REST_Response(['success' => false, 'message' => 'Failed to delete'], 404);
    }
}