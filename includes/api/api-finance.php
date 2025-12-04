<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

global $wpdb;
$method = $_SERVER['REQUEST_METHOD'];
// Sesuaikan nama tabel dengan db-schema terbaru
$table_finance = $wpdb->prefix . 'umh_finance'; 

// ==========================================
// CRUD FINANCE
// ==========================================

// 1. GET ALL
if ($method === 'GET') {
    $search = isset($_GET['search']) ? sanitize_text_field($_GET['search']) : '';
    $type   = isset($_GET['type']) ? sanitize_text_field($_GET['type']) : '';
    
    $where = "WHERE 1=1";
    
    if ($search) {
        $where .= " AND (title LIKE '%$search%' OR category LIKE '%$search%' OR reference_number LIKE '%$search%')";
    }
    if ($type && in_array($type, ['income', 'expense'])) {
        $where .= " AND type = '$type'";
    }
    
    $results = $wpdb->get_results("SELECT * FROM $table_finance $where ORDER BY transaction_date DESC, id DESC");
    
    wp_send_json_success(['data' => $results]);
}

// 2. CREATE NEW
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validasi Data Wajib
    if (empty($input['title']) || empty($input['amount'])) {
        wp_send_json_error(['message' => 'Judul dan Nominal wajib diisi'], 400);
        exit;
    }

    $data = [
        'transaction_date' => isset($input['date']) ? sanitize_text_field($input['date']) : date('Y-m-d'),
        'type'             => sanitize_text_field($input['type']),
        'category'         => sanitize_text_field($input['category']),
        'title'            => sanitize_text_field($input['title']),
        'amount'           => floatval($input['amount']),
        'description'      => isset($input['description']) ? sanitize_textarea_field($input['description']) : '',
        'reference_number' => isset($input['reference_number']) ? sanitize_text_field($input['reference_number']) : '',
        
        // FIX: Tambahkan pengecekan isset/null coalescing untuk field opsional ini
        // Menghilangkan Notice: Undefined index
        'booking_id'       => !empty($input['booking_id']) ? intval($input['booking_id']) : null,
        'related_id'       => !empty($input['related_id']) ? intval($input['related_id']) : null,
        'related_name'     => !empty($input['related_name']) ? sanitize_text_field($input['related_name']) : '',
        'proof_file'       => !empty($input['proof_file']) ? sanitize_text_field($input['proof_file']) : null,
        
        'status'           => 'verified',
        'created_at'       => current_time('mysql')
    ];

    $format = ['%s', '%s', '%s', '%s', '%f', '%s', '%s', '%d', '%d', '%s', '%s', '%s', '%s'];

    $inserted = $wpdb->insert($table_finance, $data, $format);

    if ($inserted) {
        wp_send_json_success(['id' => $wpdb->insert_id, 'message' => 'Transaksi berhasil dicatat']);
    } else {
        wp_send_json_error(['message' => 'Gagal menyimpan ke database: ' . $wpdb->last_error], 500);
    }
}

// 3. UPDATE
if ($method === 'PUT' || ($method === 'POST' && isset($_GET['id']))) {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    // Fallback ambil ID dari URL path
    if (!$id) {
        $uri_parts = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
        $id = end($uri_parts);
    }

    if (!$id) {
        wp_send_json_error(['message' => 'ID Transaksi tidak ditemukan'], 400);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    $data = [
        'transaction_date' => isset($input['date']) ? sanitize_text_field($input['date']) : date('Y-m-d'),
        'type'             => sanitize_text_field($input['type']),
        'category'         => sanitize_text_field($input['category']),
        'title'            => sanitize_text_field($input['title']),
        'amount'           => floatval($input['amount']),
        'description'      => isset($input['description']) ? sanitize_textarea_field($input['description']) : '',
        'reference_number' => isset($input['reference_number']) ? sanitize_text_field($input['reference_number']) : '',
        
        // FIX: Sama seperti diatas, gunakan pengecekan
        'booking_id'       => !empty($input['booking_id']) ? intval($input['booking_id']) : null,
        'related_id'       => !empty($input['related_id']) ? intval($input['related_id']) : null,
        'related_name'     => !empty($input['related_name']) ? sanitize_text_field($input['related_name']) : '',
        'proof_file'       => !empty($input['proof_file']) ? sanitize_text_field($input['proof_file']) : null,
    ];

    $updated = $wpdb->update($table_finance, $data, ['id' => $id]);

    if ($updated !== false) {
        wp_send_json_success(['message' => 'Transaksi diperbarui']);
    } else {
        wp_send_json_error(['message' => 'Gagal update database'], 500);
    }
}

// 4. DELETE
if ($method === 'DELETE') {
    $uri_parts = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
    $id = intval(end($uri_parts));
    
    if ($id) {
        $wpdb->delete($table_finance, ['id' => $id]);
        wp_send_json_success(['message' => 'Transaksi dihapus']);
    } else {
        wp_send_json_error(['message' => 'ID tidak valid'], 400);
    }
}