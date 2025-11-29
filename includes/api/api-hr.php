<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_HR_API {
    public function __construct() {
        // Schema lengkap sesuai tabel umh_employees di db-schema.php
        $schema = [
            'name'        => ['type' => 'string', 'required' => true],
            'position'    => ['type' => 'string'],
            'phone'       => ['type' => 'string'],
            'email'       => ['type' => 'string', 'format' => 'email'], // Field email ditambahkan
            'salary'      => ['type' => 'number'],
            'user_id'     => ['type' => 'integer'], // Relasi ke ID user WordPress (untuk login staff)
            'status'      => ['type' => 'string', 'default' => 'active'], // active, inactive, terminated
            'joined_date' => ['type' => 'string', 'format' => 'date']   // Tanggal bergabung
        ];

        // Permission akses yang ketat namun fungsional
        $permissions = [
            'get_items'   => ['owner', 'hr_staff', 'administrator'], 
            'create_item' => ['owner', 'hr_staff', 'administrator'],
            'update_item' => ['owner', 'hr_staff', 'administrator'],
            'delete_item' => ['owner', 'administrator'] // Hanya Owner/Admin yang boleh hapus permanen
        ];

        new UMH_CRUD_Controller('hr', 'umh_employees', $schema, $permissions);
    }
}
new UMH_HR_API();