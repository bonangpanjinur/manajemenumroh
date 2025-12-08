<?php
/**
 * Template untuk merender React App di halaman Admin Dashboard.
 * File ini dimuat oleh fungsi di class-umh-crud-controller.php
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<!-- 
  Kontainer utama aplikasi React.
  ID ini (umroh-manager-app) harus cocok dengan target render di src/index.jsx 
-->
<div id="umroh-manager-app">
    <!-- 
      State Loading Awal (Fallback HTML).
      Tampil sebentar sebelum React script dimuat & dijalankan browser.
    -->
    <div style="
        display: flex; 
        flex-direction: column;
        justify-content: center; 
        align-items: center; 
        height: 100vh; 
        width: 100%;
        background-color: #f9fafb;
        color: #6b7280;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    ">
        <!-- SVG Spinner Sederhana -->
        <svg style="animation: spin 1s linear infinite; width: 40px; height: 40px; margin-bottom: 16px; color: #2563eb;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p style="font-size: 1rem; font-weight: 500;">Memuat Dashboard Umrah...</p>
    </div>
</div>

<style>
    /* Definisi animasi spinner */
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    
    /* Inline CSS Reset Penting:
       Memastikan body WordPress langsung reset sebelum file CSS eksternal selesai dimuat 
       agar tidak ada efek "loncat" (Layout Shift).
    */
    html, body { 
        height: 100%; 
        margin: 0; 
        padding: 0; 
        overflow: hidden; /* Mencegah scrollbar ganda dari WP */
    }
</style>