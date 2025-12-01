<?php
if (!defined('ABSPATH')) exit;
require_once plugin_dir_path(__FILE__) . '../class-umh-crud-controller.php';

class UMH_HR_API {
    public function __construct() {
        // Schema lengkap sesuai database
        $schema = [
            'name'        => ['type' => 'string', 'required' => true],
            'position'    => ['type' => 'string'],
            'phone'       => ['type' => 'string'],
            'email'       => ['type' => 'string', 'format' => 'email'],
            'salary'      => ['type' => 'number'],
            'user_id'     => ['type' => 'integer'],
            'status'      => ['type' => 'string', 'default' => 'active'],
            'join_date'   => ['type' => 'string', 'format' => 'date'] // Konsisten: join_date
        ];

        $permissions = [
            'get_items'   => ['owner', 'hr_staff', 'administrator', 'admin_staff'], 
            'create_item' => ['owner', 'hr_staff', 'administrator', 'admin_staff'],
            'update_item' => ['owner', 'hr_staff', 'administrator', 'admin_staff'],
            'delete_item' => ['owner', 'administrator', 'admin_staff'] // Admin staff boleh hapus jika perlu
        ];

        new UMH_CRUD_Controller('hr', 'umh_employees', $schema, $permissions);
        
        add_action('rest_api_init', [$this, 'register_attendance']);
    }

    public function register_attendance() {
        register_rest_route('umh/v1', '/hr/attendance', [
            ['methods' => 'GET', 'callback' => [$this, 'get_attendance'], 'permission_callback' => '__return_true'],
            ['methods' => 'POST', 'callback' => [$this, 'save_attendance'], 'permission_callback' => '__return_true']
        ]);
    }

    public function get_attendance($request) {
        global $wpdb;
        $date = $request->get_param('date') ?: date('Y-m-d');
        $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->prefix}umh_hr_attendance WHERE date = %s", $date));
        return rest_ensure_response($results);
    }

    public function save_attendance($request) {
        global $wpdb;
        $params = $request->get_json_params();
        $date = $params['date'];
        $table = $wpdb->prefix . 'umh_hr_attendance';

        if (!empty($params['entries']) && is_array($params['entries'])) {
            foreach ($params['entries'] as $entry) {
                $sql = "INSERT INTO $table (date, employee_id, status) VALUES (%s, %d, %s) 
                        ON DUPLICATE KEY UPDATE status = VALUES(status)";
                $wpdb->query($wpdb->prepare($sql, $date, $entry['employee_id'], $entry['status']));
            }
            return rest_ensure_response(['success' => true]);
        }
        return new WP_Error('invalid_data', 'Data entries tidak valid', ['status' => 400]);
    }
}
new UMH_HR_API();