<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Logs extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_activity_logs');
    }
    
    // Fitur Read Only, tidak boleh delete/edit logs sembarangan
    public function create_item($request) { return new WP_REST_Response(['message' => 'Logs are automated'], 403); }
    public function update_item($request) { return new WP_REST_Response(['message' => 'Cannot edit logs'], 403); }
    public function delete_item($request) { return new WP_REST_Response(['message' => 'Cannot delete logs'], 403); }
}