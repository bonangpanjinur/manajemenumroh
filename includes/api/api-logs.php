<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Logs extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_activity_logs');
    }
}