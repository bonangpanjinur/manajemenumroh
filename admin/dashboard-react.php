<?php
/**
 * File: admin/dashboard-react.php
 */

if (!defined('ABSPATH')) {
    exit;
}

function umroh_manager_render_dashboard_react() {
    // Tambahkan class khusus ke body agar CSS immersive aktif
    echo '<script>document.body.classList.add("umroh-manager-page");</script>';
    ?>
    <div class="wrap" style="margin: 0; padding: 0;">
        <div id="umh-app-root">
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f3f4f6;">
                <div style="text-align: center;">
                    <h3 style="margin-bottom: 10px; font-family: sans-serif; color: #4b5563;">Memuat Sistem...</h3>
                    <div class="spinner"></div>
                </div>
            </div>
        </div>
    </div>
    <?php
}