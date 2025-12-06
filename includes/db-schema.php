<?php
/**
 * File: includes/db-schema.php
 * Deskripsi: Skema Database Enterprise Lengkap (V9.0)
 * Fitur: Akuntansi (Double Entry), Logistik Multi-Gudang, CRM, HRD, Multi-Cabang.
 */

if (!defined('ABSPATH')) {
    exit;
}

function umh_create_db_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    /* =========================================
       1. SYSTEM & MULTI-BRANCH (FOUNDATION)
       ========================================= */
    
    // Tabel Cabang (Pusat & Cabang)
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

    // Tabel Users Custom (Login Terpisah dari WP User biasa untuk keamanan)
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
        updated_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        UNIQUE KEY username (username),
        KEY branch_id (branch_id)
    ) $charset_collate;";
    dbDelta($sql_users);

    // Tabel Role Custom (Hak Akses Granular)
    $sql_roles = "CREATE TABLE {$wpdb->prefix}umh_roles (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        role_key varchar(50) NOT NULL, 
        role_name varchar(100) NOT NULL,
        capabilities longtext, -- JSON capabilities
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY role_key (role_key)
    ) $charset_collate;";
    dbDelta($sql_roles);

    /* =========================================
       2. PRODUCT & MASTER DATA
       ========================================= */

    // Master Hotel
    $sql_hotels = "CREATE TABLE {$wpdb->prefix}umh_master_hotels (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        name varchar(150) NOT NULL,
        city enum('Makkah', 'Madinah', 'Jeddah', 'Istanbul', 'Dubai', 'Lainnya') NOT NULL, 
        rating varchar(5) DEFAULT '5',
        distance_to_haram int DEFAULT 0, 
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    // Master Maskapai
    $sql_airlines = "CREATE TABLE {$wpdb->prefix}umh_master_airlines (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        name varchar(100) NOT NULL,
        code varchar(10) NULL,
        type varchar(20) DEFAULT 'International',
        logo_url varchar(255),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_airlines);

    // Paket Umroh/Haji (Produk Utama)
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
        updated_at datetime NULL,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // Relasi Paket -> Hotel (Many-to-Many + Atribut)
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

    // Itinerary Paket
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

    /* =========================================
       3. OPERATIONAL & DEPARTURES
       ========================================= */

    // Jadwal Keberangkatan
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
        updated_at datetime NULL,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        KEY package_id (package_id),
        KEY departure_date (departure_date)
    ) $charset_collate;";
    dbDelta($sql_departures);

    // Rooming List (Pembagian Kamar)
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
       4. SALES, BOOKING & JAMAAH
       ========================================= */

    // Data Master Jemaah
    $sql_jamaah = "CREATE TABLE {$wpdb->prefix}umh_jamaah (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        user_id bigint(20) UNSIGNED NULL, -- Link ke User Login jika ada
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        pic varchar(100) DEFAULT 'Pusat',
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
        status enum('lead', 'registered', 'active_jamaah', 'alumni') DEFAULT 'registered',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NULL,
        deleted_at datetime NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY uuid (uuid),
        KEY pic (pic)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    // Dokumen Jemaah (Paspor, KTP, Visa)
    $sql_docs = "CREATE TABLE {$wpdb->prefix}umh_jamaah_documents (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        doc_type varchar(50) NOT NULL, -- passport, ktp, photo, vaccine
        file_path varchar(255) NOT NULL,
        file_name varchar(100),
        status varchar(20) DEFAULT 'pending', -- pending, verified, rejected
        notes text,
        uploaded_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_docs);

    // Transaksi Booking Header
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
        payment_status enum('unpaid', 'dp', 'partial', 'paid', 'overdue', 'refunded') DEFAULT 'unpaid',
        status enum('draft', 'pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'draft',
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

    // Detail Pax per Booking
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
       5. FINANCE & ACCOUNTING (THE CORE)
       ========================================= */

    // Chart of Accounts (COA) - Akun Akuntansi
    $sql_coa = "CREATE TABLE {$wpdb->prefix}umh_acc_coa (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        code varchar(20) NOT NULL, -- 1-1001
        name varchar(100) NOT NULL, -- Kas Besar
        type enum('asset', 'liability', 'equity', 'revenue', 'expense') NOT NULL,
        normal_balance enum('debit', 'credit') NOT NULL,
        is_active boolean DEFAULT 1,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), UNIQUE KEY code (code)
    ) $charset_collate;";
    dbDelta($sql_coa);

    // Journal Entries (Header Transaksi Jurnal)
    $sql_journal = "CREATE TABLE {$wpdb->prefix}umh_acc_journal_entries (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        transaction_date date NOT NULL,
        reference_no varchar(50), -- No Bukti / Invoice
        description text,
        total_amount decimal(15,2) NOT NULL,
        source_module varchar(50), -- ex: 'booking', 'payroll', 'purchase'
        source_id bigint(20) UNSIGNED,
        status enum('draft', 'posted', 'void') DEFAULT 'posted',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NULL,
        deleted_at datetime NULL,
        PRIMARY KEY (id),
        KEY transaction_date (transaction_date)
    ) $charset_collate;";
    dbDelta($sql_journal);

    // Journal Items (Detail Debit/Credit)
    $sql_journal_items = "CREATE TABLE {$wpdb->prefix}umh_acc_journal_items (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        journal_id bigint(20) UNSIGNED NOT NULL,
        coa_id bigint(20) UNSIGNED NOT NULL,
        debit decimal(15,2) DEFAULT 0,
        credit decimal(15,2) DEFAULT 0,
        description varchar(255), -- Keterangan per baris (opsional)
        PRIMARY KEY (id),
        KEY journal_id (journal_id),
        KEY coa_id (coa_id)
    ) $charset_collate;";
    dbDelta($sql_journal_items);

    // Tabel Finance Sederhana (Untuk Dashboard Cepat & Input Expense Manual)
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

    // Invoices (Tagihan ke Jemaah/Agen)
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
       6. INVENTORY & LOGISTICS
       ========================================= */

    // Master Gudang
    $sql_warehouse = "CREATE TABLE {$wpdb->prefix}umh_warehouses (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        branch_id bigint(20) UNSIGNED DEFAULT 1,
        name varchar(100) NOT NULL,
        location varchar(100),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_warehouse);

    // Master Barang (Inventory Items)
    $sql_inventory = "CREATE TABLE {$wpdb->prefix}umh_inventory_items (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        item_code varchar(50) UNIQUE, 
        item_name varchar(100) NOT NULL,
        category enum('perlengkapan', 'dokumen', 'souvenir') DEFAULT 'perlengkapan',
        unit_cost decimal(15,2) DEFAULT 0, -- HPP
        sale_price decimal(15,2) DEFAULT 0,
        stock_total int DEFAULT 0, -- Agregat
        updated_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_inventory);

    // Transaksi Inventory (Kartu Stok: Masuk/Keluar/Opname)
    $sql_inv_trx = "CREATE TABLE {$wpdb->prefix}umh_inventory_transactions (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        item_id bigint(20) UNSIGNED NOT NULL,
        warehouse_id bigint(20) UNSIGNED DEFAULT 1,
        type enum('in', 'out', 'adjust', 'transfer') NOT NULL,
        qty int NOT NULL,
        balance_after int NOT NULL, -- Sisa stok setelah transaksi
        reference_no varchar(50), -- No PO atau No Booking
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY item_id (item_id)
    ) $charset_collate;";
    dbDelta($sql_inv_trx);

    // Distribusi Perlengkapan ke Jemaah
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
        KEY booking_id (booking_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_dist);

    /* =========================================
       7. PROCUREMENT (VENDORS & PURCHASING)
       ========================================= */

    // Master Vendor
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

    // Purchase Orders (PO)
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
        updated_at datetime NULL,
        deleted_at datetime NULL,
        PRIMARY KEY (id),
        UNIQUE KEY po_number (po_number),
        KEY vendor_id (vendor_id)
    ) $charset_collate;";
    dbDelta($sql_purchases);

    /* =========================================
       8. AGEN & KOMISI
       ========================================= */

    $sql_agents = "CREATE TABLE {$wpdb->prefix}umh_agents (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        name varchar(100) NOT NULL,
        code varchar(50) UNIQUE,
        email varchar(100),
        phone varchar(20),
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
        paid_date datetime,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id), 
        KEY agent_id (agent_id)
    ) $charset_collate;";
    dbDelta($sql_commissions);

    /* =========================================
       9. HR & MARKETING (CRM)
       ========================================= */

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
        PRIMARY KEY (id),
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
        status enum('new', 'contacted', 'hot', 'deal', 'lost') DEFAULT 'new',
        marketing_id bigint(20) UNSIGNED NULL, -- Link ke Campaign
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_leads);
    
    // Marketing Campaigns
    $sql_marketing = "CREATE TABLE {$wpdb->prefix}umh_marketing (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        title varchar(150) NOT NULL,
        platform varchar(50), -- FB, IG, Google
        budget decimal(15,2) DEFAULT 0,
        start_date date,
        end_date date,
        status enum('active', 'paused', 'completed') DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_marketing);

    /* =========================================
       10. UTILITIES (TASKS & LOGS)
       ========================================= */

    $sql_tasks = "CREATE TABLE {$wpdb->prefix}umh_tasks (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        uuid char(36) NOT NULL,
        title varchar(200) NOT NULL,
        description text,
        assigned_to bigint(20) UNSIGNED, 
        priority enum('low', 'medium', 'high') DEFAULT 'medium',
        status enum('pending', 'in_progress', 'completed') DEFAULT 'pending',
        due_date date,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        deleted_at datetime NULL,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    // Audit Trail (Security)
    $sql_audit = "CREATE TABLE {$wpdb->prefix}umh_audit_trails (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        action varchar(50) NOT NULL, -- CREATE, UPDATE, DELETE
        table_name varchar(50) NOT NULL,
        record_id bigint(20) UNSIGNED NOT NULL,
        old_values longtext, 
        new_values longtext, 
        ip_address varchar(45),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY record (table_name, record_id)
    ) $charset_collate;";
    dbDelta($sql_audit);
    
    // Tabel Log Aktivitas Umum (Login, Export, dll)
    $sql_activity_logs = "CREATE TABLE {$wpdb->prefix}umh_activity_logs (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED,
        action varchar(100),
        details text,
        ip_address varchar(45),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_activity_logs);

    /* =========================================
       SEEDING INITIAL DATA
       ========================================= */

    // SEED COA (Chart of Accounts Standard Umroh)
    if ($wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_acc_coa") == 0) {
        $wpdb->query("INSERT INTO {$wpdb->prefix}umh_acc_coa (code, name, type, normal_balance) VALUES 
            ('1-1001', 'Kas Besar', 'asset', 'debit'),
            ('1-1002', 'Bank BCA', 'asset', 'debit'),
            ('1-1003', 'Bank Mandiri', 'asset', 'debit'),
            ('1-1004', 'Piutang Usaha', 'asset', 'debit'),
            ('1-1005', 'Persediaan Perlengkapan', 'asset', 'debit'),
            ('1-2001', 'Aset Tetap - Kendaraan', 'asset', 'debit'),
            ('2-1001', 'Hutang Usaha (Vendor)', 'liability', 'credit'),
            ('2-1002', 'Titipan Dana Jemaah (Deposit)', 'liability', 'credit'),
            ('2-1003', 'Hutang Komisi Agen', 'liability', 'credit'),
            ('3-1001', 'Modal Disetor', 'equity', 'credit'),
            ('3-1002', 'Laba Ditahan', 'equity', 'credit'),
            ('4-1001', 'Pendapatan Paket Umroh', 'revenue', 'credit'),
            ('4-1002', 'Pendapatan LA / Visa', 'revenue', 'credit'),
            ('5-1001', 'Beban Gaji & Upah', 'expense', 'debit'),
            ('5-1002', 'Beban Operasional Kantor', 'expense', 'debit'),
            ('5-1003', 'Beban Marketing & Iklan', 'expense', 'debit'),
            ('5-2001', 'HPP - Tiket Pesawat', 'expense', 'debit'),
            ('5-2002', 'HPP - Hotel & Akomodasi', 'expense', 'debit'),
            ('5-2003', 'HPP - Visa & Mutawif', 'expense', 'debit')
        ");
    }

    // Seed Branch Pusat
    if ($wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_branches") == 0) {
        $wpdb->query("INSERT INTO {$wpdb->prefix}umh_branches (name, code, address, is_hq) VALUES ('Kantor Pusat', 'HQ', 'Jakarta', 1)");
    }

    // Seed Gudang Utama
    if ($wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}umh_warehouses") == 0) {
        $wpdb->query("INSERT INTO {$wpdb->prefix}umh_warehouses (name, location) VALUES ('Gudang Utama', 'Kantor Pusat')");
    }

    update_option('umh_db_version', '9.0.0'); 
}