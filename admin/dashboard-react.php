<?php
/**
 * Template Dashboard React - PRO VERSION
 * Tampilan Full Screen dengan Loader Animasi Modern
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<!-- CONTAINER UTAMA -->
<div id="umroh-manager-app">
    <!-- Pro Loader HTML -->
    <div class="umroh-loader-container">
        <div class="umroh-logo-animation">
            <!-- Icon Ka'bah Abstract -->
            <svg class="kaaba-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 10h20v11a1 1 0 01-1 1H3a1 1 0 01-1-1V10z" opacity="0.8"/>
                <path d="M2 7h20v2H2V7z" />
                <path d="M4 4h16v2H4V4z" opacity="0.6"/>
            </svg>
        </div>
        <div class="loading-bar-wrapper">
            <div class="loading-bar"></div>
        </div>
        <h3 class="loading-text">Memuat Sistem Manajemen Umrah...</h3>
        <p class="loading-subtext">Menyiapkan data jamaah dan jadwal keberangkatan</p>
    </div>
</div>

<style>
    /* Reset & Fullscreen Fix */
    html, body { 
        margin: 0 !important; 
        padding: 0 !important; 
        overflow: hidden !important; 
        height: 100vh !important; 
        background-color: #f8fafc !important; /* Slate-50 */
    }
    
    #wpadminbar, #adminmenumain, #wpfooter, #wpcontent { display: none !important; }

    #umroh-manager-app {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        z-index: 999999;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Loader Styling */
    .umroh-loader-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
    }

    .umroh-logo-animation {
        width: 80px;
        height: 80px;
        background: white;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        margin-bottom: 24px;
        animation: float 3s ease-in-out infinite;
    }

    .kaaba-icon {
        width: 48px;
        height: 48px;
        color: #0f172a; /* Slate-900 */
    }

    .loading-bar-wrapper {
        width: 200px;
        height: 6px;
        background: #e2e8f0;
        border-radius: 99px;
        overflow: hidden;
        margin-bottom: 16px;
    }

    .loading-bar {
        width: 50%;
        height: 100%;
        background: #2563eb; /* Blue-600 */
        border-radius: 99px;
        animation: loading 1.5s ease-in-out infinite;
    }

    .loading-text {
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
        margin: 0 0 8px 0;
    }

    .loading-subtext {
        font-size: 13px;
        color: #64748b;
        margin: 0;
    }

    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }

    @keyframes loading {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
    }
</style>