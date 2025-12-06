<?php
if (!defined('ABSPATH')) exit;

class UMH_API_Loader {
    public function init() {
        // Load Core Services First
        $this->load_class('class-umh-ledger.php');
        $this->load_class('class-umh-wallet.php');

        add_action('rest_api_init', [$this, 'register_all_routes']);
    }

    private function load_class($filename) {
        $filepath = dirname(__FILE__) . '/classes/' . $filename; // Folder classes
        if (file_exists($filepath)) {
            require_once $filepath;
        }
    }

    public function register_all_routes() {
        // Load Controllers
        $this->load_api('api-users.php', 'UMH_API_Users');
        $this->load_api('api-roles.php', 'UMH_API_Roles');
        $this->load_api('api-stats.php', 'UMH_API_Stats');
        $this->load_api('api-hr.php', 'UMH_API_HR'); 
        $this->load_api('api-marketing.php', 'UMH_API_Marketing');
        $this->load_api('api-leads.php', 'UMH_API_Leads');
        $this->load_api('api-packages.php', 'UMH_API_Packages');
        $this->load_api('api-masters.php', 'UMH_API_Masters');
        $this->load_api('api-departures.php', 'UMH_API_Departures');
        $this->load_api('api-rooming.php', 'UMH_API_Rooming');
        $this->load_api('api-jamaah.php', 'UMH_API_Jamaah');
        $this->load_api('api-bookings.php', 'UMH_API_Bookings');
        $this->load_api('api-accounting.php', 'UMH_API_Accounting');
        $this->load_api('api-finance.php', 'UMH_API_Finance');
        $this->load_api('api-agents.php', 'UMH_API_Agents');
        $this->load_api('api-logistics.php', 'UMH_API_Logistics');
        $this->load_api('api-uploads.php', 'UMH_API_Uploads');
        $this->load_api('api-export.php', 'UMH_API_Export');
    }

    private function load_api($filename, $classname) {
        $filepath = dirname(__FILE__) . '/api/' . $filename;
        if (file_exists($filepath)) {
            require_once $filepath;
            if (class_exists($classname)) {
                $controller = new $classname();
                if (method_exists($controller, 'register_routes')) {
                    $controller->register_routes();
                }
            }
        }
    }
}