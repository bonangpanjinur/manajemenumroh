<?php
if (!defined('ABSPATH')) exit;

add_action('rest_api_init', function() {
    register_rest_route('umh/v1', '/print/receipt', [
        'methods' => 'GET',
        'callback' => 'umh_print_receipt_v2',
        'permission_callback' => '__return_true', // Bisa diakses via link (aman karena butuh ID valid)
    ]);
});

function umh_print_receipt_v2($request) {
    global $wpdb;
    $id = $request->get_param('ids');
    
    // Ambil detail transaksi dari tabel FINANCE baru
    $sql = "SELECT f.*, j.full_name as jamaah_name 
            FROM {$wpdb->prefix}umh_finance f
            LEFT JOIN {$wpdb->prefix}umh_jamaah j ON f.jamaah_id = j.id
            WHERE f.id = %d";
            
    $trx = $wpdb->get_row($wpdb->prepare($sql, $id));

    if (!$trx) return new WP_Error('not_found', 'Data transaksi tidak ditemukan', ['status' => 404]);

    // Template HTML Sederhana untuk Kwitansi
    $html = '
    <html>
    <head>
        <title>Kwitansi #'.$trx->id.'</title>
        <style>
            body { font-family: Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .box { border: 2px solid #333; padding: 30px; max-width: 700px; margin: auto; position: relative; }
            .header { text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 20px; }
            .row { display: flex; margin-bottom: 15px; }
            .label { width: 150px; font-weight: bold; }
            .value { flex: 1; border-bottom: 1px dotted #999; }
            .amount { font-size: 24px; font-weight: bold; text-align: right; margin-top: 30px; background: #eee; padding: 10px; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; }
            .sig { border-top: 1px solid #000; width: 200px; margin-top: 60px; }
        </style>
    </head>
    <body onload="window.print()">
        <div class="box">
            <div class="header">
                <h2>KWITANSI PEMBAYARAN</h2>
                <p>'.get_bloginfo('name').'</p>
            </div>
            <div class="row">
                <div class="label">No. Transaksi</div>
                <div class="value">#TRX-'.str_pad($trx->id, 6, '0', STR_PAD_LEFT).'</div>
            </div>
            <div class="row">
                <div class="label">Telah Terima Dari</div>
                <div class="value">'.($trx->jamaah_name ?: 'Umum / Kantor').'</div>
            </div>
            <div class="row">
                <div class="label">Untuk Pembayaran</div>
                <div class="value">'.($trx->description ?: $trx->category).'</div>
            </div>
            <div class="row">
                <div class="label">Tanggal</div>
                <div class="value">'.date('d F Y', strtotime($trx->transaction_date)).'</div>
            </div>
            <div class="amount">
                Rp '.number_format($trx->amount, 0, ',', '.').'
            </div>
            <div class="footer">
                <div>
                    <br>Penyetor
                    <div class="sig">'.($trx->jamaah_name ?: '..................').'</div>
                </div>
                <div>
                    Hormat Kami,<br>Admin Keuangan
                    <div class="sig">Stempel / Ttd</div>
                </div>
            </div>
        </div>
    </body>
    </html>';

    return new WP_REST_Response($html, 200, ['Content-Type' => 'text/html']);
}