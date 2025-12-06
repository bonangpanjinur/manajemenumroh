<?php
/**
 * File: includes/db-schema.php
 * Deskripsi: Skema Database V7.7 (Full Version: Core + Savings + Manifest + Visa Handling)
 */

if (!defined('ABSPATH')) {
    exit;
}

function umh_create_db_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // 1. SYSTEM
    $sql_branches = "CREATE TABLE {$wpdb->prefix}umh_branches (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(20) UNIQUE,
        address text,
        phone varchar(20),
        is_hq boolean DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_branches);

    $sql_users = "CREATE TABLE {$wpdb->prefix}umh_users (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        username varchar(60) NOT NULL,
        email varchar(100) NOT NULL,
        password_hash varchar(255) NOT NULL,
        full_name varchar(100),
        role_key varchar(50) DEFAULT 'jamaah',
        phone varchar(20),
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), UNIQUE KEY uuid (uuid)
    ) $charset_collate;";
    dbDelta($sql_users);

    $sql_roles = "CREATE TABLE {$wpdb->prefix}umh_roles (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        role_key varchar(50) NOT NULL, 
        role_name varchar(100) NOT NULL,
        capabilities longtext,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY role_key (role_key)
    ) $charset_collate;";
    dbDelta($sql_roles);

    // 2. MASTER DATA
    $sql_cities = "CREATE TABLE {$wpdb->prefix}umh_master_cities (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        province varchar(100),
        country varchar(50) DEFAULT 'Indonesia',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_cities);

    $sql_hotels = "CREATE TABLE {$wpdb->prefix}umh_master_hotels (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        name varchar(150) NOT NULL,
        city_id bigint(20) UNSIGNED NULL, -- Relasi ke Master Kota
        city varchar(100), -- Fallback text jika input manual
        rating varchar(5) DEFAULT '5',
        distance_to_haram int DEFAULT 0, 
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), KEY city_id (city_id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    $sql_airlines = "CREATE TABLE {$wpdb->prefix}umh_master_airlines (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(10) NULL,
        type varchar(20) DEFAULT 'International',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_airlines);

    $sql_mutawifs = "CREATE TABLE {$wpdb->prefix}umh_master_mutawifs (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        phone varchar(20),
        license_number varchar(50),
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_mutawifs);

    // 3. PACKAGES
    $sql_packages = "CREATE TABLE {$wpdb->prefix}umh_packages (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        name varchar(200) NOT NULL,
        type varchar(20) DEFAULT 'umrah',
        category_id bigint(20) UNSIGNED DEFAULT 0,
        duration_days int DEFAULT 9,
        down_payment_amount decimal(15,2) DEFAULT 0,
        description longtext,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY (id), UNIQUE KEY uuid (uuid), KEY category_id (category_id)
    ) $charset_collate;";
    dbDelta($sql_packages);

    $sql_pkg_prices = "CREATE TABLE {$wpdb->prefix}umh_package_prices (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id bigint(20) UNSIGNED NOT NULL,
        room_type varchar(50) NOT NULL,
        capacity int NOT NULL,
        price decimal(15,2) NOT NULL,
        currency varchar(5) DEFAULT 'IDR',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_pkg_prices);

    $sql_pkg_hotels = "CREATE TABLE {$wpdb->prefix}umh_package_hotels (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id bigint(20) UNSIGNED NOT NULL,
        hotel_id bigint(20) UNSIGNED NOT NULL,
        city_name varchar(50),
        nights int DEFAULT 1,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_pkg_hotels);

    $sql_itineraries = "CREATE TABLE {$wpdb->prefix}umh_package_itineraries (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id bigint(20) UNSIGNED NOT NULL,
        day_number int NOT NULL,
        title varchar(150),
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_itineraries);

    $sql_pkg_cats = "CREATE TABLE {$wpdb->prefix}umh_package_categories (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        name varchar(100) NOT NULL,
        slug varchar(100),
        type varchar(20) DEFAULT 'umrah',
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_pkg_cats);

    // 4. DEPARTURES
    $sql_departures = "CREATE TABLE {$wpdb->prefix}umh_departures (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        package_id bigint(20) UNSIGNED NOT NULL,
        departure_date date NOT NULL,
        return_date date NOT NULL,
        airline_id bigint(20) UNSIGNED,
        flight_number_depart varchar(20),
        flight_number_return varchar(20),
        quota int DEFAULT 45,
        available_seats int DEFAULT 45,
        status varchar(20) DEFAULT 'open',
        mutawif_id bigint(20) UNSIGNED NULL,
        tour_leader_id bigint(20) UNSIGNED NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NULL,
        deleted_at datetime NULL,
        PRIMARY KEY (id), UNIQUE KEY uuid (uuid), KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_departures);

    $sql_dep_prices = "CREATE TABLE {$wpdb->prefix}umh_departure_prices (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        departure_id bigint(20) UNSIGNED NOT NULL,
        room_type varchar(50) NOT NULL, 
        capacity int NOT NULL, 
        price decimal(15,2) NOT NULL,
        currency varchar(5) DEFAULT 'IDR',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), KEY departure_id (departure_id)
    ) $charset_collate;";
    dbDelta($sql_dep_prices);

    $sql_rooming = "CREATE TABLE {$wpdb->prefix}umh_rooming_list (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        departure_id bigint(20) UNSIGNED NOT NULL,
        hotel_id bigint(20) UNSIGNED NULL,
        room_number varchar(20),
        capacity int DEFAULT 4,
        gender varchar(10) NOT NULL,
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id), KEY departure_id (departure_id)
    ) $charset_collate;";
    dbDelta($sql_rooming);

    // 5. AGENTS
    $sql_agents = "CREATE TABLE {$wpdb->prefix}umh_agents (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        user_id bigint(20) UNSIGNED DEFAULT 0,
        parent_branch_id bigint(20) UNSIGNED DEFAULT 1,
        name varchar(100) NOT NULL,
        code varchar(50),
        email varchar(100),
        phone varchar(20),
        type varchar(20) DEFAULT 'agent',
        city varchar(50),
        bank_name varchar(50),
        bank_account_number varchar(50),
        status varchar(50) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY (id), UNIQUE KEY code (code)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // --- 6. SALES & JAMAAH (Updated with Passport Fields) ---
    $sql_jamaah = "CREATE TABLE {$wpdb->prefix}umh_jamaah (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        user_id bigint(20) UNSIGNED NULL,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        pic varchar(100) DEFAULT 'Pusat',
        nik varchar(20),
        passport_number varchar(20),
        passport_name varchar(150), -- Nama sesuai Paspor
        passport_issued_date date,  -- Tanggal Terbit
        passport_expiry_date date,  -- Tanggal Expired
        passport_issued_city varchar(50), -- Kota Terbit
        full_name varchar(150) NOT NULL,
        gender varchar(10) NOT NULL,
        birth_place varchar(50),
        birth_date date,
        phone varchar(20),
        email varchar(100),
        address text,
        city_id bigint(20) UNSIGNED NULL,
        sales_agent_id bigint(20) UNSIGNED DEFAULT 0, -- Referensi Agen
        status varchar(20) DEFAULT 'registered',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NULL,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        KEY pic (pic),
        KEY sales_agent_id (sales_agent_id)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    $sql_docs = "CREATE TABLE {$wpdb->prefix}umh_jamaah_documents (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        doc_type varchar(50) NOT NULL,
        file_path varchar(255) NOT NULL,
        file_name varchar(100),
        status varchar(20) DEFAULT 'pending',
        notes text,
        uploaded_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_docs);

    $sql_bookings = "CREATE TABLE {$wpdb->prefix}umh_bookings (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        booking_code varchar(50) NOT NULL,
        departure_id bigint(20) UNSIGNED NOT NULL,
        agent_id bigint(20) UNSIGNED NULL,
        contact_name varchar(150),
        contact_phone varchar(20),
        total_pax int DEFAULT 1,
        total_price decimal(15,2) DEFAULT 0,
        total_paid decimal(15,2) DEFAULT 0,
        payment_status varchar(20) DEFAULT 'unpaid',
        status varchar(20) DEFAULT 'draft',
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NULL,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        UNIQUE KEY booking_code (booking_code),
        KEY departure_id (departure_id),
        KEY agent_id (agent_id)
    ) $charset_collate;";
    dbDelta($sql_bookings);

    // (Updated with Visa Fields)
    $sql_booking_pax = "CREATE TABLE {$wpdb->prefix}umh_booking_passengers (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        package_type varchar(20) DEFAULT 'Quad',
        price_pax decimal(15,2) DEFAULT 0,
        
        -- VISA HANDLING FIELDS
        visa_status varchar(20) DEFAULT 'pending', -- pending, process, issued, rejected
        visa_number varchar(50),
        visa_provider varchar(100),
        visa_issued_date date,
        visa_expiry_date date,
        
        assigned_room_id bigint(20) UNSIGNED NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_booking_pax);

    $sql_commissions = "CREATE TABLE {$wpdb->prefix}umh_agent_commissions (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        agent_id bigint(20) UNSIGNED NOT NULL,
        booking_id bigint(20) UNSIGNED NOT NULL,
        amount decimal(15,2) NOT NULL,
        status varchar(20) DEFAULT 'pending',
        paid_date datetime,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id), 
        KEY agent_id (agent_id)
    ) $charset_collate;";
    dbDelta($sql_commissions);

    // --- 7. FINANCE ---
    $sql_coa = "CREATE TABLE {$wpdb->prefix}umh_acc_coa (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        code varchar(20) NOT NULL,
        name varchar(100) NOT NULL,
        type varchar(20) NOT NULL,
        normal_balance varchar(10) NOT NULL,
        is_active boolean DEFAULT 1,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id), 
        UNIQUE KEY code (code)
    ) $charset_collate;";
    dbDelta($sql_coa);

    $sql_journal = "CREATE TABLE {$wpdb->prefix}umh_acc_journal_entries (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        transaction_date date NOT NULL,
        reference_no varchar(50),
        description text,
        total_amount decimal(15,2) NOT NULL,
        source_module varchar(50),
        source_id bigint(20) UNSIGNED,
        status varchar(20) DEFAULT 'posted',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NULL,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        KEY transaction_date (transaction_date)
    ) $charset_collate;";
    dbDelta($sql_journal);

    $sql_journal_items = "CREATE TABLE {$wpdb->prefix}umh_acc_journal_items (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        journal_id bigint(20) UNSIGNED NOT NULL,
        coa_id bigint(20) UNSIGNED NOT NULL,
        debit decimal(15,2) DEFAULT 0,
        credit decimal(15,2) DEFAULT 0,
        description varchar(255),
        PRIMARY KEY  (id),
        KEY journal_id (journal_id),
        KEY coa_id (coa_id)
    ) $charset_collate;";
    dbDelta($sql_journal_items);

    $sql_finance = "CREATE TABLE {$wpdb->prefix}umh_finance (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        transaction_date date NOT NULL,
        type varchar(20) NOT NULL,
        category varchar(100),
        title varchar(255) NOT NULL,
        amount decimal(15,2) NOT NULL,
        description text,
        reference_id bigint(20) UNSIGNED NULL,
        status varchar(20) DEFAULT 'verified',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_finance);

    $sql_invoices = "CREATE TABLE {$wpdb->prefix}umh_invoices (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        invoice_number varchar(50) NOT NULL,
        booking_id bigint(20) UNSIGNED NOT NULL,
        amount decimal(15,2) NOT NULL,
        due_date date,
        status varchar(20) DEFAULT 'unpaid',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id), 
        UNIQUE KEY invoice_number (invoice_number)
    ) $charset_collate;";
    dbDelta($sql_invoices);

    // --- 8. LOGISTICS ---
    $sql_warehouse = "CREATE TABLE {$wpdb->prefix}umh_warehouses (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        name varchar(100) NOT NULL,
        location varchar(100),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_warehouse);

    $sql_inventory = "CREATE TABLE {$wpdb->prefix}umh_inventory_items (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        item_code varchar(50), 
        item_name varchar(100) NOT NULL,
        category varchar(20) DEFAULT 'perlengkapan',
        unit_cost decimal(15,2) DEFAULT 0,
        sale_price decimal(15,2) DEFAULT 0,
        stock_qty int DEFAULT 0,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_inventory);

    $sql_inv_trx = "CREATE TABLE {$wpdb->prefix}umh_inventory_transactions (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        item_id bigint(20) UNSIGNED NOT NULL,
        warehouse_id bigint(20) UNSIGNED DEFAULT 1,
        type varchar(20) NOT NULL,
        qty int NOT NULL,
        balance_after int NOT NULL,
        reference_no varchar(50),
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY item_id (item_id)
    ) $charset_collate;";
    dbDelta($sql_inv_trx);

    $sql_dist = "CREATE TABLE {$wpdb->prefix}umh_logistics_distribution (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        item_id bigint(20) UNSIGNED NOT NULL,
        qty int DEFAULT 1,
        status varchar(20) DEFAULT 'pending',
        taken_date datetime,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_dist);

    // --- 9. PROCUREMENT ---
    $sql_vendors = "CREATE TABLE {$wpdb->prefix}umh_master_vendors (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        type varchar(20) DEFAULT 'general',
        contact_person varchar(100),
        phone varchar(20),
        email varchar(100),
        address text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_vendors);

    $sql_purchases = "CREATE TABLE {$wpdb->prefix}umh_purchases (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        po_number varchar(50) NOT NULL,
        vendor_id bigint(20) UNSIGNED NOT NULL,
        transaction_date date NOT NULL,
        total_amount decimal(15,2) DEFAULT 0,
        status varchar(20) DEFAULT 'draft',
        payment_status varchar(20) DEFAULT 'unpaid',
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NULL,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY po_number (po_number),
        KEY vendor_id (vendor_id)
    ) $charset_collate;";
    dbDelta($sql_purchases);

    // --- 10. HR & MARKETING ---
    $sql_employees = "CREATE TABLE {$wpdb->prefix}umh_hr_employees (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        name varchar(100) NOT NULL,
        email varchar(100),
        phone varchar(20),
        position varchar(100),
        division varchar(100),
        salary decimal(15,2) DEFAULT 0,
        status varchar(50) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
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
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY emp_date (employee_id, date)
    ) $charset_collate;";
    dbDelta($sql_attendance);

    $sql_leads = "CREATE TABLE {$wpdb->prefix}umh_leads (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        name varchar(100) NOT NULL,
        phone varchar(20),
        source varchar(50),
        status varchar(20) DEFAULT 'new',
        marketing_id bigint(20) UNSIGNED NULL,
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_leads);
    
    $sql_marketing = "CREATE TABLE {$wpdb->prefix}umh_marketing (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        title varchar(150) NOT NULL,
        platform varchar(50),
        budget decimal(15,2) DEFAULT 0,
        start_date date,
        end_date date,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_marketing);

    // --- 11. UTILITIES ---
    $sql_tasks = "CREATE TABLE {$wpdb->prefix}umh_tasks (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        title varchar(200) NOT NULL,
        description text,
        assigned_to bigint(20) UNSIGNED, 
        priority varchar(20) DEFAULT 'medium',
        status varchar(20) DEFAULT 'pending',
        due_date date,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    $sql_audit = "CREATE TABLE {$wpdb->prefix}umh_audit_trails (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        action varchar(50) NOT NULL,
        table_name varchar(50) NOT NULL,
        record_id bigint(20) UNSIGNED NOT NULL,
        old_values longtext, 
        new_values longtext, 
        ip_address varchar(45),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY record (table_name, record_id)
    ) $charset_collate;";
    dbDelta($sql_audit);
    
    $sql_activity_logs = "CREATE TABLE {$wpdb->prefix}umh_activity_logs (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED,
        action varchar(100),
        details text,
        ip_address varchar(45),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_activity_logs);

    // --- 12. SAVINGS SYSTEM (TABUNGAN UMROH) ---
    // Paket Tabungan
    $sql_savings_pkg = "CREATE TABLE {$wpdb->prefix}umh_savings_packages (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL, 
        package_type varchar(50) DEFAULT 'regular',
        description text,
        target_amount decimal(15,2) NOT NULL,
        duration_months int(11) NOT NULL, 
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        is_active tinyint(1) DEFAULT 1,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_savings_pkg);

    // Rekening Tabungan
    $sql_savings_acc = "CREATE TABLE {$wpdb->prefix}umh_savings_accounts (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        package_id bigint(20) UNSIGNED NOT NULL,
        account_number varchar(50) NOT NULL,
        start_date date NOT NULL,
        end_date_estimation date NOT NULL,
        target_amount decimal(15,2) NOT NULL,
        current_balance decimal(15,2) DEFAULT 0,
        status enum('active', 'completed', 'cancelled') DEFAULT 'active',
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY jamaah_id (jamaah_id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_savings_acc);

    // Transaksi Setoran
    $sql_savings_trx = "CREATE TABLE {$wpdb->prefix}umh_savings_transactions (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        account_id bigint(20) UNSIGNED NOT NULL,
        transaction_date datetime DEFAULT CURRENT_TIMESTAMP,
        amount decimal(15,2) NOT NULL,
        type enum('deposit', 'withdrawal', 'adjustment') DEFAULT 'deposit',
        payment_method varchar(50) DEFAULT 'transfer',
        proof_url varchar(255),
        status enum('pending', 'verified', 'rejected') DEFAULT 'pending',
        verified_by bigint(20) UNSIGNED,
        verified_at datetime,
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY account_id (account_id)
    ) $charset_collate;";
    dbDelta($sql_savings_trx);

    // Init Branch Pusat
    if ($wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_branches") == 0) {
        $wpdb->query("INSERT INTO {$wpdb->prefix}umh_branches (name, code, address, is_hq) VALUES ('Kantor Pusat', 'HQ', 'Jakarta', 1)");
    }

    update_option('umh_db_version', '7.7.0'); 
}