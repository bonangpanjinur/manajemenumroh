<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_Marketing_API {
    public function __construct() {
        // ==========================================
        // 1. KAMPANYE IKLAN (marketing-campaigns)
        // ==========================================
        $campaign_schema = [
            'title'      => ['type' => 'string', 'required' => true],
            'platform'   => ['type' => 'string'], 
            'budget'     => ['type' => 'number'],
            'start_date' => ['type' => 'string', 'format' => 'date'],
            'end_date'   => ['type' => 'string', 'format' => 'date'],
            'ad_link'    => ['type' => 'string'],
            'status'     => ['type' => 'string', 'default' => 'active']
        ];
        
        // FIX: Gunakan 'marketing-campaigns' (tanda hubung)
        new UMH_CRUD_Controller('marketing-campaigns', 'umh_marketing', $campaign_schema, 
            [
                'get_items'   => ['owner', 'administrator', 'marketing_staff', 'admin_staff'], 
                'create_item' => ['owner', 'administrator', 'marketing_staff'],
                'update_item' => ['owner', 'administrator', 'marketing_staff'],
                'delete_item' => ['owner', 'administrator']
            ]
        );

        // ==========================================
        // 2. LEADS / CALON JEMAAH (marketing-leads)
        // ==========================================
        $leads_schema = [
            'name'           => ['type' => 'string', 'required' => true],
            'phone'          => ['type' => 'string', 'required' => true],
            'email'          => ['type' => 'string'],
            'source'         => ['type' => 'string'], 
            'status'         => ['type' => 'string', 'default' => 'new'], 
            'notes'          => ['type' => 'string'], 
            'follow_up_date' => ['type' => 'string', 'format' => 'date'],
            'assigned_to'    => ['type' => 'integer'] 
        ];

        // FIX: Gunakan 'marketing-leads' (tanda hubung)
        new UMH_CRUD_Controller('marketing-leads', 'umh_leads', $leads_schema,
            [
                'get_items'   => ['owner', 'administrator', 'marketing_staff', 'admin_staff'], 
                'create_item' => ['owner', 'administrator', 'marketing_staff', 'admin_staff'], 
                'update_item' => ['owner', 'administrator', 'marketing_staff', 'admin_staff'],
                'delete_item' => ['owner', 'administrator', 'marketing_staff']
            ]
        );
    }
}
new UMH_Marketing_API();