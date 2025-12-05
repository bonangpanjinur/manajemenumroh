<?php
require_once dirname(__FILE__) . '/../class-umh-crud-controller.php';

class UMH_API_Marketing extends UMH_CRUD_Controller {
    public function __construct() {
        parent::__construct('umh_leads');
    }
}