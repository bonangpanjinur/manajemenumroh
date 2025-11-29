<?php
if (!defined('ABSPATH')) {
    exit;
}

function umh_create_db_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // =========================================================
    // 1. SYSTEM & USERS (Akses Sistem)
    // =========================================================

    // 1.1 USERS (Custom User Table)
    $table_users = $wpdb->prefix . 'umh_users';
    $sql_users = "CREATE TABLE $table_users (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        username varchar(60) NOT NULL,
        email varchar(100) NOT NULL,
        password_hash varchar(255) NOT NULL,
        full_name varchar(150) NOT NULL,
        role varchar(50) NOT NULL DEFAULT 'subscriber',
        phone varchar(20),
        status varchar(20) DEFAULT 'active',
        auth_token varchar(255),
        token_expires datetime,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY username (username),
        UNIQUE KEY email (email)
    ) $charset_collate;";
    dbDelta($sql_users);

    // =========================================================
    // 2. MASTER DATA (Referensi Data)
    // =========================================================

    // 2.1 PACKAGE CATEGORIES
    $table_pkg_cats = $wpdb->prefix . 'umh_package_categories';
    $sql_pkg_cats = "CREATE TABLE $table_pkg_cats (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_pkg_cats);

    // 2.2 HOTELS
    $table_hotels = $wpdb->prefix . 'umh_hotels';
    $sql_hotels = "CREATE TABLE $table_hotels (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        city varchar(50) NOT NULL, /* Makkah / Madinah / Jeddah */
        star_rating tinyint(1) DEFAULT 3,
        distance_to_haram int DEFAULT 0,
        map_link text,
        contact_person varchar(100),
        phone varchar(20),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    // 2.3 FLIGHTS (Maskapai)
    $table_flights = $wpdb->prefix . 'umh_flights';
    $sql_flights = "CREATE TABLE $table_flights (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(20),
        contact_info varchar(100),
        type varchar(20) DEFAULT 'International',
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_flights);

    // 2.4 LOGISTICS MASTER (Barang/Perlengkapan)
    $table_logistics = $wpdb->prefix . 'umh_logistics';
    $sql_logistics = "CREATE TABLE $table_logistics (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        item_name varchar(100) NOT NULL,
        stock_qty int DEFAULT 0,
        unit varchar(20) DEFAULT 'pcs',
        cost_price decimal(15,2) DEFAULT 0,
        description text,
        last_updated datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_logistics);

    // =========================================================
    // 3. PRODUCT & SERVICES (Paket & Keberangkatan)
    // =========================================================

    // 3.1 PACKAGES (Header Paket)
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql_packages = "CREATE TABLE $table_packages (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(200) NOT NULL,
        category_id mediumint(9), /* Relasi ke Kategori */
        airline_id mediumint(9),  /* Relasi ke Master Maskapai */
        duration int DEFAULT 9,
        description text,
        facilities text,
        
        /* Itinerary */
        itinerary_type varchar(20) DEFAULT 'text', /* text / file */
        itinerary_content longtext,
        itinerary_file_url varchar(255),
        
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // 3.2 PACKAGE HOTELS (Relasi Many-to-Many Paket & Hotel)
    $table_pkg_hotels = $wpdb->prefix . 'umh_package_hotels';
    $sql_pkg_hotels = "CREATE TABLE $table_pkg_hotels (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        package_id mediumint(9) NOT NULL,
        hotel_id mediumint(9) NOT NULL,
        city_type varchar(20) NOT NULL, /* makkah / madinah / transit */
        nights int DEFAULT 0,
        KEY package_id (package_id),
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_pkg_hotels);

    // 3.3 DEPARTURES (Jadwal, Seat, & Harga)
    $table_departures = $wpdb->prefix . 'umh_departures';
    $sql_departures = "CREATE TABLE $table_departures (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        package_id mediumint(9) NOT NULL,
        departure_date date NOT NULL,
        return_date date,
        
        /* Seat Management */
        quota int DEFAULT 45,
        booked int DEFAULT 0,
        
        /* Pricing Options (Rupiah) */
        price_quad decimal(15,2) DEFAULT 0,
        price_triple decimal(15,2) DEFAULT 0,
        price_double decimal(15,2) DEFAULT 0,
        currency varchar(5) DEFAULT 'IDR',
        
        status varchar(20) DEFAULT 'open', /* open, full, departed, completed, cancelled */
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_departures);

    // =========================================================
    // 4. HUMAN RESOURCES & PARTNERS
    // =========================================================

    // 4.1 EMPLOYEES (Tim Internal)
    $table_employees = $wpdb->prefix . 'umh_employees';
    $sql_employees = "CREATE TABLE $table_employees (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        position varchar(100),
        phone varchar(20),
        email varchar(100),
        salary decimal(15,2) DEFAULT 0,
        user_id bigint(20) UNSIGNED NULL,
        status varchar(20) DEFAULT 'active',
        joined_date date,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    // 4.2 AGENTS (Mitra / Agen)
    $table_agents = $wpdb->prefix . 'umh_agents';
    $sql_agents = "CREATE TABLE $table_agents (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(20) NULL,
        phone varchar(20),
        email varchar(100),
        city varchar(50),
        type varchar(20) DEFAULT 'master',
        parent_id mediumint(9) NULL,
        commission_nominal decimal(15,2) DEFAULT 0,
        status varchar(20) DEFAULT 'active',
        bank_details text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // =========================================================
    // 5. CRM & MARKETING
    // =========================================================

    // 5.1 LEADS (Calon Prospek)
    $table_leads = $wpdb->prefix . 'umh_leads';
    $sql_leads = "CREATE TABLE $table_leads (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        phone varchar(20) NOT NULL,
        source varchar(50) DEFAULT 'manual',
        status varchar(20) DEFAULT 'new',
        notes text,
        assigned_to mediumint(9) NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_leads);

    // 5.2 MARKETING CAMPAIGNS
    $table_marketing = $wpdb->prefix . 'umh_marketing';
    $sql_marketing = "CREATE TABLE $table_marketing (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
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

    // =========================================================
    // 6. JAMAAH MANAGEMENT (Inti Data)
    // =========================================================

    // 6.1 JAMAAH PROFILE (Data Diri & Paket)
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $sql_jamaah = "CREATE TABLE $table_jamaah (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        full_name varchar(150) NOT NULL,
        nik varchar(20),
        passport_number varchar(20),
        gender enum('L','P'),
        phone varchar(20),
        address text,
        city varchar(50),
        birth_date date,
        
        /* Relasi Paket */
        departure_id mediumint(9), 
        package_type varchar(10) DEFAULT 'quad', /* quad, triple, double */
        package_price decimal(15,2) DEFAULT 0,   /* Harga deal saat daftar */
        
        /* Relasi Agen */
        agent_id mediumint(9) NULL,
        
        status varchar(20) DEFAULT 'registered', /* registered, dp, lunas, berangkat... */
        user_id bigint(20) UNSIGNED NULL,
        
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    // 6.2 JAMAAH DOCUMENTS (NEW - Tabel Khusus Dokumen)
    $table_jamaah_docs = $wpdb->prefix . 'umh_jamaah_documents';
    $sql_jamaah_docs = "CREATE TABLE $table_jamaah_docs (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        jamaah_id mediumint(9) NOT NULL,
        document_type varchar(50) NOT NULL, /* ktp, passport, kk, buku_nikah, vaksin */
        file_url varchar(255) NOT NULL,
        status varchar(20) DEFAULT 'pending', /* pending, verified, rejected */
        notes text,
        uploaded_at datetime DEFAULT CURRENT_TIMESTAMP,
        KEY jamaah_id (jamaah_id),
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_jamaah_docs);

    // 6.3 JAMAAH LOGISTICS (Relasi Pengambilan Perlengkapan)
    $table_jamaah_logistics = $wpdb->prefix . 'umh_jamaah_logistics';
    $sql_jamaah_logistics = "CREATE TABLE $table_jamaah_logistics (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        jamaah_id mediumint(9) NOT NULL,
        logistics_id mediumint(9) NOT NULL,
        status varchar(20) DEFAULT 'pending', /* pending, taken */
        taken_date datetime,
        notes text,
        KEY jamaah_id (jamaah_id),
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_jamaah_logistics);

    // =========================================================
    // 7. FINANCE & PAYMENTS
    // =========================================================

    // 7.1 FINANCE (Arus Kas Umum)
    $table_finance = $wpdb->prefix . 'umh_finance';
    $sql_finance = "CREATE TABLE $table_finance (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        date date NOT NULL,
        type varchar(10) NOT NULL, /* income, expense */
        category varchar(50),
        amount decimal(15,2) NOT NULL DEFAULT 0,
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_finance);

    // 7.2 PAYMENTS (Transaksi Pembayaran Jemaah)
    $table_payments = $wpdb->prefix . 'umh_payments';
    $sql_payments = "CREATE TABLE $table_payments (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        invoice_number varchar(50) NOT NULL,
        jamaah_id mediumint(9) NOT NULL,
        amount decimal(15,2) NOT NULL DEFAULT 0,
        payment_date date NOT NULL,
        payment_method varchar(20),
        status varchar(20) DEFAULT 'verified',
        proof_file varchar(255),
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        KEY jamaah_id (jamaah_id),
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_payments);

    // =========================================================
    // 8. UTILITIES
    // =========================================================

    // 8.1 TASKS (ToDo List)
    $table_tasks = $wpdb->prefix . 'umh_tasks';
    $sql_tasks = "CREATE TABLE $table_tasks (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        description text,
        assigned_to mediumint(9) NULL,
        due_date date,
        priority varchar(10) DEFAULT 'medium',
        status varchar(20) DEFAULT 'pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    // 8.2 LOGS (Audit Trail)
    $table_logs = $wpdb->prefix . 'umh_logs';
    $sql_logs = "CREATE TABLE $table_logs (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED,
        action varchar(50),
        details text,
        ip_address varchar(45),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_logs);
}

register_activation_hook(dirname(__DIR__) . '/umroh-manager-hybrid.php', 'umh_create_db_tables');