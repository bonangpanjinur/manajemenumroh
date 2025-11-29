<?php
// File: includes/api/api-tasks.php
// Menggunakan CRUD Controller untuk mengelola Tugas.

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// 1. Definisikan Skema Data (cocokkan dengan db-schema.php)
$tasks_schema = [
    'assigned_to_user_id' => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
    'created_by_user_id'  => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'], // Akan diisi otomatis
    'jamaah_id'           => ['type' => 'integer', 'required' => false, 'sanitize_callback' => 'absint'],
    'title'               => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
    'description'         => ['type' => 'string', 'required' => false, 'sanitize_callback' => 'sanitize_textarea_field'],
    'due_date'            => ['type' => 'string', 'format' => 'date', 'required' => false, 'sanitize_callback' => 'sanitize_text_field'],
    'status'              => ['type' => 'string', 'required' => false, 'default' => 'pending', 'enum' => ['pending', 'in_progress', 'completed']],
    'priority'            => ['type' => 'string', 'required' => false, 'default' => 'medium', 'enum' => ['low', 'medium', 'high']],
];

// 2. Definisikan Izin (Siapa boleh ngapain?)
$tasks_permissions = [
    // Semua staf bisa melihat tugas
    'get_items'    => ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'],
    'get_item'     => ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'],
    // Hanya owner dan admin_staff yang bisa membuat tugas baru
    'create_item'  => ['owner', 'admin_staff'],
    // Siapapun bisa update tugas (misal: update status)
    'update_item'  => ['owner', 'admin_staff', 'finance_staff', 'marketing_staff', 'hr_staff'],
    // Hanya owner yang bisa menghapus
    'delete_item'  => ['owner'],
];

// 3. Inisialisasi Controller
// Parameter: ('endpoint_base', 'slug_tabel_db', $skema, $izin)
new UMH_CRUD_Controller('tasks', 'umh_tasks', $tasks_schema, $tasks_permissions);