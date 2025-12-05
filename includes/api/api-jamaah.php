<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Jamaah extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_jamaah');
    }

    public function register_routes() {
        parent::register_routes();
        
        // Endpoint: Ambil Dokumen Jemaah
        register_rest_route('umh/v1', '/jamaah/(?P<id>[a-zA-Z0-9-]+)/documents', [
            'methods' => 'GET',
            'callback' => [$this, 'get_jamaah_documents'],
            'permission_callback' => '__return_true',
        ]);

        // Endpoint: Upload Dokumen Jemaah (Paspor/KTP/dll)
        register_rest_route('umh/v1', '/jamaah/(?P<id>[a-zA-Z0-9-]+)/documents', [
            'methods' => 'POST',
            'callback' => [$this, 'upload_jamaah_document'],
            'permission_callback' => '__return_true',
        ]);

        // Endpoint: Hapus Dokumen
        register_rest_route('umh/v1', '/documents/(?P<doc_id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'delete_document'],
            'permission_callback' => '__return_true',
        ]);
    }

    /**
     * Get Documents List
     */
    public function get_jamaah_documents($request) {
        $id = $request->get_param('id');
        $jamaah = $this->get_record_by_id_or_uuid($id);
        
        if (!$jamaah) return new WP_REST_Response(['message' => 'Jemaah not found'], 404);

        $docs = $this->db->get_results($this->db->prepare(
            "SELECT * FROM {$this->db->prefix}umh_jamaah_documents WHERE jamaah_id = %d",
            $jamaah->id
        ));

        return new WP_REST_Response(['success' => true, 'data' => $docs], 200);
    }

    /**
     * Upload & Save Document Info
     */
    public function upload_jamaah_document($request) {
        $id = $request->get_param('id');
        $jamaah = $this->get_record_by_id_or_uuid($id);
        
        if (!$jamaah) return new WP_REST_Response(['message' => 'Jemaah not found'], 404);

        $params = $request->get_body_params();
        $files = $request->get_file_params();

        if (empty($files['file']) || empty($params['doc_type'])) {
            return new WP_REST_Response(['message' => 'File dan Tipe Dokumen wajib diisi'], 400);
        }

        // 1. Upload File Fisik
        if (!function_exists('wp_handle_upload')) require_once(ABSPATH . 'wp-admin/includes/file.php');
        
        $uploaded = wp_handle_upload($files['file'], ['test_form' => false]);
        
        if (isset($uploaded['error'])) {
            return new WP_REST_Response(['message' => $uploaded['error']], 500);
        }

        // 2. Simpan Metadata ke Database
        $table_doc = $this->db->prefix . 'umh_jamaah_documents';
        $this->db->insert($table_doc, [
            'jamaah_id' => $jamaah->id,
            'doc_type' => sanitize_text_field($params['doc_type']),
            'file_path' => $uploaded['url'],
            'file_name' => $files['file']['name'],
            'status' => 'pending',
            'notes' => isset($params['notes']) ? sanitize_textarea_field($params['notes']) : '',
            'uploaded_at' => current_time('mysql')
        ]);

        // 3. Update Status Kelengkapan di Profil Jemaah (Opsional logic)
        // Jika Paspor diupload, update no paspor di tabel utama jika masih kosong
        if ($params['doc_type'] === 'passport' && !empty($params['doc_number'])) {
            $this->db->update($this->table_name, 
                ['passport_number' => sanitize_text_field($params['doc_number'])], 
                ['id' => $jamaah->id]
            );
        }

        return new WP_REST_Response(['success' => true, 'message' => 'Dokumen berhasil disimpan', 'url' => $uploaded['url']], 201);
    }

    public function delete_document($request) {
        $doc_id = $request->get_param('doc_id');
        $this->db->delete($this->db->prefix . 'umh_jamaah_documents', ['id' => $doc_id]);
        return new WP_REST_Response(['success' => true, 'message' => 'Dokumen dihapus'], 200);
    }

    // Helper Private
    private function get_record_by_id_or_uuid($id) {
        if (is_numeric($id)) {
            return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE id = %d", $id));
        } else {
            return $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE uuid = %s", $id));
        }
    }
}