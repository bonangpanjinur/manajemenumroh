<?php
if (!defined('ABSPATH')) exit;

// Pastikan class CRUD controller sudah ada
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Agents_API extends UMH_CRUD_Controller {
    
    public function __construct() {
        $schema = [
            'name'             => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'phone'            => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'city'             => ['type' => 'string'],
            'code'             => ['type' => 'string'],
            'fixed_commission' => ['type' => 'number', 'default' => 0], 
            'parent_id'        => ['type' => 'integer'],
            'type'             => ['type' => 'string', 'default' => 'master'], // master / sub
            'status'           => ['type' => 'string', 'default' => 'active'],
            'email'            => ['type' => 'string'],
        ];

        // Inisialisasi Controller
        parent::__construct('agents', 'umh_agents', $schema, [
            'get_items'   => ['owner', 'admin_staff', 'marketing_staff'],
            'create_item' => ['owner', 'admin_staff'],
            'update_item' => ['owner', 'admin_staff'],
            'delete_item' => ['owner'],
        ]);

        // PENTING: Gunakan Filter Hook untuk memanipulasi data SEBELUM masuk database
        add_filter('umh_crud_agents_before_create', [$this, 'before_create_agent'], 10, 2);
        add_filter('umh_crud_agents_before_update', [$this, 'before_update_agent'], 10, 2);
    }

    /**
     * Logika Otomatis Saat Membuat Agen Baru
     */
    public function before_create_agent($data, $request) {
        global $wpdb;
        $params = $request->get_json_params();

        // 1. Tentukan Tipe Agen (Master/Sub)
        if (!empty($data['parent_id']) && $data['parent_id'] != '0') {
            $data['type'] = 'sub'; 
        } else {
            $data['type'] = 'master';
            $data['parent_id'] = null; // Pastikan NULL jika master
        }

        // 2. AUTO GENERATE KODE (Jika kosong)
        if (empty($data['code'])) {
            $prefix = ($data['type'] === 'sub') ? 'SUB' : 'AGN';
            
            // Ambil ID terakhir untuk nomor urut
            $last_id = $wpdb->get_var("SELECT id FROM {$this->table_name} ORDER BY id DESC LIMIT 1");
            $next_num = $last_id ? intval($last_id) + 1 : 1;
            
            // Format: AGN-0001, SUB-0025
            // Tambahkan uniqid singkat agar 100% unik dan tidak bentrok jika ada race condition
            $data['code'] = $prefix . '-' . str_pad($next_num, 4, '0', STR_PAD_LEFT);
            
            // Cek double kill: Pastikan kode belum ada di DB, jika ada tambah suffix
            $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$this->table_name} WHERE code = %s", $data['code']));
            if ($exists) {
                $data['code'] .= '-' . rand(10, 99);
            }
        }

        // 3. Mapping Komisi (Handling nama field lama dari frontend)
        if (isset($params['commission_rate'])) {
            $data['fixed_commission'] = $params['commission_rate'];
        }

        // 4. Default User ID
        if (!isset($data['user_id'])) {
            $data['user_id'] = get_current_user_id() ?: 0;
        }

        return $data;
    }

    /**
     * Logika Saat Update Agen
     */
    public function before_update_agent($data, $request) {
        $params = $request->get_json_params();

        // Mapping Komisi (Agar edit komisi jalan)
        if (isset($params['commission_rate'])) {
            $data['fixed_commission'] = $params['commission_rate'];
        }

        // Update Tipe jika Parent berubah
        if (array_key_exists('parent_id', $data)) {
             if (!empty($data['parent_id']) && $data['parent_id'] != '0') {
                $data['type'] = 'sub';
            } else {
                $data['type'] = 'master';
                $data['parent_id'] = null;
            }
        }

        return $data;
    }

    /**
     * Override GET untuk menampilkan nama Parent
     */
    public function get_items($request) {
        global $wpdb;
        // Self-Join untuk mengambil nama agen induk (parent)
        $sql = "SELECT a.*, p.name as parent_name 
                FROM {$this->table_name} a 
                LEFT JOIN {$this->table_name} p ON a.parent_id = p.id 
                ORDER BY a.created_at DESC";
        
        return rest_ensure_response($wpdb->get_results($sql, ARRAY_A));
    }
}

new UMH_Agents_API();