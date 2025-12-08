<?php
/**
 * Template Dashboard React
 * File ini dipanggil oleh class-umh-crud-controller.php
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<!-- CONTAINER UTAMA - TARGET MOUNT REACT -->
<div id="umroh-manager-app">
    <!-- Loader HTML (Tampil sebelum React siap) -->
    <div style="display: flex; height: 100vh; width: 100%; justify-content: center; align-items: center; background-color: #f3f4f6; color: #6b7280; flex-direction: column;">
        <svg style="animation: spin 1s linear infinite; width: 50px; height: 50px; color: #2563eb; margin-bottom: 20px;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 style="font-family: sans-serif; font-weight: 500;">Memuat Aplikasi Umrah...</h3>
    </div>
</div>

<style>
    @keyframes spin { 100% { transform: rotate(360deg); } }
    
    /* Paksa Full Screen sejak awal render PHP */
    html, body { margin: 0; padding: 0; overflow: hidden; height: 100vh; }
    #wpadminbar, #adminmenumain, #wpfooter { display: none !important; }
    #wpcontent { margin: 0 !important; padding: 0 !important; }
    
    #umroh-manager-app {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 999999;
        background-color: #f3f4f6;
    }
</style>