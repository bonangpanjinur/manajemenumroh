<?php
if (!defined('ABSPATH')) exit;

class UMH_Login_Customizer {

    public function __construct() {
        add_action('login_enqueue_scripts', [$this, 'custom_login_css']);
        add_filter('login_headerurl', [$this, 'custom_login_url']);
        add_filter('login_headertext', [$this, 'custom_login_title']);
    }

    public function custom_login_css() {
        // Ganti URL ini dengan URL logo travel Anda yang sebenarnya
        $logo_url = UMH_PLUGIN_URL . 'assets/images/logo.png'; 
        // Background login
        $bg_url = UMH_PLUGIN_URL . 'assets/images/login-bg.jpg';

        ?>
        <style type="text/css">
            body.login {
                background-image: url('<?php echo esc_url($bg_url); ?>');
                background-size: cover;
                background-position: center;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
            }
            body.login::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0, 0, 0, 0.5); /* Overlay gelap */
                z-index: -1;
            }
            #login {
                background: #fff;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                width: 100%;
                max-width: 400px;
                margin: auto;
            }
            .login h1 a {
                background-image: url('<?php echo esc_url($logo_url); ?>');
                background-size: contain;
                width: 100%;
                height: 80px;
                margin-bottom: 20px;
            }
            .wp-core-ui .button-primary {
                background: #2563eb !important;
                border-color: #2563eb !important;
                width: 100%;
                margin-top: 15px;
                padding: 6px 0;
                font-size: 16px;
                border-radius: 6px;
            }
            .login #backtoblog, .login #nav { text-align: center; }
            .login #backtoblog a, .login #nav a { color: #fff !important; }
        </style>
        <?php
    }

    public function custom_login_url() { return home_url(); }
    public function custom_login_title() { return get_bloginfo('name'); }
}

new UMH_Login_Customizer();
