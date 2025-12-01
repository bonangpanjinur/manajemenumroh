<?php
if (!defined('ABSPATH')) exit;

class UMH_Users_API extends UMH_CRUD_Controller {
    public function __construct() {
        // 1. Definisi Schema (Sesuai kolom database umh_users)
        // Perhatikan: Kita tidak memasukkan 'password_hash' di sini karena itu field internal
        $schema = [
            'username'    => ['type' => 'string', 'required' => true],
            'email'       => ['type' => 'string', 'required' => true],
            'full_name'   => ['type' => 'string', 'required' => true],
            'role'        => ['type' => 'string', 'required' => true], // Gunakan 'role' tunggal
            'phone'       => ['type' => 'string'],
            'status'      => ['type' => 'string', 'default' => 'active'],
            'password'    => ['type' => 'string'], // Field virtual untuk input
        ];

        // 2. Permission
        $perms = [
            'get_items'    => ['owner', 'administrator', 'admin_staff'],
            'get_item'     => ['owner', 'administrator', 'admin_staff'],
            'create_item'  => ['owner', 'administrator'],
            'update_item'  => ['owner', 'administrator'],
            'delete_item'  => ['owner', 'administrator'],
        ];

        parent::__construct('users', 'umh_users', $schema, $perms, ['username', 'full_name', 'email']);
        
        // 3. Hook untuk Hash Password sebelum Simpan/Update
        add_filter('umh_crud_users_before_create', [$this, 'handle_user_data'], 10, 2);
        add_filter('umh_crud_users_before_update', [$this, 'handle_user_data'], 10, 2);
    }

    public function handle_user_data($data, $request) {
        $params = $request->get_json_params();

        // Jika ada password dikirim, hash dan simpan ke kolom 'password_hash'
        if (!empty($params['password'])) {
            $data['password_hash'] = wp_hash_password($params['password']);
        }

        // Hapus field 'password' mentah agar tidak masuk query SQL (karena kolom 'password' tidak ada di DB)
        unset($data['password']);

        // Pastikan full_name terisi (fallback ke first_name + last_name jika ada)
        if (empty($data['full_name']) && (!empty($params['first_name']) || !empty($params['last_name']))) {
            $data['full_name'] = trim(($params['first_name'] ?? '') . ' ' . ($params['last_name'] ?? ''));
        }

        return $data;
    }
}
new UMH_Users_API();