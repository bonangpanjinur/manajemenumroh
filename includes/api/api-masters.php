<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Masters_API extends UMH_CRUD_Controller {
    
    public function __construct() {
        // Schema validasi universal untuk semua tipe master
        $schema = [
            'type'        => ['type' => 'string', 'required' => true], // hotel, airline, promo, facility, bank
            'name'        => ['type' => 'string', 'required' => true], // Nama Hotel / Bank / Maskapai
            'description' => ['type' => 'string'], // Kota / No Rekening / Keterangan
            'extra_data'  => ['type' => 'string'], // JSON: Atas Nama, Bintang Hotel, dll
            'status'      => ['type' => 'string', 'default' => 'active'],
        ];
        
        // Endpoint: /umh/v1/masters
        parent::__construct('masters', 'umh_master_data', $schema, [
            'get_items'   => ['admin_staff', 'marketing_staff'], // Staff boleh lihat
            'create_item' => ['administrator', 'admin_staff'], // Hanya admin & staff senior buat
            'update_item' => ['administrator', 'admin_staff'],
            'delete_item' => ['administrator'] // Hapus cuma Super Admin
        ]);
    }

    // Filter berdasarkan type (misal: ?type=bank)
    public function get_items($request) {
        global $wpdb;
        $type = $request->get_param('type');
        
        $sql = "SELECT * FROM {$this->table_name} WHERE status = 'active'";
        
        if (!empty($type)) {
            $sql .= $wpdb->prepare(" AND type = %s", $type);
        }
        
        $sql .= " ORDER BY type ASC, name ASC";
        
        return rest_ensure_response($wpdb->get_results($sql, ARRAY_A));
    }
}
new UMH_Masters_API();
?>