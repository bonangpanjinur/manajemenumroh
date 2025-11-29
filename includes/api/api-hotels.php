<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Hotels_API extends UMH_CRUD_Controller {
    public function __construct() {
        $schema = [
            'name'        => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            // Point 6: Pastikan type string biasa, bukan enum, agar bisa input kota custom
            'city'        => ['type' => 'string', 'required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'distance'    => ['type' => 'integer', 'description' => 'Jarak ke Masjid (meter)'],
            'rating'      => ['type' => 'string', 'default' => '5'],
            'address'     => ['type' => 'string', 'sanitize_callback' => 'sanitize_textarea_field'],
            'map_url'     => ['type' => 'string', 'sanitize_callback' => 'esc_url_raw'],
            'description' => ['type' => 'string', 'sanitize_callback' => 'sanitize_textarea_field'],
            'images'      => ['type' => 'string', 'description' => 'JSON array of image URLs']
        ];

        parent::__construct('hotels', 'umh_hotels', $schema, [
            'get_items' => ['public'], // Public access for packages display
            'create_item' => ['admin_staff', 'marketing_staff'],
            'update_item' => ['admin_staff', 'marketing_staff'],
            'delete_item' => ['admin_staff']
        ]);
    }
}
new UMH_Hotels_API();