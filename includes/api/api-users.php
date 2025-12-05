<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Users extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_users'); // Menggunakan tabel umh_users (Bukan wp_users)
    }

    public function register_routes() {
        // Route Standar CRUD (GET, POST, PUT, DELETE)
        register_rest_route('umh/v1', '/users', [
            ['methods' => 'GET', 'callback' => [$this, 'get_items'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'create_item'], 'permission_callback' => '__return_true'],
        ]);

        register_rest_route('umh/v1', '/users/(?P<id>[a-zA-Z0-9-]+)', [
            ['methods' => 'GET', 'callback' => [$this, 'get_item'], 'permission_callback' => '__return_true'],
            ['methods' => 'PUT', 'callback' => [$this, 'update_item'], 'permission_callback' => '__return_true'],
            ['methods' => 'DELETE', 'callback' => [$this, 'delete_item'], 'permission_callback' => '__return_true'],
        ]);

        // Route Khusus: LOGIN (Karena kita pakai tabel custom)
        register_rest_route('umh/v1', '/auth/login', [
            'methods' => 'POST',
            'callback' => [$this, 'login_user'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Override Create: Untuk Hashing Password & Cek Duplikat
     */
    public function create_item($request) {
        $data = $request->get_json_params();

        // 1. Validasi Wajib
        if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            return new WP_REST_Response(['success' => false, 'message' => 'Username, Email, dan Password wajib diisi.'], 400);
        }

        // 2. Cek Duplikat Username/Email
        $exists = $this->db->get_row($this->db->prepare(
            "SELECT id FROM {$this->table_name} WHERE username = %s OR email = %s",
            $data['username'], $data['email']
        ));

        if ($exists) {
            return new WP_REST_Response(['success' => false, 'message' => 'Username atau Email sudah terdaftar.'], 409);
        }

        // 3. Hash Password (Keamanan Enterprise)
        // Kita gunakan password_hash PHP (Bcrypt) yang lebih aman dari MD5 default WP
        $data['password_hash'] = password_hash($data['password'], PASSWORD_BCRYPT);
        unset($data['password']); // Jangan simpan password mentah!

        // 4. Generate UUID & Default Role
        $data['uuid'] = $this->generate_uuid();
        if (empty($data['role_key'])) $data['role_key'] = 'jamaah';
        $data['created_at'] = current_time('mysql');

        // 5. Insert ke Database
        $format = array_fill(0, count($data), '%s');
        $this->db->insert($this->table_name, $data, $format);
        $new_id = $this->db->insert_id;

        // 6. Ambil data baru (tanpa password hash)
        $user = $this->db->get_row($this->db->prepare("SELECT id, uuid, username, email, full_name, role_key, avatar_url FROM {$this->table_name} WHERE id = %d", $new_id));

        // Jika Role = Jamaah, otomatis buat entri di tabel umh_jamaah (Sinkronisasi Profile)
        if ($data['role_key'] === 'jamaah') {
            $this->create_jamaah_profile($new_id, $data['uuid'], $data['full_name'], $data['email']);
        }

        return new WP_REST_Response(['success' => true, 'data' => $user], 201);
    }

    /**
     * Helper: Buat Profil Jamaah Otomatis saat Register
     */
    private function create_jamaah_profile($user_id, $uuid, $name, $email) {
        $jamaah_table = $this->db->prefix . 'umh_jamaah';
        $this->db->insert($jamaah_table, [
            'uuid' => $this->generate_uuid(), // UUID khusus profile jamaah
            'user_id' => $user_id, // Link ke akun login
            'full_name' => $name,
            'email' => $email,
            'status' => 'registered',
            'gender' => 'L', // Default, nanti diedit user
            'created_at' => current_time('mysql')
        ]);
    }

    /**
     * Custom Login Handler
     */
    public function login_user($request) {
        $params = $request->get_json_params();
        $username_or_email = isset($params['username']) ? $params['username'] : '';
        $password = isset($params['password']) ? $params['password'] : '';

        if (empty($username_or_email) || empty($password)) {
            return new WP_REST_Response(['success' => false, 'message' => 'Kredensial tidak lengkap'], 400);
        }

        // Cari User
        $user = $this->db->get_row($this->db->prepare(
            "SELECT * FROM {$this->table_name} WHERE (username = %s OR email = %s) AND status = 'active' AND deleted_at IS NULL",
            $username_or_email, $username_or_email
        ));

        if (!$user) {
            return new WP_REST_Response(['success' => false, 'message' => 'User tidak ditemukan atau tidak aktif.'], 404);
        }

        // Verifikasi Password
        if (password_verify($password, $user->password_hash)) {
            // Sukses Login
            
            // Update Last Login
            $this->db->update($this->table_name, ['last_login' => current_time('mysql')], ['id' => $user->id]);

            // Hapus data sensitif sebelum dikirim ke frontend
            unset($user->password_hash);
            unset($user->reset_token);

            return new WP_REST_Response([
                'success' => true,
                'message' => 'Login Berhasil',
                'data' => $user,
                'token' => 'dummy-jwt-token-'. $user->uuid // Nanti bisa diganti JWT beneran
            ], 200);
        } else {
            return new WP_REST_Response(['success' => false, 'message' => 'Password salah.'], 401);
        }
    }

    /**
     * Override Get Items: Sembunyikan Password Hash
     */
    public function get_items($request) {
        $response = parent::get_items($request);
        if ($response->status === 200) {
            $data = $response->get_data();
            foreach ($data['data'] as &$user) {
                unset($user->password_hash);
                unset($user->reset_token);
            }
            $response->set_data($data);
        }
        return $response;
    }
}