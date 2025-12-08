<?php
/**
 * Template Dashboard React - FIX
 * Pastikan ID container sesuai dengan yang dicari React (src/index.jsx)
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<!-- CONTAINER UTAMA - JANGAN DIUBAH ID-NYA -->
<div id="umroh-manager-app">
    <!-- Loading State Awal (Sebelum React Masuk) -->
    <div style="display: flex; height: 100vh; width: 100vw; justify-content: center; align-items: center; background-color: #f3f4f6;">
        <div style="text-align: center;">
            <svg style="animation: spin 1s linear infinite; width: 50px; height: 50px; color: #2563eb; margin: 0 auto 15px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 style="color: #4b5563; font-family: sans-serif; font-size: 16px;">Memuat Aplikasi...</h3>
        </div>
    </div>
</div>

<!-- FORCE STYLE UNTUK MENIMPA TAMPILAN WP (CADANGAN JIKA JS GAGAL) -->
<style>
    @keyframes spin { 100% { transform: rotate(360deg); } }
    
    /* Pastikan Container Tampil */
    #umroh-manager-app {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 999999;
        background: #f3f4f6;
    }
    
    /* Sembunyikan UI WP Standard */
    #wpadminbar, #adminmenumain, #wpfooter { display: none !important; }
    html, body { margin: 0; padding: 0; overflow: hidden; }
</style>