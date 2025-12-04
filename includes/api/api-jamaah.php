<?php
/**
 * API Handler untuk Manajemen Data Jemaah (Profile Only)
 * Sesuai DB Schema V4.0 (Tanpa data transaksi/paket di tabel ini)
 */

if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Jamaah {
    private $table_name;

    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'umh_jamaah';
    }

    public function register_routes() {
        register_rest_route('umh/v1', '/jamaah', [
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

        register_rest_route('umh/v1', '/jamaah/(?P<id>\d+)', [
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
        return current_user_can('manage_options'); // Sesuaikan nanti dengan role custom
    }

    // GET ALL
    public function get_items($request) {
        global $wpdb;
        
        $search = $request->get_param('search');
        $page = $request->get_param('page') ? intval($request->get_param('page')) : 1;
        $per_page = $request->get_param('per_page') ? intval($request->get_param('per_page')) : 10;
        $offset = ($page - 1) * $per_page;

        $where = "WHERE 1=1";
        if ($search) {
            $where .= $wpdb->prepare(" AND (full_name LIKE %s OR nik LIKE %s OR passport_number LIKE %s)", "%$search%", "%$search%", "%$search%");
        }

        $items = $wpdb->get_results("SELECT * FROM {$this->table_name} $where ORDER BY created_at DESC LIMIT $per_page OFFSET $offset");
        $total = $wpdb->get_var("SELECT COUNT(*) FROM {$this->table_name} $where");

        return new WP_REST_Response([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'total' => (int)$total,
                'per_page' => $per_page,
                'current_page' => $page,
                'total_pages' => ceil($total / $per_page)
            ]
        ], 200);
    }

    // GET SINGLE
    public function get_item($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $item = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));

        if (!$item) {
            return new WP_REST_Response(['success' => false, 'message' => 'Jemaah not found'], 404);
        }

        return new WP_REST_Response(['success' => true, 'data' => $item], 200);
    }

    // CREATE
    public function create_item($request) {
        global $wpdb;
        $params = $request->get_json_params();

        // Validasi Dasar
        if (empty($params['full_name']) || empty($params['gender'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'Nama dan Jenis Kelamin wajib diisi'], 400);
        }

        // Cek NIK Duplikat (Agar tidak ada double data orang)
        if (!empty($params['nik'])) {
            $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$this->table_name} WHERE nik = %s", $params['nik']));
            if ($exists) {
                return new WP_REST_Response(['success' => false, 'message' => 'NIK sudah terdaftar'], 400);
            }
        }

        // Data Mapping (Sesuai DB Schema V4.0)
        $data = [
            'nik' => isset($params['nik']) ? sanitize_text_field($params['nik']) : null,
            'passport_number' => isset($params['passport_number']) ? sanitize_text_field($params['passport_number']) : null,
            'full_name' => sanitize_text_field($params['full_name']),
            'full_name_ar' => isset($params['full_name_ar']) ? sanitize_text_field($params['full_name_ar']) : null,
            'gender' => sanitize_text_field($params['gender']),
            'birth_place' => isset($params['birth_place']) ? sanitize_text_field($params['birth_place']) : null,
            'birth_date' => isset($params['birth_date']) ? sanitize_text_field($params['birth_date']) : null,
            'phone' => isset($params['phone']) ? sanitize_text_field($params['phone']) : null,
            'email' => isset($params['email']) ? sanitize_email($params['email']) : null,
            'address' => isset($params['address']) ? sanitize_textarea_field($params['address']) : null,
            'city' => isset($params['city']) ? sanitize_text_field($params['city']) : null,
            'clothing_size' => isset($params['clothing_size']) ? sanitize_text_field($params['clothing_size']) : null,
            'disease_history' => isset($params['disease_history']) ? sanitize_textarea_field($params['disease_history']) : null,
            'father_name' => isset($params['father_name']) ? sanitize_text_field($params['father_name']) : null,
            'mother_name' => isset($params['mother_name']) ? sanitize_text_field($params['mother_name']) : null,
            // File upload links (handle terpisah atau kirim URL)
            'scan_ktp' => isset($params['scan_ktp']) ? esc_url_raw($params['scan_ktp']) : null,
            'scan_passport' => isset($params['scan_passport']) ? esc_url_raw($params['scan_passport']) : null,
        ];

        $wpdb->insert($this->table_name, $data);

        if ($wpdb->last_error) {
            return new WP_REST_Response(['success' => false, 'message' => $wpdb->last_error], 500);
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Data Jemaah berhasil disimpan', 'id' => $wpdb->insert_id], 201);
    }

    // UPDATE
    public function update_item($request) {
        global $wpdb;
        $id = $request->get_param('id');
        $params = $request->get_json_params();

        // Data Mapping Update
        $data = [];
        // Loop through allowed fields
        $allowed_fields = ['nik', 'passport_number', 'full_name', 'full_name_ar', 'gender', 'birth_place', 'birth_date', 'phone', 'email', 'address', 'city', 'clothing_size', 'disease_history', 'father_name', 'mother_name', 'scan_ktp', 'scan_passport'];
        
        foreach ($allowed_fields as $field) {
            if (isset($params[$field])) {
                $data[$field] = $field === 'email' ? sanitize_email($params[$field]) : sanitize_text_field($params[$field]);
            }
        }

        if (empty($data)) {
            return new WP_REST_Response(['success' => false, 'message' => 'No data to update'], 400);
        }

        $wpdb->update($this->table_name, $data, ['id' => $id]);

        if ($wpdb->last_error) {
            return new WP_REST_Response(['success' => false, 'message' => $wpdb->last_error], 500);
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Data Jemaah berhasil diperbarui'], 200);
    }

    // DELETE
    public function delete_item($request) {
        global $wpdb;
        $id = $request->get_param('id');

        // Cek relasi dulu! Jangan hapus jika jemaah sudah pernah booking
        $has_booking = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$wpdb->prefix}umh_booking_passengers WHERE jamaah_id = %d", $id));
        
        if ($has_booking) {
            return new WP_REST_Response(['success' => false, 'message' => 'Gagal hapus: Jemaah ini memiliki riwayat transaksi/booking.'], 400);
        }

        $wpdb->delete($this->table_name, ['id' => $id]);

        return new WP_REST_Response(['success' => true, 'message' => 'Data Jemaah dihapus'], 200);
    }
}