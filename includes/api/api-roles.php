<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Roles extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_roles');
    }

    // Menggunakan standar CRUD dari parent controller
    // Bisa ditambahkan validasi khusus jika perlu, misal mencegah hapus role Administrator
    
    public function delete_item($request) {
        $id = $request->get_param('id');
        
        // Cek ID atau UUID
        $role = $this->get_record_by_id_or_uuid($id);
        
        if ($role && $role->role_key === 'administrator') {
            return new WP_REST_Response(['message' => 'Role Administrator tidak boleh dihapus'], 403);
        }
        
        return parent::delete_item($request);
    }

    private function get_record_by_id_or_uuid($id) {
        if (is_numeric($id)) {
            return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
        } else {
            return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE uuid = %s", $id));
        }
    }
}