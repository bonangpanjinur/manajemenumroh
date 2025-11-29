<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Jamaah_API extends UMH_CRUD_Controller {
    
    public function __construct() {
        parent::__construct('jamaah', 'umh_jamaah', [
            'registration_number' => ['type' => 'string'],
            'full_name' => ['type' => 'string', 'required' => true],
            'nik' => ['type' => 'string'],
            'passport_number' => ['type' => 'string'],
            'phone' => ['type' => 'string'],
            'package_id' => ['type' => 'integer'],
            'agent_id' => ['type' => 'integer'],
            'package_price' => ['type' => 'number'], // Harga Deal
            'status' => ['type' => 'string', 'default' => 'registered'],
        ]);
    }

    // OVERRIDE get_items untuk menyisipkan Data Pembayaran & Nama Paket
    public function get_items($request) {
        global $wpdb;
        
        // Cek permission standar
        if (!$this->check_permission($request)) {
            return new WP_Error('rest_forbidden', __('Sorry, you are not allowed to do that.'), ['status' => 401]);
        }

        $table_name = $this->table_name;
        $table_packages = $wpdb->prefix . 'umh_packages';
        $table_finance = $wpdb->prefix . 'umh_finance';
        $table_agents = $wpdb->prefix . 'umh_agents';

        // Query Utama dengan JOIN untuk ambil nama paket & agen
        // Serta SUBQUERY untuk menghitung total pembayaran (total_paid)
        $sql = "SELECT j.*, 
                p.name as package_name, 
                a.name as agent_name,
                (
                    SELECT COALESCE(SUM(amount), 0) 
                    FROM $table_finance f 
                    WHERE f.jamaah_id = j.id 
                    AND f.type = 'income'
                ) as total_paid
                FROM $table_name j
                LEFT JOIN $table_packages p ON j.package_id = p.id
                LEFT JOIN $table_agents a ON j.agent_id = a.id
                WHERE 1=1";

        // Filter status jika ada
        if ($request->get_param('status')) {
            $status = sanitize_text_field($request->get_param('status'));
            $sql .= $wpdb->prepare(" AND j.status = %s", $status);
        }

        $sql .= " ORDER BY j.created_at DESC";

        $results = $wpdb->get_results($sql, ARRAY_A);

        // Post-processing: Hitung Sisa & Tentukan Status Lunas
        foreach ($results as &$row) {
            $price = floatval($row['package_price']);
            $paid = floatval($row['total_paid']);
            $row['remaining_payment'] = $price - $paid;
            
            // Logika Status Pembayaran
            if ($price > 0 && $row['remaining_payment'] <= 0) {
                $row['payment_status_label'] = 'Lunas';
            } elseif ($paid > 0) {
                $row['payment_status_label'] = 'Dicicil';
            } else {
                $row['payment_status_label'] = 'Belum Bayar';
            }
        }

        return rest_ensure_response($results);
    }
}
new UMH_Jamaah_API();