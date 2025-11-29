<?php
/**
 * Template untuk merender aplikasi React
 * Pastikan ID div di bawah ini SAMA PERSIS dengan document.getElementById di src/index.jsx
 */
?>
<div class="wrap">
    <!-- Judul Halaman Bawaan WordPress (Opsional, bisa dihapus jika React punya Header sendiri) -->
    <h1 class="wp-heading-inline">Manajemen Umrah & Haji</h1>
    
    <!-- INI ADALAH KONTAINER UTAMA REACT -->
    <!-- React akan me-render seluruh aplikasi di dalam div ini -->
    <div id="umroh-manager-app">
        <!-- Loading state sebelum React mengambil alih -->
        <div style="padding: 20px; text-align: center; color: #666;">
            <h3>Memuat Aplikasi...</h3>
            <p>Mohon tunggu sebentar, sedang menyiapkan dashboard.</p>
        </div>
    </div>
</div>