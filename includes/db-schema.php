<?php
/**
 * File: includes/db-schema.php
 * Deskripsi: Skema Database Enterprise V7.0 (Ultimate)
 * PERBAIKAN: Menghapus komentar inline SQL yang menyebabkan error pada dbDelta
 */

if (!defined('ABSPATH')) {
    exit;
}

function umh_create_db_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    /* =========================================
       1. IDENTITY & ACCESS MANAGEMENT (IAM)
       ========================================= */
    
    // Users: Central Identity
    $sql_users = "CREATE TABLE {$wpdb->prefix}umh_users (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        username varchar(60) NOT NULL,
        email varchar(100) NOT NULL,
        password_hash varchar(255) NOT NULL,
        full_name varchar(100),
        role_key varchar(50) DEFAULT 'jamaah',
        phone varchar(20),
        avatar_url varchar(255),
        status enum('active', 'suspended', 'inactive', 'pending_verification') DEFAULT 'active',
        wp_user_id bigint(20) UNSIGNED, 
        last_login datetime,
        reset_token varchar(100),
        reset_expiry datetime,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        UNIQUE KEY username (username),
        KEY email (email),
        KEY status (status)
    ) $charset_collate;";
    dbDelta($sql_users);

    // Roles: RBAC
    $sql_roles = "CREATE TABLE {$wpdb->prefix}umh_roles (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        role_key varchar(50) NOT NULL, 
        role_name varchar(100) NOT NULL,
        capabilities longtext,
        is_system boolean DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY role_key (role_key)
    ) $charset_collate;";
    dbDelta($sql_roles);

    // User Devices (Mobile App Ready)
    $sql_devices = "CREATE TABLE {$wpdb->prefix}umh_user_devices (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        device_token text NOT NULL,
        device_type enum('android', 'ios', 'web') DEFAULT 'web',
        last_active datetime,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql_devices);

    /* =========================================
       2. HUMAN RESOURCES (HRM)
       ========================================= */
       
    $sql_employees = "CREATE TABLE {$wpdb->prefix}umh_hr_employees (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        umh_user_id bigint(20) UNSIGNED NULL,
        name varchar(100) NOT NULL,
        email varchar(100),
        phone varchar(20),
        position varchar(100),
        division varchar(100),
        salary decimal(15,2) DEFAULT 0,
        status varchar(50) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        UNIQUE KEY umh_user_id (umh_user_id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    $sql_attendance = "CREATE TABLE {$wpdb->prefix}umh_hr_attendance (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        employee_id bigint(20) UNSIGNED NOT NULL,
        date date NOT NULL,
        check_in_time time,
        check_out_time time,
        status varchar(50) DEFAULT 'present',
        method varchar(50) DEFAULT 'Manual',
        location_lat varchar(50),
        location_long varchar(50),
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY emp_date (employee_id, date)
    ) $charset_collate;";
    dbDelta($sql_attendance);

    /* =========================================
       3. PRODUCT MANAGEMENT (PIM)
       ========================================= */

    $sql_pkg_cats = "CREATE TABLE {$wpdb->prefix}umh_package_categories (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        slug varchar(100),
        type enum('umrah', 'haji', 'tour') DEFAULT 'umrah',
        description text,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_pkg_cats);

    $sql_hotels = "CREATE TABLE {$wpdb->prefix}umh_master_hotels (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        name varchar(150) NOT NULL,
        city enum('Makkah', 'Madinah', 'Jeddah', 'Lainnya') NOT NULL, 
        rating varchar(5) DEFAULT '5',
        distance_to_haram int DEFAULT 0, 
        map_url text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    $sql_airlines = "CREATE TABLE {$wpdb->prefix}umh_master_airlines (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(10) NULL,
        logo_url varchar(255) NULL,
        type varchar(20) DEFAULT 'International',
        status varchar(20) DEFAULT 'active',
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_airlines);

    $sql_packages = "CREATE TABLE {$wpdb->prefix}umh_packages (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        category_id bigint(20) UNSIGNED NULL,
        name varchar(200) NOT NULL,
        slug varchar(200),
        type enum('umrah', 'haji', 'tour') DEFAULT 'umrah',
        duration_days int DEFAULT 9,
        hotel_makkah_id bigint(20) UNSIGNED NULL,
        hotel_madinah_id bigint(20) UNSIGNED NULL,
        base_price_quad decimal(15,2) DEFAULT 0,
        base_price_triple decimal(15,2) DEFAULT 0,
        base_price_double decimal(15,2) DEFAULT 0,
        currency varchar(3) DEFAULT 'IDR',
        down_payment_amount decimal(15,2) DEFAULT 0,
        description longtext,
        included_features longtext,
        excluded_features longtext,
        status enum('active', 'archived', 'draft') DEFAULT 'active',
        image_url varchar(255),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        KEY slug (slug)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // Itinerary Detail
    $sql_itineraries = "CREATE TABLE {$wpdb->prefix}umh_package_itineraries (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id bigint(20) UNSIGNED NOT NULL,
        day_number int NOT NULL,
        title varchar(150),
        description text,
        location varchar(100),
        image_url varchar(255),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_itineraries);

    $sql_addons = "CREATE TABLE {$wpdb->prefix}umh_package_addons (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        price decimal(15,2) DEFAULT 0,
        unit enum('per_pax', 'per_booking') DEFAULT 'per_pax',
        description text,
        is_active boolean DEFAULT 1,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_addons);

    $sql_departures = "CREATE TABLE {$wpdb->prefix}umh_departures (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        package_id bigint(20) UNSIGNED NOT NULL,
        departure_date date NOT NULL,
        return_date date NOT NULL,
        airline_id bigint(20) UNSIGNED,
        flight_number_depart varchar(20),
        flight_number_return varchar(20),
        quota int DEFAULT 45,
        available_seats int DEFAULT 45,
        price_quad decimal(15,2) DEFAULT 0,
        price_triple decimal(15,2) DEFAULT 0,
        price_double decimal(15,2) DEFAULT 0,
        status enum('open', 'closed', 'departed', 'completed', 'cancelled') DEFAULT 'open',
        tour_leader_name varchar(100),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        KEY package_id (package_id),
        KEY departure_date (departure_date)
    ) $charset_collate;";
    dbDelta($sql_departures);

    /* =========================================
       4. TRANSACTION & COMMERCE (E-Commerce Ready)
       ========================================= */

    $sql_coupons = "CREATE TABLE {$wpdb->prefix}umh_coupons (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        code varchar(50) NOT NULL,
        description varchar(255),
        type enum('percentage', 'fixed') DEFAULT 'fixed',
        amount decimal(15,2) DEFAULT 0,
        min_transaction decimal(15,2) DEFAULT 0,
        max_discount decimal(15,2) DEFAULT 0, 
        start_date date,
        end_date date,
        usage_limit int DEFAULT 0, 
        used_count int DEFAULT 0,
        is_active boolean DEFAULT 1,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY code (code)
    ) $charset_collate;";
    dbDelta($sql_coupons);

    $sql_jamaah = "CREATE TABLE {$wpdb->prefix}umh_jamaah (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        user_id bigint(20) UNSIGNED NULL,
        nik varchar(20),
        passport_number varchar(20),
        full_name varchar(150) NOT NULL,
        gender enum('L', 'P') NOT NULL,
        birth_place varchar(50),
        birth_date date,
        phone varchar(20),
        email varchar(100),
        address text,
        city varchar(50),
        job_title varchar(100),
        father_name varchar(100),
        disease_history text,
        bpjs_number varchar(30),
        status enum('lead', 'registered', 'active_jamaah', 'alumni') DEFAULT 'registered',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        UNIQUE KEY user_id (user_id),
        KEY nik (nik),
        KEY passport (passport_number)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    $sql_jamaah_docs = "CREATE TABLE {$wpdb->prefix}umh_jamaah_documents (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        doc_type enum('passport', 'ktp', 'photo', 'vaccine', 'kk', 'buku_nikah', 'visa_file') NOT NULL,
        file_path varchar(255) NOT NULL,
        file_name varchar(150),
        status enum('pending', 'verified', 'rejected') DEFAULT 'pending',
        verified_by bigint(20) UNSIGNED NULL,
        notes text,
        uploaded_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_jamaah_docs);

    $sql_bookings = "CREATE TABLE {$wpdb->prefix}umh_bookings (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        booking_code varchar(50) NOT NULL,
        user_id bigint(20) UNSIGNED NULL, 
        departure_id bigint(20) UNSIGNED NOT NULL,
        agent_id bigint(20) UNSIGNED NULL,
        contact_name varchar(150),
        contact_phone varchar(20),
        contact_email varchar(100),
        total_pax int DEFAULT 1,
        subtotal_price decimal(15,2) DEFAULT 0,
        discount_amount decimal(15,2) DEFAULT 0,
        coupon_id bigint(20) UNSIGNED NULL,
        total_price decimal(15,2) DEFAULT 0,
        total_paid decimal(15,2) DEFAULT 0,
        payment_status enum('unpaid', 'dp', 'partial', 'paid', 'overdue', 'refunded') DEFAULT 'unpaid',
        status enum('draft', 'pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'draft',
        notes text,
        booking_date date,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        UNIQUE KEY booking_code (booking_code),
        KEY departure_id (departure_id),
        KEY user_id (user_id),
        KEY status (status)
    ) $charset_collate;";
    dbDelta($sql_bookings);

    $sql_booking_pax = "CREATE TABLE {$wpdb->prefix}umh_booking_passengers (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        package_type enum('Quad', 'Triple', 'Double') DEFAULT 'Quad',
        price_pax decimal(15,2) DEFAULT 0,
        visa_status enum('pending', 'processing', 'approved', 'rejected') DEFAULT 'pending',
        visa_number varchar(50),
        ticket_number varchar(100),
        room_id bigint(20) UNSIGNED NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_booking_pax);

    $sql_booking_addons = "CREATE TABLE {$wpdb->prefix}umh_booking_addons_trx (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        addon_id bigint(20) UNSIGNED NOT NULL,
        qty int DEFAULT 1,
        price_unit decimal(15,2) DEFAULT 0,
        total_price decimal(15,2) DEFAULT 0,
        note varchar(255),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_booking_addons);

    /* =========================================
       5. FINANCIAL LEDGER & REFUNDS
       ========================================= */

    $sql_invoices = "CREATE TABLE {$wpdb->prefix}umh_invoices (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        invoice_number varchar(50) NOT NULL,
        booking_id bigint(20) UNSIGNED NOT NULL,
        amount decimal(15,2) NOT NULL,
        due_date date,
        status enum('unpaid', 'partial', 'paid', 'void') DEFAULT 'unpaid',
        description varchar(255),
        payment_url varchar(255),
        xendit_id varchar(100), 
        midtrans_id varchar(100),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uuid (uuid),
        UNIQUE KEY invoice_number (invoice_number),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_invoices);

    $sql_payments = "CREATE TABLE {$wpdb->prefix}umh_payments (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        invoice_id bigint(20) UNSIGNED NULL,
        booking_id bigint(20) UNSIGNED NOT NULL,
        amount decimal(15,2) NOT NULL,
        payment_date date NOT NULL,
        payment_method enum('transfer', 'cash', 'credit_card', 'va') DEFAULT 'transfer',
        proof_file varchar(255),
        status enum('pending', 'verified', 'rejected') DEFAULT 'pending',
        verified_by bigint(20) UNSIGNED NULL,
        external_ref varchar(100), 
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uuid (uuid),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_payments);

    $sql_refunds = "CREATE TABLE {$wpdb->prefix}umh_refunds (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        booking_id bigint(20) UNSIGNED NOT NULL,
        amount decimal(15,2) NOT NULL,
        reason text,
        status enum('requested', 'approved', 'processed', 'rejected') DEFAULT 'requested',
        processed_at datetime NULL,
        processed_by bigint(20) UNSIGNED NULL,
        bank_details text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uuid (uuid),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_refunds);

    $sql_finance = "CREATE TABLE {$wpdb->prefix}umh_finance (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        transaction_date date NOT NULL,
        type enum('income', 'expense') NOT NULL,
        category varchar(100) DEFAULT 'General',
        title varchar(255) NOT NULL,
        amount decimal(15,2) NOT NULL,
        description text,
        reference_id bigint(20) UNSIGNED NULL,
        reference_type varchar(50) NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        KEY transaction_date (transaction_date),
        KEY type (type)
    ) $charset_collate;";
    dbDelta($sql_finance);

    /* =========================================
       6. PARTNERSHIP & AGENTS
       ========================================= */

    $sql_agents = "CREATE TABLE {$wpdb->prefix}umh_agents (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        user_id bigint(20) UNSIGNED NULL,
        name varchar(100) NOT NULL,
        email varchar(100),
        phone varchar(20),
        code varchar(50) UNIQUE,
        type enum('master', 'agent', 'freelance') DEFAULT 'agent',
        bank_name varchar(50),
        bank_account_number varchar(50),
        bank_account_holder varchar(100),
        status varchar(50) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        UNIQUE KEY user_id (user_id),
        KEY code (code)
    ) $charset_collate;";
    dbDelta($sql_agents);

    $sql_commissions = "CREATE TABLE {$wpdb->prefix}umh_agent_commissions (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        agent_id bigint(20) UNSIGNED NOT NULL,
        booking_id bigint(20) UNSIGNED NOT NULL,
        amount decimal(15,2) NOT NULL,
        status enum('pending', 'approved', 'paid', 'cancelled') DEFAULT 'pending',
        paid_date datetime NULL,
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY agent_id (agent_id)
    ) $charset_collate;";
    dbDelta($sql_commissions);

    /* =========================================
       7. LOGISTICS & OPERATIONS
       ========================================= */

    $sql_inventory = "CREATE TABLE {$wpdb->prefix}umh_inventory_items (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        item_code varchar(50), 
        item_name varchar(100) NOT NULL,
        category enum('perlengkapan', 'dokumen', 'souvenir') DEFAULT 'perlengkapan',
        stock_qty int DEFAULT 0,
        min_stock_alert int DEFAULT 10,
        unit_cost decimal(15,2) DEFAULT 0,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_inventory);

    $sql_dist = "CREATE TABLE {$wpdb->prefix}umh_logistics_distribution (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        item_id bigint(20) UNSIGNED NOT NULL,
        qty int DEFAULT 1,
        status enum('pending', 'ready', 'taken', 'shipped') DEFAULT 'pending',
        taken_date datetime,
        shipping_resi varchar(100),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_dist);

    $sql_rooming = "CREATE TABLE {$wpdb->prefix}umh_rooming_list (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        departure_id bigint(20) UNSIGNED NOT NULL,
        hotel_id bigint(20) UNSIGNED NOT NULL,
        room_number varchar(20),
        floor varchar(10),
        capacity int DEFAULT 4,
        gender enum('L', 'P', 'Family') NOT NULL,
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY departure_id (departure_id)
    ) $charset_collate;";
    dbDelta($sql_rooming);

    $sql_transport = "CREATE TABLE {$wpdb->prefix}umh_transport_manifest (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        departure_id bigint(20) UNSIGNED NOT NULL,
        transport_name varchar(100),
        seat_number varchar(10),
        jamaah_id bigint(20) UNSIGNED NULL,
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY departure_id (departure_id)
    ) $charset_collate;";
    dbDelta($sql_transport);

    /* =========================================
       8. CRM, MARKETING & NOTIFICATIONS
       ========================================= */

    $sql_marketing = "CREATE TABLE {$wpdb->prefix}umh_marketing (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        platform varchar(50),
        budget decimal(15,2) DEFAULT 0,
        start_date date,
        end_date date,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_marketing);

    $sql_leads = "CREATE TABLE {$wpdb->prefix}umh_leads (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        name varchar(100) NOT NULL,
        phone varchar(20),
        email varchar(100),
        source varchar(50),
        marketing_id bigint(20) UNSIGNED NULL,
        interest_package_id bigint(20) UNSIGNED NULL,
        status enum('new', 'contacted', 'hot', 'deal', 'lost') DEFAULT 'new',
        notes text,
        follow_up_date date,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        KEY status (status)
    ) $charset_collate;";
    dbDelta($sql_leads);

    $sql_tasks = "CREATE TABLE {$wpdb->prefix}umh_tasks (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        description text,
        assigned_to bigint(20) UNSIGNED,
        due_date date,
        priority enum('low', 'medium', 'high') DEFAULT 'medium',
        status enum('pending', 'in_progress', 'completed') DEFAULT 'pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        KEY assigned_to (assigned_to)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    $sql_notif = "CREATE TABLE {$wpdb->prefix}umh_notifications (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        title varchar(100) NOT NULL,
        message text,
        type enum('info', 'warning', 'success', 'error') DEFAULT 'info',
        is_read boolean DEFAULT 0,
        link varchar(255),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY is_read (is_read)
    ) $charset_collate;";
    dbDelta($sql_notif);

    $sql_logs = "CREATE TABLE {$wpdb->prefix}umh_activity_logs (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        action varchar(100) NOT NULL,
        target_table varchar(50),
        target_uuid char(36),
        details text,
        ip_address varchar(45),
        user_agent text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY action (action)
    ) $charset_collate;";
    dbDelta($sql_logs);

    // Simpan versi DB
    update_option('umh_db_version', '7.0.0'); 
}