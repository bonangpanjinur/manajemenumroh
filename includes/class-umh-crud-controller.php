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
    protected $primary_key = 'id'; // Internal ID (BigInt)
    protected $public_key = 'uuid'; // External ID (UUID)

    public function __construct($table_name) {
        global $wpdb;
        $this->db = $wpdb;
        $this->table_name = $wpdb->prefix . $table_name;
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

        // Base Query: Selalu filter yang belum dihapus (Soft Delete)
        $query = "SELECT * FROM {$this->table_name} WHERE deleted_at IS NULL";
        
        // Search Logic
        if (!empty($search)) {
            // Deteksi kolom yang bisa di-search (biasanya name, title, code)
            $cols = $this->db->get_col("DESC {$this->table_name}", 0);
            $search_conditions = [];
            foreach ($cols as $col) {
                if (strpos($col, 'name') !== false || strpos($col, 'title') !== false || strpos($col, 'code') !== false || strpos($col, 'email') !== false) {
                    $search_conditions[] = "$col LIKE '%" . esc_sql($this->db->esc_like($search)) . "%'";
                }
            }
            if (!empty($search_conditions)) {
                $query .= " AND (" . implode(' OR ', $search_conditions) . ")";
            }
        }

        // Sorting
        $query .= " ORDER BY created_at DESC";

        // Pagination
        $total_query = "SELECT COUNT(*) FROM ({$query}) as total_table";
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
     * READ SINGLE: Get Item by UUID or ID
     */
    public function get_item($request) {
        $id = $request->get_param('id');

        // Cek apakah inputnya UUID atau ID numeric
        if (is_numeric($id)) {
            $column = $this->primary_key;
        } else {
            $column = $this->public_key;
        }

        // Prepare query dengan Soft Delete check
        $query = $this->db->prepare(
            "SELECT * FROM {$this->table_name} WHERE {$column} = %s AND deleted_at IS NULL", 
            $id
        );

        $item = $this->db->get_row($query);

        if ($item) {
            return new WP_REST_Response(['success' => true, 'data' => $item], 200);
        }

        return new WP_REST_Response(['success' => false, 'message' => 'Data not found'], 404);
    }

    /**
     * CREATE: Insert Item dengan Auto UUID
     */
    public function create_item($request) {
        $data = $request->get_json_params();
        
        // Auto-Generate UUID jika tabel memilikinya
        $cols = $this->db->get_col("DESC {$this->table_name}", 0);
        if (in_array('uuid', $cols) && empty($data['uuid'])) {
            $data['uuid'] = $this->generate_uuid();
        }

        // Timestamp
        $data['created_at'] = current_time('mysql');
        
        // Sanitasi dasar (bisa diperluas di child class)
        // ...

        $format = array_fill(0, count($data), '%s');
        $result = $this->db->insert($this->table_name, $data, $format);

        if ($result) {
            $new_id = $this->db->insert_id;
            // Return data lengkap yang baru dibuat
            $new_item = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $new_id));
            return new WP_REST_Response(['success' => true, 'message' => 'Data created', 'data' => $new_item], 201);
        }

        return new WP_REST_Response(['success' => false, 'message' => 'Failed to create data: ' . $this->db->last_error], 500);
    }

    /**
     * UPDATE: Update Item by UUID or ID
     */
    public function update_item($request) {
        $id = $request->get_param('id');
        $data = $request->get_json_params();

        // Tentukan identifier
        $where = [];
        if (is_numeric($id)) {
            $where['id'] = $id;
        } else {
            $where['uuid'] = $id;
        }

        // Timestamp update
        $data['updated_at'] = current_time('mysql');

        // Mencegah update kolom vital
        unset($data['id']);
        unset($data['uuid']);
        unset($data['created_at']);

        $result = $this->db->update($this->table_name, $data, $where);

        if ($result !== false) {
            return new WP_REST_Response(['success' => true, 'message' => 'Data updated'], 200);
        }

        return new WP_REST_Response(['success' => false, 'message' => 'Failed to update data'], 500);
    }

    /**
     * DELETE: Soft Delete Implementation
     */
    public function delete_item($request) {
        $id = $request->get_param('id');

        // Cek kolom deleted_at ada atau tidak
        $cols = $this->db->get_col("DESC {$this->table_name}", 0);
        
        if (in_array('deleted_at', $cols)) {
            // Lakukan SOFT DELETE
            $where = is_numeric($id) ? ['id' => $id] : ['uuid' => $id];
            
            $result = $this->db->update(
                $this->table_name, 
                ['deleted_at' => current_time('mysql')], 
                $where
            );
        } else {
            // Fallback ke HARD DELETE jika tabel tidak support soft delete (legacy)
            $where = is_numeric($id) ? ['id' => $id] : ['uuid' => $id];
            $result = $this->db->delete($this->table_name, $where);
        }

        if ($result) {
            return new WP_REST_Response(['success' => true, 'message' => 'Data deleted successfully'], 200);
        }

        return new WP_REST_Response(['success' => false, 'message' => 'Failed to delete data or data not found'], 404);
    }
}