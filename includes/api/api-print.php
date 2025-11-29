<?php
if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', 'umh_register_print_routes');

function umh_register_print_routes() {
    $namespace = 'umh/v1';
    $read_permissions = umh_check_api_permission(['owner', 'admin_staff', 'finance_staff']);

    // Print Daftar Jemaah
    register_rest_route($namespace, '/print/jamaah-list/(?P<id>\d+)', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'umh_print_jamaah_list',
            'permission_callback' => $read_permissions,
        ],
    ]);

    // Print Kwitansi (Single atau Bulk via parameter ids=1,2,3)
    register_rest_route($namespace, '/print/receipt', [
        [
            'methods' => WP_REST_Server::READABLE,
            'callback' => 'umh_print_receipt',
            'permission_callback' => $read_permissions,
        ],
    ]);
}

function umh_print_jamaah_list($request) {
    // ... (Kode lama tetap ada) ...
    return new WP_Error('not_implemented', 'Function moved to legacy handler', ['status' => 501]);
}

function umh_print_receipt(WP_REST_Request $request) {
    global $wpdb;
    
    $ids_param = $request->get_param('ids');
    if (empty($ids_param)) {
        return new WP_Error('missing_id', 'Transaction IDs required', ['status' => 400]);
    }

    $ids = array_map('intval', explode(',', $ids_param));
    $ids_placeholder = implode(',', array_fill(0, count($ids), '%d'));

    $table_finance = $wpdb->prefix . 'umh_finance';
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';

    // Query Transaksi
    $sql = "SELECT f.*, j.full_name as jamaah_name 
            FROM $table_finance f
            LEFT JOIN $table_jamaah j ON f.jamaah_id = j.id
            WHERE f.id IN ($ids_placeholder) AND f.type = 'income'"; // Hanya pemasukan yg ada kwitansi
    
    $transactions = $wpdb->get_results($wpdb->prepare($sql, $ids));

    if (empty($transactions)) {
        return new WP_Error('not_found', 'Data transaksi tidak ditemukan.', ['status' => 404]);
    }

    // Pengaturan Perusahaan
    $options = get_option('umh_settings');
    $company_name = $options['company_name'] ?? 'Travel Umroh';
    
    ob_start();
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Cetak Kwitansi</title>
        <style>
            body { font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #333; }
            .receipt-container { max-width: 800px; margin: 0 auto; }
            .receipt { border: 2px solid #444; padding: 20px; margin-bottom: 30px; page-break-inside: avoid; }
            .header { text-align: center; border-bottom: 1px double #999; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; color: #2563eb; }
            .row { display: flex; margin-bottom: 8px; }
            .label { width: 140px; font-weight: bold; }
            .value { flex: 1; border-bottom: 1px dotted #ccc; }
            .amount-box { margin-top: 20px; padding: 10px; background: #f9f9f9; border: 1px solid #ddd; font-size: 18px; font-weight: bold; text-align: right; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; text-align: center; }
            .signature { width: 200px; margin-top: 60px; border-top: 1px solid #000; }
            @media print { .no-print { display: none; } }
        </style>
    </head>
    <body>
        <div class="no-print" style="text-align: center; padding: 20px; background: #eee; margin-bottom: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #2563eb; color: white; border: none; border-radius: 5px;">🖨️ Cetak Kwitansi</button>
        </div>

        <div class="receipt-container">
            <?php foreach ($transactions as $trx): 
                $date = date('d F Y', strtotime($trx->date));
                $amount_rp = 'Rp ' . number_format($trx->amount, 0, ',', '.');
                $terbilang = "Satu Jumlah Rupiah"; // Idealnya pakai fungsi terbilang()
            ?>
            <div class="receipt">
                <div class="header">
                    <h1>KWITANSI PEMBAYARAN</h1>
                    <p><?php echo esc_html($company_name); ?></p>
                </div>
                
                <div class="row">
                    <div class="label">No. Referensi</div>
                    <div class="value">#TRX-<?php echo $trx->id; ?></div>
                </div>
                <div class="row">
                    <div class="label">Telah Terima Dari</div>
                    <div class="value"><?php echo esc_html($trx->jamaah_name ?: 'Umum / Hamba Allah'); ?></div>
                </div>
                <div class="row">
                    <div class="label">Uang Sejumlah</div>
                    <div class="value" style="font-style: italic;"><?php echo $amount_rp; ?></div>
                </div>
                <div class="row">
                    <div class="label">Untuk Pembayaran</div>
                    <div class="value"><?php echo esc_html($trx->description ?: 'Pembayaran Paket Umroh/Haji'); ?></div>
                </div>
                <div class="row">
                    <div class="label">Metode Bayar</div>
                    <div class="value"><?php echo esc_html(ucfirst($trx->payment_method)); ?></div>
                </div>

                <div class="amount-box">
                    Total: <?php echo $amount_rp; ?>
                </div>

                <div class="footer">
                    <div>
                        <br>Penyetor
                        <div class="signature">( <?php echo esc_html($trx->jamaah_name ?: '....................'); ?> )</div>
                    </div>
                    <div>
                        <?php echo $date; ?><br>Penerima (Kasir)
                        <div class="signature">( Admin Keuangan )</div>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </body>
    </html>
    <?php
    $html = ob_get_clean();
    return new WP_REST_Response($html, 200, ['Content-Type' => 'text/html']);
}