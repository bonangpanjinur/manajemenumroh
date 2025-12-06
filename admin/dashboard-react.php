<?php
/**
 * File: admin/dashboard-react.php
 * Deskripsi: Container HTML untuk React App.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>

<div class="wrap">
    <!-- FIX: ID harus 'umh-admin-root' agar cocok dengan src/index.jsx -->
    <div id="umh-admin-root">
        <!-- Tampilan Loading (Skeleton) sebelum React siap -->
        <div style="
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 80vh; 
            flex-direction: column;
            font-family: sans-serif;
            color: #64748b;
        ">
            <svg style="width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 20px;" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24">
                <circle style="opacity: 0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path style="opacity: 0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 style="font-weight: 500;">Memuat Sistem Umroh Manager...</h3>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
        </div>
    </div>
</div>