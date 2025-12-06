<?php

class UMH_API_Documents {

    public function register_routes() {
        // Endpoint untuk Generate Dokumen (HTML Preview)
        register_rest_route('umh/v1', '/documents/generate', [
            ['methods' => 'GET', 'callback' => [$this, 'generate_document'], 'permission_callback' => [$this, 'check_auth']],
        ]);
    }

    public function check_auth() { return is_user_logged_in(); }

    public function generate_document($request) {
        global $wpdb;
        $type = $request->get_param('type'); // receipt, passport_rec, leave_permit, payment_history
        $id = $request->get_param('id'); // Booking ID atau Jamaah ID
        
        if (!$type || !$id) return new WP_Error('missing_params', 'Parameter tidak lengkap', ['status' => 400]);

        // Ambil Data Utama (Booking & Jamaah)
        $booking = $wpdb->get_row($wpdb->prepare("
            SELECT b.*, d.departure_date, p.name as package_name, 
                   j.full_name, j.passport_number, j.nik, j.address, j.gender
            FROM {$wpdb->prefix}umh_bookings b
            JOIN {$wpdb->prefix}umh_departures d ON b.departure_id = d.id
            JOIN {$wpdb->prefix}umh_packages p ON d.package_id = p.id
            JOIN {$wpdb->prefix}umh_booking_passengers bp ON b.id = bp.booking_id
            JOIN {$wpdb->prefix}umh_jamaah j ON bp.jamaah_id = j.id
            WHERE b.id = %d LIMIT 1
        ", $id));

        if (!$booking) return new WP_Error('not_found', 'Data booking tidak ditemukan', ['status' => 404]);

        // Ambil Data Pembayaran (Untuk Kwitansi/Riwayat)
        $payments = $wpdb->get_results($wpdb->prepare("
            SELECT * FROM {$wpdb->prefix}umh_finance 
            WHERE reference_id = %d AND category = 'pembayaran_booking' 
            ORDER BY transaction_date ASC
        ", $id));

        $html_content = "";

        switch ($type) {
            case 'receipt':
                $html_content = $this->template_receipt($booking, $payments);
                break;
            case 'payment_history':
                $html_content = $this->template_payment_history($booking, $payments);
                break;
            case 'passport_rec':
                $html_content = $this->template_passport_recommendation($booking);
                break;
            case 'leave_permit':
                $html_content = $this->template_leave_permit($booking);
                break;
            default:
                return new WP_Error('invalid_type', 'Tipe dokumen tidak dikenal', ['status' => 400]);
        }

        // Return HTML Wrapper
        $final_html = "
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cetak Dokumen - {$type}</title>
            <style>
                body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; background: #fff; }
                .container { width: 100%; max-width: 800px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 18pt; font-weight: bold; text-transform: uppercase; }
                .header p { margin: 2px 0; font-size: 10pt; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                table th, table td { padding: 8px; border: 1px solid #000; text-align: left; }
                .no-border td { border: none; padding: 4px 0; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .signature { margin-top: 50px; text-align: right; }
                .signature-box { display: inline-block; width: 200px; text-align: center; }
                .signature-line { margin-top: 60px; border-top: 1px solid #000; }
                @media print { body { -webkit-print-color-adjust: exact; } }
            </style>
        </head>
        <body onload='window.print()'>
            <div class='container'>
                <div class='header'>
                    <h1>PT. TRAVEL UMROH AMANAH</h1>
                    <p>Izin Umroh No. 123/2024 | Izin Haji No. 456/2024</p>
                    <p>Jl. Jendral Sudirman No. 99, Jakarta Selatan, Indonesia</p>
                    <p>Telp: (021) 1234-5678 | Email: info@travelumroh.com</p>
                </div>
                {$html_content}
            </div>
        </body>
        </html>";

        return rest_ensure_response(['html' => $final_html]);
    }

    // --- TEMPLATES ---

    private function template_receipt($data, $payments) {
        // Ambil pembayaran terakhir atau total
        $total_paid = 0;
        foreach($payments as $p) $total_paid += $p->amount;
        $terbilang = $this->terbilang($total_paid) . " Rupiah";

        return "
            <h2 class='text-center' style='text-decoration: underline;'>KWITANSI PEMBAYARAN</h2>
            <p class='text-center'>No. Ref: KW/{$data->booking_code}/".date('Ymd')."</p>
            <br/>
            <table class='no-border'>
                <tr><td width='30%'>Telah terima dari</td><td>: <strong>{$data->full_name}</strong></td></tr>
                <tr><td>Uang Sejumlah</td><td style='background:#eee; font-style:italic;'>: {$terbilang}</td></tr>
                <tr><td>Guna Pembayaran</td><td>: Paket Umroh {$data->package_name} ({$data->duration_days} Hari)</td></tr>
                <tr><td>Keberangkatan</td><td>: ".date('d F Y', strtotime($data->departure_date))."</td></tr>
            </table>
            <br/>
            <h3>Total: Rp " . number_format($total_paid, 0, ',', '.') . "</h3>
            <div class='signature'>
                <div class='signature-box'>
                    Jakarta, " . date('d F Y') . "<br/>
                    Finance Dept.
                    <div class='signature-line'></div>
                    ( Stempel & Tanda Tangan )
                </div>
            </div>
        ";
    }

    private function template_payment_history($data, $payments) {
        $rows = "";
        $total = 0;
        $i = 1;
        foreach ($payments as $p) {
            $total += $p->amount;
            $rows .= "<tr>
                <td class='text-center'>{$i}</td>
                <td>".date('d/m/Y', strtotime($p->transaction_date))."</td>
                <td>{$p->title}</td>
                <td>{$p->type}</td>
                <td class='text-right'>Rp ".number_format($p->amount, 0, ',', '.')."</td>
            </tr>";
            $i++;
        }

        $sisa = $data->total_price - $total;
        $status_lunas = $sisa <= 0 ? "<span style='color:green; font-weight:bold;'>LUNAS</span>" : "<span style='color:red;'>BELUM LUNAS</span>";

        return "
            <h2 class='text-center'>RIWAYAT PEMBAYARAN</h2>
            <table class='no-border'>
                <tr><td width='20%'>Nama Jamaah</td><td>: {$data->full_name}</td></tr>
                <tr><td>Kode Booking</td><td>: {$data->booking_code}</td></tr>
                <tr><td>Paket</td><td>: {$data->package_name}</td></tr>
                <tr><td>Total Tagihan</td><td>: Rp ".number_format($data->total_price, 0, ',', '.')."</td></tr>
            </table>
            <br/>
            <table>
                <thead>
                    <tr style='background:#f0f0f0;'>
                        <th width='5%' class='text-center'>No</th>
                        <th width='15%'>Tanggal</th>
                        <th>Keterangan</th>
                        <th width='15%'>Metode</th>
                        <th width='20%' class='text-right'>Jumlah</th>
                    </tr>
                </thead>
                <tbody>{$rows}</tbody>
                <tfoot>
                    <tr>
                        <td colspan='4' class='text-right bold'>Total Terbayar</td>
                        <td class='text-right bold'>Rp ".number_format($total, 0, ',', '.')."</td>
                    </tr>
                    <tr>
                        <td colspan='4' class='text-right bold'>Sisa Tagihan</td>
                        <td class='text-right bold'>Rp ".number_format($sisa > 0 ? $sisa : 0, 0, ',', '.')."</td>
                    </tr>
                </tfoot>
            </table>
            <p>Status Pembayaran: {$status_lunas}</p>
        ";
    }

    private function template_passport_recommendation($data) {
        return "
            <h2 class='text-center' style='text-decoration: underline;'>SURAT REKOMENDASI</h2>
            <p class='text-center'>Nomor: Rec/{$data->booking_code}/IM/".date('Y')."</p>
            <br/>
            <p>Kepada Yth,<br/><strong>Kepala Kantor Imigrasi</strong><br/>Di Tempat</p>
            <br/>
            <p>Dengan hormat,</p>
            <p>Yang bertanda tangan di bawah ini, Direktur PT. Travel Umroh Amanah, menerangkan bahwa:</p>
            <table class='no-border' style='margin-left: 20px;'>
                <tr><td width='30%'>Nama Lengkap</td><td>: <strong>{$data->full_name}</strong></td></tr>
                <tr><td>NIK (KTP)</td><td>: {$data->nik}</td></tr>
                <tr><td>Jenis Kelamin</td><td>: ".($data->gender == 'L' ? 'Laki-laki' : 'Perempuan')."</td></tr>
                <tr><td>Alamat</td><td>: {$data->address}</td></tr>
            </table>
            <p>Adalah benar calon jamaah Umroh yang telah terdaftar di travel kami dan dijadwalkan akan berangkat pada tanggal <strong>".date('d F Y', strtotime($data->departure_date))."</strong>.</p>
            <p>Surat ini dibuat sebagai persyaratan pengurusan/pembuatan Paspor Baru/Perpanjangan untuk keperluan Ibadah Umroh.</p>
            <p>Demikian surat rekomendasi ini kami buat untuk dipergunakan sebagaimana mestinya.</p>
            <br/>
            <div class='signature'>
                <div class='signature-box'>
                    Jakarta, " . date('d F Y') . "<br/>
                    Hormat Kami,
                    <div class='signature-line' style='margin-top:80px;'></div>
                    <strong>Direktur Utama</strong>
                </div>
            </div>
        ";
    }

    private function template_leave_permit($data) {
        return "
            <h2 class='text-center' style='text-decoration: underline;'>SURAT PERMOHONAN IZIN CUTI</h2>
            <br/>
            <p>Jakarta, ".date('d F Y')."</p>
            <p>Kepada Yth,<br/><strong>HRD / Pimpinan Perusahaan</strong><br/>Di Tempat</p>
            <br/>
            <p>Perihal: <strong>Permohonan Izin Cuti Ibadah Umroh</strong></p>
            <br/>
            <p>Dengan hormat,</p>
            <p>Kami dari PT. Travel Umroh Amanah selaku penyelenggara perjalanan ibadah Umroh, menerangkan bahwa:</p>
            <table class='no-border' style='margin-left: 20px;'>
                <tr><td width='30%'>Nama Jamaah</td><td>: <strong>{$data->full_name}</strong></td></tr>
                <tr><td>No. Paspor/KTP</td><td>: {$data->passport_number} / {$data->nik}</td></tr>
            </table>
            <p>Telah terdaftar sebagai jamaah Umroh keberangkatan tanggal <strong>".date('d F Y', strtotime($data->departure_date))."</strong> dengan durasi perjalanan selama <strong>{$data->duration_days} Hari</strong>.</p>
            <p>Sehubungan dengan hal tersebut, kami mohon kiranya Bapak/Ibu Pimpinan dapat memberikan izin cuti kepada yang bersangkutan untuk menunaikan ibadah Umroh.</p>
            <p>Demikian surat keterangan ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.</p>
            <br/>
            <div class='signature'>
                <div class='signature-box'>
                    Hormat Kami,
                    <div class='signature-line' style='margin-top:80px;'></div>
                    <strong>Admin Travel</strong>
                </div>
            </div>
        ";
    }

    private function terbilang($nilai) {
        $nilai = abs($nilai);
        $huruf = array("", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas");
        $temp = "";
        if ($nilai < 12) {
            $temp = " ". $huruf[$nilai];
        } else if ($nilai <20) {
            $temp = $this->terbilang($nilai - 10). " Belas";
        } else if ($nilai < 100) {
            $temp = $this->terbilang($nilai/10)." Puluh". $this->terbilang($nilai % 10);
        } else if ($nilai < 200) {
            $temp = " Seratus" . $this->terbilang($nilai - 100);
        } else if ($nilai < 1000) {
            $temp = $this->terbilang($nilai/100) . " Ratus" . $this->terbilang($nilai % 100);
        } else if ($nilai < 2000) {
            $temp = " Seribu" . $this->terbilang($nilai - 1000);
        } else if ($nilai < 1000000) {
            $temp = $this->terbilang($nilai/1000) . " Ribu" . $this->terbilang($nilai % 1000);
        } else if ($nilai < 1000000000) {
            $temp = $this->terbilang($nilai/1000000) . " Juta" . $this->terbilang($nilai % 1000000);
        }
        return $temp;
    }
}