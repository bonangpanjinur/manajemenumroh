<?php
defined('ABSPATH') || exit;

class UMH_API_Jamaah {
    public function register_routes() {
        register_rest_route('umh/v1', '/jamaah', [
            'methods' => 'GET',
            'callback' => [$this, 'get_items'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);
        register_rest_route('umh/v1', '/jamaah', [
            'methods' => 'POST',
            'callback' => [$this, 'create_item'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);
        register_rest_route('umh/v1', '/jamaah/(?P<id>\d+)', [
            'methods' => ['PUT', 'DELETE'],
            'callback' => [$this, 'handle_single_item'],
            'permission_callback' => function() { return current_user_can('edit_posts'); }
        ]);
    }

    public function get_items($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';

        $page = isset($request['page']) ? intval($request['page']) : 1;
        $per_page = isset($request['per_page']) ? intval($request['per_page']) : 20;
        $offset = ($page - 1) * $per_page;
        $search = isset($request['search']) ? sanitize_text_field($request['search']) : '';

        // JOIN ke tabel Paket untuk dapat nama paket
        $query = "SELECT j.*, p.name as package_name 
                  FROM $table j
                  LEFT JOIN {$wpdb->prefix}umh_packages p ON j.package_id = p.id
                  WHERE 1=1";

        if (!empty($search)) {
            $query .= $wpdb->prepare(" AND (j.full_name LIKE %s OR j.nik LIKE %s OR j.passport_number LIKE %s)", "%$search%", "%$search%", "%$search%");
        }

        $query .= " ORDER BY j.created_at DESC LIMIT $offset, $per_page";
        
        $items = $wpdb->get_results($query);
        
        // Count total
        $count_query = "SELECT COUNT(*) FROM $table j WHERE 1=1";
        if (!empty($search)) {
            $count_query .= $wpdb->prepare(" AND (j.full_name LIKE %s OR j.nik LIKE %s)", "%$search%", "%$search%");
        }
        $total_items = $wpdb->get_var($count_query);

        return rest_ensure_response([
            'items' => $items,
            'page' => $page,
            'totalPages' => ceil($total_items / $per_page),
            'totalItems' => $total_items
        ]);
    }

    public function create_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        $data = $request->get_json_params();
        
        // Pastikan field wajib
        if(empty($data['full_name'])) return new WP_Error('missing_name', 'Nama wajib diisi', ['status'=>400]);

        $wpdb->insert($table, $data);
        return rest_ensure_response(['id' => $wpdb->insert_id, 'message' => 'Jamaah Added']);
    }

    public function handle_single_item($request) {
        global $wpdb;
        $table = $wpdb->prefix . 'umh_jamaah';
        $id = $request['id'];

        if ($request->get_method() === 'DELETE') {
            $wpdb->delete($table, ['id' => $id]);
            return rest_ensure_response(['success' => true]);
        } 
        
        if ($request->get_method() === 'PUT') {
            $data = $request->get_json_params();
            // Clean up read-only fields
            unset($data['id'], $data['package_name'], $data['created_at']);
            $wpdb->update($table, $data, ['id' => $id]);
            return rest_ensure_response(['success' => true]);
        }
    }
}