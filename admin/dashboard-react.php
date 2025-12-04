<?php
/**
 * File: admin/dashboard-react.php
 * Deskripsi: File ini adalah "kanvas" kosong tempat React akan dimuat.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>

<div class="wrap">
    <!-- Penting: ID ini harus sama dengan document.getElementById di src/index.jsx -->
    <div id="umroh-manager-app">
        <!-- Tampilan Loading awal sebelum React mengambil alih -->
        <div style="display: flex; justify-content: center; align-items: center; height: 50vh; flex-direction: column;">
            <h2 style="color: #555;">Memuat Aplikasi Manajemen Umroh...</h2>
            <div class="spinner is-active" style="float: none; margin-top: 10px;"></div>
        </div>
    </div>
</div>