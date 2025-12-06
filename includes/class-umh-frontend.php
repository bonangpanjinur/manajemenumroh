<?php

class UMH_Frontend {

    public function init() {
        add_shortcode('umroh_app', [$this, 'render_app']);
        // Hook untuk membuang style bawaan tema jika di halaman app
        add_action('wp_enqueue_scripts', [$this, 'dequeue_theme_styles'], 99);
    }

    public function dequeue_theme_styles() {
        global $post;
        if ($post && has_shortcode($post->post_content, 'umroh_app')) {
            // Opsional: Hilangkan CSS tema agar tidak konflik dengan Tailwind
            // wp_dequeue_style('twentytwentyfour-style'); 
        }
    }

    public function render_app($atts) {
        // PERUBAHAN: Tidak ada cek login di PHP.
        // Biarkan React yang menangani Login via API.
        
        $asset_file = include(UMH_PLUGIN_DIR . 'build/index.asset.php');

        wp_enqueue_script(
            'umh-frontend-app',
            UMH_PLUGIN_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );

        wp_enqueue_style(
            'umh-frontend-style',
            UMH_PLUGIN_URL . 'build/index.css',
            [],
            $asset_file['version']
        );

        wp_localize_script('umh-frontend-app', 'umhSettings', [
            'root' => esc_url_raw(rest_url()),
            'nonce' => wp_create_nonce('wp_rest'),
            'siteUrl' => get_site_url(),
            'logoUrl' => UMH_PLUGIN_URL . 'assets/images/logo.png', // Siapkan logo
            'isFrontend' => true
        ]);

        // Return Container. 
        // Style 'fixed inset-0 z-50' akan membuat aplikasi menutupi seluruh halaman website
        // seolah-olah website tema tidak ada.
        return '<div id="umh-admin-app" class="umh-fullscreen-app"></div>
        <style>
            /* Paksa Fullscreen & Timpa Tema */
            body, html { margin: 0; padding: 0; overflow-x: hidden; }
            .umh-fullscreen-app {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: #f3f4f6; z-index: 99999; overflow-y: auto;
            }
            /* Sembunyikan Admin Bar jika user WP login */
            #wpadminbar { display: none !important; }
            html { margin-top: 0 !important; }
        </style>';
    }
}