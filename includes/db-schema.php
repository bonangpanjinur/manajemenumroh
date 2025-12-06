<?php
/**
 * File: includes/db-schema.php
 * Deskripsi: Skema Database Enterprise V10.1 (Ultimate Edition)
 * * Modules Included:
 * 1. Core (Branches, Users, Roles)
 * 2. HR & Payroll
 * 3. Procurement (Vendors, PO)
 * 4. Products (Hotels, Airlines, Packages)
 * 5. Operational (Departures, Rooming)
 * 6. Sales & CRM (Leads, Bookings, Jamaah)
 * 7. Finance & Accounting (COA, Ledger, Invoices)
 * 8. Logistics (Inventory, Warehouse)
 * 9. Partnership (Agents, Commissions)
 * 10. B2B Wallet & Security (Seat Locks, Payment Proofs)
 */

if (!defined('ABSPATH')) {
    exit;
}

function umh_create_db_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    /* =========================================
       0. SYSTEM & MULTI-BRANCH (FOUNDATION)
       ========================================= */
    
    $sql_branches = "CREATE TABLE {$wpdb->prefix}umh_branches (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(20) UNIQUE,
        address text,
        phone varchar(20),
        is_hq boolean DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_branches);

    // Seed Cabang Pusat Default
    if ($wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_branches") == 0) {
        $wpdb->query("INSERT INTO {$wpdb->prefix}umh_branches (name, code, is_hq) VALUES ('Kantor Pusat', 'HQ', 1)");
    }

    /* =========================================
       1. IDENTITY & ACCESS MANAGEMENT (IAM)
       ========================================= */
    
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
        avatar_url varchar(255),
        status enum('active', 'suspended', 'inactive') DEFAULT 'active',
        wp_user_id bigint(20) UNSIGNED, 
        last_login datetime,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        UNIQUE KEY username (username),
        KEY branch_id (branch_id)
    ) $charset_collate;";
    dbDelta($sql_users);

    $sql_roles = "CREATE TABLE {$wpdb->prefix}umh_roles (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        role_key varchar(50) NOT NULL, 
        role_name varchar(100) NOT NULL,
        capabilities longtext,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY role_key (role_key)
    ) $charset_collate;";
    dbDelta($sql_roles);

    /* =========================================
       2. HR & PAYROLL
       ========================================= */
       
    $sql_employees = "CREATE TABLE {$wpdb->prefix}umh_hr_employees (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
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
        PRIMARY KEY  (id),
        KEY branch_id (branch_id)
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

    /* =========================================
       3. PRODUCT & VENDORS (PROCUREMENT)
       ========================================= */

    $sql_vendors = "CREATE TABLE {$wpdb->prefix}umh_master_vendors (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        type enum('hotel', 'airline', 'visa_provider', 'catering', 'general') DEFAULT 'general',
        contact_person varchar(100),
        phone varchar(20),
        email varchar(100),
        address text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_vendors);

    $sql_purchases = "CREATE TABLE {$wpdb->prefix}umh_purchases (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        po_number varchar(50) NOT NULL,
        vendor_id bigint(20) UNSIGNED NOT NULL,
        transaction_date date NOT NULL,
        total_amount decimal(15,2) DEFAULT 0,
        status enum('draft', 'ordered', 'received', 'cancelled') DEFAULT 'draft',
        payment_status enum('unpaid', 'partial', 'paid') DEFAULT 'unpaid',
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY po_number (po_number),
        KEY vendor_id (vendor_id)
    ) $charset_collate;";
    dbDelta($sql_purchases);

    $sql_hotels = "CREATE TABLE {$wpdb->prefix}umh_master_hotels (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        vendor_id bigint(20) UNSIGNED NULL,
        name varchar(150) NOT NULL,
        city enum('Makkah', 'Madinah', 'Jeddah', 'Istanbul', 'Dubai', 'Cairo', 'Lainnya') NOT NULL, 
        rating varchar(5) DEFAULT '5',
        distance_to_haram int DEFAULT 0, 
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    $sql_airlines = "CREATE TABLE {$wpdb->prefix}umh_master_airlines (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        vendor_id bigint(20) UNSIGNED NULL,
        name varchar(100) NOT NULL,
        code varchar(10) NULL,
        type varchar(20) DEFAULT 'International',
        logo_url varchar(255),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_airlines);

    $sql_packages = "CREATE TABLE {$wpdb->prefix}umh_packages (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        name varchar(200) NOT NULL,
        slug varchar(200),
        type enum('umrah', 'umrah_plus', 'haji', 'tour') DEFAULT 'umrah',
        duration_days int DEFAULT 9,
        base_price_quad decimal(15,2) DEFAULT 0,
        base_price_triple decimal(15,2) DEFAULT 0,
        base_price_double decimal(15,2) DEFAULT 0,
        down_payment_amount decimal(15,2) DEFAULT 0,
        description longtext,
        status enum('active', 'archived') DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid)
    ) $charset_collate;";
    dbDelta($sql_packages);

    $sql_pkg_hotels = "CREATE TABLE {$wpdb->prefix}umh_package_hotels (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id bigint(20) UNSIGNED NOT NULL,
        hotel_id bigint(20) UNSIGNED NOT NULL,
        city_name varchar(50) DEFAULT 'Makkah',
        nights int DEFAULT 1,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_pkg_hotels);

    $sql_itineraries = "CREATE TABLE {$wpdb->prefix}umh_package_itineraries (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id bigint(20) UNSIGNED NOT NULL,
        day_number int NOT NULL,
        title varchar(150),
        description text,
        location varchar(100),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_itineraries);

    $sql_pkg_cats = "CREATE TABLE {$wpdb->prefix}umh_package_categories (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        type varchar(50) DEFAULT 'umrah',
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_pkg_cats);

    /* =========================================
       4. OPERATIONAL & DEPARTURES
       ========================================= */

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
        price_quad decimal(15,2) DEFAULT 0,
        price_triple decimal(15,2) DEFAULT 0,
        price_double decimal(15,2) DEFAULT 0,
        status enum('open', 'closed', 'departed', 'completed', 'cancelled') DEFAULT 'open',
        tour_leader_name varchar(100),
        muthawif_name varchar(100),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        KEY package_id (package_id),
        KEY departure_date (departure_date)
    ) $charset_collate;";
    dbDelta($sql_departures);

    $sql_rooming = "CREATE TABLE {$wpdb->prefix}umh_rooming_list (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        departure_id bigint(20) UNSIGNED NOT NULL,
        hotel_id bigint(20) UNSIGNED NULL,
        room_number varchar(20),
        capacity int DEFAULT 4,
        gender enum('L', 'P', 'Family') NOT NULL,
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY departure_id (departure_id)
    ) $charset_collate;";
    dbDelta($sql_rooming);

    /* =========================================
       5. SALES, BOOKING & JAMAAH
       ========================================= */

    $sql_jamaah = "CREATE TABLE {$wpdb->prefix}umh_jamaah (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NULL, -- Link ke umh_users jika register mandiri
        uuid char(36) NOT NULL,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        pic varchar(100) DEFAULT 'Pusat',
        nik varchar(20),
        passport_number varchar(20),
        full_name varchar(150) NOT NULL,
        gender enum('L', 'P') NOT NULL,
        birth_place varchar(100),
        birth_date date,
        phone varchar(20),
        email varchar(100),
        address text,
        city varchar(50),
        status enum('lead', 'registered', 'active_jamaah', 'alumni') DEFAULT 'registered',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        KEY pic (pic)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    $sql_jamaah_docs = "CREATE TABLE {$wpdb->prefix}umh_jamaah_documents (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        doc_type varchar(50) NOT NULL, -- passport, ktp, photo, visa
        file_path varchar(255) NOT NULL,
        file_name varchar(255),
        status varchar(20) DEFAULT 'pending',
        notes text,
        uploaded_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_jamaah_docs);

    $sql_bookings = "CREATE TABLE {$wpdb->prefix}umh_bookings (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        booking_code varchar(50) NOT NULL,
        departure_id bigint(20) UNSIGNED NOT NULL,
        agent_id bigint(20) UNSIGNED NULL,
        user_id bigint(20) UNSIGNED NULL, -- Pembuat booking (User Login)
        contact_name varchar(150),
        contact_phone varchar(20),
        contact_email varchar(100),
        total_pax int DEFAULT 1,
        total_price decimal(15,2) DEFAULT 0,
        total_paid decimal(15,2) DEFAULT 0,
        payment_status enum('unpaid', 'dp', 'partial', 'paid', 'overdue', 'refunded') DEFAULT 'unpaid',
        status enum('draft', 'pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'draft',
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        UNIQUE KEY booking_code (booking_code),
        KEY departure_id (departure_id),
        KEY agent_id (agent_id)
    ) $charset_collate;";
    dbDelta($sql_bookings);

    $sql_booking_pax = "CREATE TABLE {$wpdb->prefix}umh_booking_passengers (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        package_type enum('Quad', 'Triple', 'Double') DEFAULT 'Quad',
        price_pax decimal(15,2) DEFAULT 0,
        visa_status enum('pending', 'processing', 'approved', 'rejected') DEFAULT 'pending',
        assigned_room_id bigint(20) UNSIGNED NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_booking_pax);

    /* =========================================
       6. FINANCE & ACCOUNTING (THE CORE)
       ========================================= */

    $sql_coa = "CREATE TABLE {$wpdb->prefix}umh_acc_coa (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        code varchar(20) NOT NULL,
        name varchar(100) NOT NULL,
        type enum('asset', 'liability', 'equity', 'revenue', 'expense') NOT NULL,
        normal_balance enum('debit', 'credit') NOT NULL,
        is_active boolean DEFAULT 1,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), UNIQUE KEY code (code)
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
        status enum('posted', 'void') DEFAULT 'posted',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
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
        PRIMARY KEY (id),
        KEY journal_id (journal_id),
        KEY coa_id (coa_id)
    ) $charset_collate;";
    dbDelta($sql_journal_items);

    // Tabel Finance Simple (Untuk Dashboard Cepat & Simple Cashflow)
    $sql_finance = "CREATE TABLE {$wpdb->prefix}umh_finance (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        transaction_date date NOT NULL,
        type enum('income', 'expense') NOT NULL,
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
        status enum('unpaid', 'partial', 'paid', 'void') DEFAULT 'unpaid',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), UNIQUE KEY invoice_number (invoice_number)
    ) $charset_collate;";
    dbDelta($sql_invoices);

    /* =========================================
       7. INVENTORY & LOGISTICS (ADVANCED)
       ========================================= */

    $sql_warehouse = "CREATE TABLE {$wpdb->prefix}umh_warehouses (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        name varchar(100) NOT NULL,
        location varchar(100),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_warehouse);

    $sql_inventory = "CREATE TABLE {$wpdb->prefix}umh_inventory_items (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        item_code varchar(50), 
        item_name varchar(100) NOT NULL,
        category enum('perlengkapan', 'dokumen', 'souvenir') DEFAULT 'perlengkapan',
        unit_cost decimal(15,2) DEFAULT 0,
        sale_price decimal(15,2) DEFAULT 0,
        stock_qty int DEFAULT 0, -- Total Stock
        updated_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_inventory);

    $sql_inv_trx = "CREATE TABLE {$wpdb->prefix}umh_inventory_transactions (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        item_id bigint(20) UNSIGNED NOT NULL,
        warehouse_id bigint(20) UNSIGNED DEFAULT 1,
        type enum('in', 'out', 'adjust', 'transfer') NOT NULL,
        qty int NOT NULL,
        reference_no varchar(50), -- No PO atau No Booking
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY item_id (item_id)
    ) $charset_collate;";
    dbDelta($sql_inv_trx);

    $sql_dist = "CREATE TABLE {$wpdb->prefix}umh_logistics_distribution (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        item_id bigint(20) UNSIGNED NOT NULL,
        qty int DEFAULT 1,
        status enum('pending', 'ready', 'taken', 'shipped') DEFAULT 'pending',
        taken_date datetime,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_dist);

    /* =========================================
       8. AGEN & KOMISI
       ========================================= */

    $sql_agents = "CREATE TABLE {$wpdb->prefix}umh_agents (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        email varchar(100),
        phone varchar(20),
        code varchar(50) UNIQUE,
        type enum('master', 'agent', 'freelance') DEFAULT 'agent',
        bank_name varchar(50),
        bank_account_number varchar(50),
        status varchar(50) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_agents);

    $sql_commissions = "CREATE TABLE {$wpdb->prefix}umh_agent_commissions (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        agent_id bigint(20) UNSIGNED NOT NULL,
        booking_id bigint(20) UNSIGNED NOT NULL,
        amount decimal(15,2) NOT NULL,
        status enum('pending', 'approved', 'paid', 'cancelled') DEFAULT 'pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), KEY agent_id (agent_id)
    ) $charset_collate;";
    dbDelta($sql_commissions);

    /* =========================================
       9. MARKETING & LEADS
       ========================================= */

    $sql_marketing = "CREATE TABLE {$wpdb->prefix}umh_marketing (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        title varchar(150) NOT NULL,
        platform varchar(50),
        budget decimal(15,2) DEFAULT 0,
        start_date date,
        end_date date,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_marketing);

    $sql_leads = "CREATE TABLE {$wpdb->prefix}umh_leads (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        marketing_id bigint(20) UNSIGNED NULL,
        name varchar(100) NOT NULL,
        phone varchar(20),
        source varchar(50),
        status enum('new', 'contacted', 'hot', 'deal', 'lost') DEFAULT 'new',
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        KEY marketing_id (marketing_id)
    ) $charset_collate;";
    dbDelta($sql_leads);

    /* =========================================
       10. TASKS & LOGS
       ========================================= */

    $sql_tasks = "CREATE TABLE {$wpdb->prefix}umh_tasks (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        title varchar(200) NOT NULL,
        description text,
        assigned_to bigint(20) UNSIGNED NULL,
        due_date date,
        priority enum('low', 'medium', 'high') DEFAULT 'medium',
        status enum('pending', 'in_progress', 'completed') DEFAULT 'pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY (id), UNIQUE KEY uuid (uuid)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    $sql_audit = "CREATE TABLE {$wpdb->prefix}umh_audit_trails (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        table_name varchar(50) NOT NULL,
        record_id bigint(20) UNSIGNED NOT NULL,
        action varchar(20) NOT NULL, 
        old_values longtext,
        new_values longtext,
        ip_address varchar(45),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY record (table_name, record_id)
    ) $charset_collate;";
    dbDelta($sql_audit);

    $sql_logs = "CREATE TABLE {$wpdb->prefix}umh_activity_logs (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED,
        action varchar(100),
        details text,
        ip_address varchar(45),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_logs);

    /* =========================================
       11. B2B WALLET SYSTEM (V10.0)
       ========================================= */
    
    $sql_wallets = "CREATE TABLE {$wpdb->prefix}umh_wallets (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        owner_type enum('agent', 'branch', 'user') NOT NULL, 
        owner_id bigint(20) UNSIGNED NOT NULL,
        balance decimal(15,2) DEFAULT 0,
        currency varchar(10) DEFAULT 'IDR',
        status enum('active', 'frozen') DEFAULT 'active',
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY owner (owner_type, owner_id)
    ) $charset_collate;";
    dbDelta($sql_wallets);

    $sql_wallet_trx = "CREATE TABLE {$wpdb->prefix}umh_wallet_transactions (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        wallet_id bigint(20) UNSIGNED NOT NULL,
        type enum('topup', 'payment', 'refund', 'commission', 'withdrawal') NOT NULL,
        amount decimal(15,2) NOT NULL, 
        balance_after decimal(15,2) NOT NULL,
        reference_id varchar(100), 
        description text,
        created_by bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY wallet_id (wallet_id)
    ) $charset_collate;";
    dbDelta($sql_wallet_trx);

    /* =========================================
       12. SEAT LOCKING SYSTEM (V10.0)
       ========================================= */
    
    $sql_locks = "CREATE TABLE {$wpdb->prefix}umh_seat_locks (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        departure_id bigint(20) UNSIGNED NOT NULL,
        session_id varchar(100) NOT NULL,
        qty int NOT NULL,
        locked_at datetime DEFAULT CURRENT_TIMESTAMP,
        expires_at datetime NOT NULL,
        status enum('locked', 'converted', 'expired') DEFAULT 'locked',
        PRIMARY KEY (id),
        KEY departure_session (departure_id, session_id)
    ) $charset_collate;";
    dbDelta($sql_locks);

    /* =========================================
       13. MANUAL PAYMENT PROOFS (V10.1)
       ========================================= */
    
    $sql_proofs = "CREATE TABLE {$wpdb->prefix}umh_payment_proofs (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        user_id bigint(20) UNSIGNED NOT NULL,
        amount decimal(15,2) NOT NULL,
        payment_method varchar(50) DEFAULT 'bank_transfer',
        bank_destination varchar(50),
        file_url varchar(255) NOT NULL,
        notes text,
        status enum('pending', 'verified', 'rejected') DEFAULT 'pending',
        verified_by bigint(20) UNSIGNED,
        verified_at datetime,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY booking_id (booking_id),
        KEY status (status)
    ) $charset_collate;";
    dbDelta($sql_proofs);

    /* =========================================
       SEED DATA (INITIALIZATION)
       ========================================= */

    // Seed COA
    if ($wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_acc_coa") == 0) {
        $wpdb->query("INSERT INTO {$wpdb->prefix}umh_acc_coa (code, name, type, normal_balance) VALUES 
            ('1-1001', 'Kas Besar', 'asset', 'debit'),
            ('1-1002', 'Bank BCA', 'asset', 'debit'),
            ('1-1003', 'Persediaan Barang', 'asset', 'debit'),
            ('2-1001', 'Hutang Usaha', 'liability', 'credit'),
            ('2-1002', 'Titipan Dana Jemaah (Deposit)', 'liability', 'credit'),
            ('3-1001', 'Modal', 'equity', 'credit'),
            ('4-1001', 'Pendapatan Paket', 'revenue', 'credit'),
            ('5-1001', 'Beban Gaji', 'expense', 'debit'),
            ('5-1002', 'Beban Operasional', 'expense', 'debit'),
            ('5-1003', 'Harga Pokok Penjualan (HPP)', 'expense', 'debit')
        ");
    }

    update_option('umh_db_version', '10.1.0'); 
}