<?php
/**
 * Template untuk merender React App di halaman Admin Dashboard.
 * Mode: Immersive / Full Screen Overlay
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<!-- 
  Container Utama. 
  CSS di admin-style.css akan membuatnya fullscreen menutupi UI WordPress.
-->
<div id="umroh-manager-app">
    <!-- 
      Loading Spinner (Tampil sebentar sebelum React dimuat).
      Desain minimalis & bersih.
    -->
    <div style="
        display: flex; 
        flex-direction: column;
        justify-content: center; 
        align-items: center; 
        height: 100%; 
        width: 100%;
        background-color: #f3f4f6;
        color: #6b7280;
        font-family: sans-serif;
    ">
        <svg style="animation: spin 1s linear infinite; width: 48px; height: 48px; color: #2563eb; margin-bottom: 16px;" fill="none" viewBox="0 0 24 24">
            <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p style="font-size: 0.875rem; font-weight: 500;">Memuat Aplikasi...</p>
    </div>
</div>

<style>
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>