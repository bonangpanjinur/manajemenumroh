<?php

class UMH_Notification {

    /**
     * Kirim Notifikasi WhatsApp (Simulasi / Placeholder Integrasi)
     */
    public static function send_wa($phone, $message) {
        // Normalisasi nomor HP (0812 -> 62812)
        $phone = preg_replace('/^0/', '62', $phone);
        
        // --- TEMPAT INTEGRASI VENDOR WA ---
        // Di sini nanti Anda letakkan cURL ke API Vendor (Fonnte/Wablas/dll)
        // Contoh Logika:
        /*
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, "https://api.whatsapp-gateway.com/send");
        curl_setopt($curl, CURLOPT_POSTFIELDS, [
            'target' => $phone,
            'message' => $message
        ]);
        curl_exec($curl);
        */

        // Untuk sekarang, kita simpan di log WordPress agar bisa di-debug
        error_log("[WA SENT to $phone]: $message");
        
        return true;
    }

    public static function notify_booking_created($booking_data) {
        $msg = "Assalamu'alaikum, {$booking_data['name']}.\n\n";
        $msg .= "Alhamdulillah, pendaftaran Umroh Anda telah kami terima.\n";
        $msg .= "Kode Booking: *{$booking_data['code']}*\n";
        $msg .= "Paket: {$booking_data['package']}\n";
        $msg .= "Mohon segera lakukan pembayaran DP agar kursi Anda aman.\n\n";
        $msg .= "- Manajemen Travel Umroh Amanah -";

        self::send_wa($booking_data['phone'], $msg);
    }

    public static function notify_payment_received($payment_data) {
        $msg = "Terima Kasih, {$payment_data['name']}.\n\n";
        $msg .= "Pembayaran sebesar *Rp " . number_format($payment_data['amount'],0,',','.') . "* telah kami verifikasi.\n";
        $msg .= "Sisa Tagihan: Rp " . number_format($payment_data['balance'],0,',','.') . "\n\n";
        $msg .= "Semoga Allah lancarkan rezeki Anda.";

        self::send_wa($payment_data['phone'], $msg);
    }
}