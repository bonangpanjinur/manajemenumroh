<?php
/**
 * File: includes/api/api-jamaah.php
 * Deskripsi: API Endpoint untuk Data Jemaah (Relasi ke Booking & Dokumen)
 */

require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Jamaah extends UMH_CRUD_Controller {

    public function __construct() {
        parent::__construct('umh_jamaah');
    }

    public function register_routes() {
        parent::register_routes();
        
        // Endpoint: Ambil Detail Lengkap Jemaah + History Booking & Dokumen
        register_rest_route('umh/v1', '/jamaah/(?P<id>[a-zA-Z0-9-]+)/details', [
            'methods' => 'GET',
            'callback' => [$this, 'get_jamaah_details'],
            'permission_callback' => '__return_true',
        ]);
        
        // Endpoint: Upload Dokumen Jemaah
        register_rest_route('umh/v1', '/jamaah/(?P<id>[a-zA-Z0-9-]+)/documents', [
            'methods' => 'POST',
            'callback' => [$this, 'upload_jamaah_document'],
            // Di produksi, ganti '__return_true' dengan hak akses yang sesuai (is_user_logged_in atau role tertentu)
            'permission_callback' => '__return_true', 
        ]);

        // Endpoint: Hapus Dokumen
        register_rest_route('umh/v1', '/documents/(?P<doc_id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [$this, 'delete_document'],
            'permission_callback' => '__return_true', 
        ]);
    }
    
    // Mengambil semua detail jemaah termasuk semua booking aktif
    public function get_jamaah_details($request) {
        $id = $request->get_param('id');
        $query_col = is_numeric($id) ? 'id' : 'uuid';
        
        $jamaah = $this->db->get_row($this->db->prepare("SELECT * FROM {$this->table_name} WHERE {$query_col} = %s", $id));
        
        if (!$jamaah) return new WP_REST_Response(['message' => 'Jemaah not found'], 404);

        // 1. Ambil Semua Booking yang melibatkan Jemaah ini
        $bookings = $this->db->get_results($this->db->prepare(
            "SELECT 
                b.id, b.booking_code, b.total_price, b.total_paid, b.payment_status, 
                d.departure_date, p.name as package_name
             FROM {$this->db->prefix}umh_bookings b
             JOIN {$this->db->prefix}umh_booking_passengers bp ON b.id = bp.booking_id
             JOIN {$this->db->prefix}umh_departures d ON b.departure_id = d.id
             JOIN {$this->db->prefix}umh_packages p ON d.package_id = p.id
             WHERE bp.jamaah_id = %d GROUP BY b.id ORDER BY b.created_at DESC",
            $jamaah->id
        ));
        
        // 2. Ambil Dokumen
        $documents = $this->db->get_results($this->db->prepare(
            "SELECT * FROM {$this->db->prefix}umh_jamaah_documents WHERE jamaah_id = %d ORDER BY uploaded_at DESC",
            $jamaah->id
        ));

        $jamaah->bookings = $bookings;
        $jamaah->documents = $documents;

        return new WP_REST_Response(['success' => true, 'data' => $jamaah], 200);
    }
    
    /**
     * Endpoint Upload Dokumen Jemaah (LENGKAP)
     */
    public function upload_jamaah_document($request) {
        $id = $request->get_param('id');
        $params = $request->get_body_params();
        $files = $request->get_file_params();

        if (empty($files['file'])) {
            return new WP_REST_Response(['message' => 'File wajib diunggah.'], 400);
        }
        if (empty($params['doc_type'])) {
            return new WP_REST_Response(['message' => 'Jenis dokumen wajib diisi.'], 400);
        }

        // Cari ID Jamaah (ID atau UUID)
        $query_col = is_numeric($id) ? 'id' : 'uuid';
        $jamaah_id = $this->db->get_var($this->db->prepare("SELECT id FROM {$this->table_name} WHERE {$query_col} = %s", $id));
        if (!$jamaah_id) {
            return new WP_REST_Response(['message' => 'Jemaah tidak ditemukan.'], 404);
        }
        
        // Handle File Upload menggunakan WP functions
        if (!function_exists('wp_handle_upload')) {
            require_once(ABSPATH . 'wp-admin/includes/file.php');
        }

        $uploaded_file = $files['file'];
        $upload_overrides = ['test_form' => false];
        $move_file = wp_handle_upload($uploaded_file, $upload_overrides);

        if ($move_file && !isset($move_file['error'])) {
            // File berhasil diupload, simpan metadata ke database
            $this->db->insert($this->db->prefix . 'umh_jamaah_documents', [
                'jamaah_id' => $jamaah_id,
                'doc_type' => sanitize_text_field($params['doc_type']),
                'file_path' => $move_file['file'], 
                'file_url' => $move_file['url'],   
                'file_name' => basename($move_file['file']),
                'status' => 'pending', 
                'uploaded_at' => current_time('mysql')
            ]);

            return new WP_REST_Response(['success' => true, 'message' => 'Dokumen berhasil diunggah', 'url' => $move_file['url']], 201);
        } else {
            // Gagal upload
            return new WP_REST_Response(['message' => 'Gagal mengunggah file: ' . ($move_file['error'] ?? 'Kesalahan tidak diketahui')], 500);
        }
    }

    /**
     * Endpoint Hapus Dokumen (LENGKAP)
     */
    public function delete_document($request) {
        $doc_id = $request->get_param('doc_id');

        // 1. Ambil data dokumen (jika perlu menghapus file fisik, tapi di sini kita hanya hapus record DB)
        // $doc = $this->db->get_row($this->db->prepare("SELECT file_path FROM {$this->db->prefix}umh_jamaah_documents WHERE id = %d", $doc_id));

        // 2. Hapus dari database
        $deleted_db = $this->db->delete($this->db->prefix . 'umh_jamaah_documents', ['id' => $doc_id], ['%d']);

        if (!$deleted_db) {
            return new WP_REST_Response(['message' => 'Gagal menghapus data dari database'], 500);
        }
        
        // Catatan: Penghapusan file fisik di server dilewati untuk menghindari kompleksitas 
        // manajemen file di lingkungan WordPress yang lebih luas.

        return new WP_REST_Response(['success' => true, 'message' => 'Dokumen berhasil dihapus'], 200);
    }
}