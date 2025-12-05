<?php
if (!defined('ABSPATH')) {
    exit;
}

class UMH_API_Loader {

    public function init() {
        add_action('rest_api_init', [$this, 'register_apis']);
    }

    public function register_apis() {
        // Load Base Controllers
        require_once UMH_PLUGIN_DIR . 'includes/class-umh-rest-api.php';
        require_once UMH_PLUGIN_DIR . 'includes/class-umh-crud-controller.php';

        // Load & Register All API Modules
        $controllers = [
            'includes/api/api-users.php'              => 'UMH_API_Users',
            'includes/api/api-roles.php'              => 'UMH_API_Roles',
            'includes/api/api-masters.php'            => 'UMH_API_Masters', // Settings
            'includes/api/api-package-categories.php' => 'UMH_API_PackageCategories',
            'includes/api/api-packages.php'           => 'UMH_API_Packages',
            'includes/api/api-departures.php'         => 'UMH_API_Departures', // Akan kita buat simple wrapper
            'includes/api/api-jamaah.php'             => 'UMH_API_Jamaah',
            'includes/api/api-bookings.php'           => 'UMH_API_Bookings',
            'includes/api/api-finance.php'            => 'UMH_API_Finance',
            'includes/api/api-uploads.php'            => 'UMH_API_Uploads',
            'includes/api/api-hr.php'                 => 'UMH_API_HR',
            'includes/api/api-tasks.php'              => 'UMH_API_Tasks',
            'includes/api/api-agents.php'             => 'UMH_API_Agents',
            'includes/api/api-logistics.php'          => 'UMH_API_Logistics',
            'includes/api/api-marketing.php'          => 'UMH_API_Marketing', // New
            'includes/api/api-stats.php'              => 'UMH_API_Stats',
            'includes/api/api-logs.php'               => 'UMH_API_Logs',
        ];

        foreach ($controllers as $file => $class) {
            if (file_exists(UMH_PLUGIN_DIR . $file)) {
                require_once UMH_PLUGIN_DIR . $file;
                if (class_exists($class)) {
                    $controller = new $class();
                    $controller->register_routes();
                }
            }
        }

        // Register Sub-Controllers untuk Master Data (Hotel & Airlines)
        // Pastikan class ini ada di api-masters.php atau dibuat file terpisah
        if (class_exists('UMH_API_Hotels')) {
            (new UMH_API_Hotels())->register_routes();
        }
        if (class_exists('UMH_API_Airlines')) {
            (new UMH_API_Airlines())->register_routes();
        }
    }
}