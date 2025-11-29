<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Marketing_API {
    public function __construct() {
        // ==========================================
        // 1. KAMPANYE IKLAN (Campaigns)
        // ==========================================
        $campaign_schema = [
            'title'      => ['type' => 'string', 'required' => true],
            'platform'   => ['type' => 'string'], // Contoh: Facebook Ads, Instagram, Spanduk
            'budget'     => ['type' => 'number'],
            'start_date' => ['type' => 'string', 'format' => 'date'],
            'end_date'   => ['type' => 'string', 'format' => 'date'],
            'ad_link'    => ['type' => 'string'],
            'status'     => ['type' => 'string', 'default' => 'active'] // active, paused, completed
        ];
        
        new UMH_CRUD_Controller('marketing/campaigns', 'umh_marketing', $campaign_schema, 
            [
                'get_items'   => ['owner', 'administrator', 'marketing_staff', 'admin_staff'], 
                'create_item' => ['owner', 'administrator', 'marketing_staff'],
                'update_item' => ['owner', 'administrator', 'marketing_staff'],
                'delete_item' => ['owner', 'administrator']
            ]
        );

        // ==========================================
        // 2. LEADS (Data Calon Jemaah)
        // ==========================================
        $leads_schema = [
            'name'           => ['type' => 'string', 'required' => true],
            'phone'          => ['type' => 'string', 'required' => true],
            'email'          => ['type' => 'string'],
            'source'         => ['type' => 'string'], // ig, fb, walk_in, referral, website
            'status'         => ['type' => 'string', 'default' => 'new'], // new, contacted, interested, closed, junk
            'notes'          => ['type' => 'string'], // Catatan hasil percakapan
            'follow_up_date' => ['type' => 'string', 'format' => 'date'], // Tanggal rencana hubungi kembali
            'assigned_to'    => ['type' => 'integer'] // ID Staff yang ditugaskan follow up
        ];

        new UMH_CRUD_Controller('marketing/leads', 'umh_leads', $leads_schema,
            [
                'get_items'   => ['owner', 'administrator', 'marketing_staff', 'admin_staff'], 
                'create_item' => ['owner', 'administrator', 'marketing_staff', 'admin_staff'], // Admin staff jg bisa input tamu walk-in
                'update_item' => ['owner', 'administrator', 'marketing_staff', 'admin_staff'],
                'delete_item' => ['owner', 'administrator', 'marketing_staff']
            ]
        );
    }
}
new UMH_Marketing_API();