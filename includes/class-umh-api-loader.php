<?php
if (!defined('ABSPATH')) exit;

class UMH_API_Loader {
    public function init() {
        add_action('rest_api_init', [$this, 'register_all_routes']);
    }

    public function register_all_routes() {
        // 1. Core & Users
        $this->load_api('api-users.php', 'UMH_API_Users');
        $this->load_api('api-roles.php', 'UMH_API_Roles');
        $this->load_api('api-stats.php', 'UMH_API_Stats');

        // 2. HRD & Payroll (ADA)
        $this->load_api('api-hr.php', 'UMH_API_HR'); 

        // 3. Marketing & CRM (ADA)
        $this->load_api('api-marketing.php', 'UMH_API_Marketing'); // Campaign
        $this->load_api('api-leads.php', 'UMH_API_Leads'); // Pipeline

        // 4. Products & Masters
        $this->load_api('api-packages.php', 'UMH_API_Packages');
        $this->load_api('api-masters.php', 'UMH_API_Masters'); // Hotel, Airlines

        // 5. Operational
        $this->load_api('api-departures.php', 'UMH_API_Departures');
        $this->load_api('api-rooming.php', 'UMH_API_Rooming');
        $this->load_api('api-jamaah.php', 'UMH_API_Jamaah');

        // 6. Finance & Accounting
        $this->load_api('api-bookings.php', 'UMH_API_Bookings'); // Transaksi
        $this->load_api('api-accounting.php', 'UMH_API_Accounting'); // General Ledger
        $this->load_api('api-finance.php', 'UMH_API_Finance'); // Simple Cashflow
        $this->load_api('api-agents.php', 'UMH_API_Agents'); // Komisi
    }

    private function load_api($filename, $classname) {
        $filepath = dirname(__FILE__) . '/api/' . $filename;
        if (file_exists($filepath)) {
            require_once $filepath;
            if (class_exists($classname)) {
                $controller = new $classname();
                $controller->register_routes();
            }
        }
    }
}