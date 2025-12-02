<?php
if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Loader {
    public function __construct() {
        $this->load_api_files();
    }

    private function load_api_files() {
        $api_dir = plugin_dir_path(__FILE__) . 'api/';
        
        $files = [
            'api-masters.php',
            'api-jamaah.php',
            'api-packages.php',
            'api-package-categories.php',
            'api-departures.php',
            'api-flights.php',
            'api-hotels.php',
            'api-finance.php',
            'api-agents.php',
            'api-marketing.php', // Ensure this line exists!
            'api-logistics.php',
            'api-hr.php',
            'api-users.php',
            'api-roles.php',
            'api-tasks.php',
            'api-stats.php',
            'api-uploads.php',
            'api-export.php',
            'api-print.php',
            'api-flight-bookings.php',
            'api-hotel-bookings.php',
            'api-logs.php',
            'api-categories.php'
        ];

        foreach ($files as $file) {
            if (file_exists($api_dir . $file)) {
                require_once $api_dir . $file;
            }
        }
    }
}