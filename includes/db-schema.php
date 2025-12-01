<?php
/**
 * File: includes/db-schema.php
 * Deskripsi: Skema Database Final Enterprise (End-to-End)
 * Update: Full Version dengan Tabel Keuangan Terpadu, Absensi, Agen 2 Tingkat, & Perbaikan Struktur
 */

if (!defined('ABSPATH')) {
    exit;
}

function umh_run_migration_v3() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // ==========================================================================
    // 1. MASTER DATA (Pondasi Referensi)
    // ==========================================================================

    // 1.1 Master Lokasi (Bandara & Kota)
    $table_locations = $wpdb->prefix . 'umh_master_locations';
    $sql_locations = "CREATE TABLE $table_locations (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL, 
        code varchar(10) NULL,      
        type enum('airport', 'city') NOT NULL DEFAULT 'city',
        country varchar(50) DEFAULT 'Saudi Arabia',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_locations);

    // 1.2 Master Maskapai
    $table_airlines = $wpdb->prefix . 'umh_master_airlines';
    $sql_airlines = "CREATE TABLE $table_airlines (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(10) NULL,
        origin varchar(10) NULL,
        destination varchar(10) NULL,
        transit varchar(100) NULL,
        contact_info text NULL,
        type varchar(20) DEFAULT 'International',
        status varchar(20) DEFAULT 'active',
        logo_url varchar(255) NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_airlines);

    // 1.3 Master Hotel
    $table_hotels = $wpdb->prefix . 'umh_master_hotels';
    $sql_hotels = "CREATE TABLE $table_hotels (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        city varchar(50) NOT NULL, 
        rating varchar(5) DEFAULT '5',
        distance_to_haram int DEFAULT 0, 
        address text,
        description text,
        images longtext,
        map_url text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    // ==========================================================================
    // 2. CRM & DATA JEMAAH (Profile)
    // ==========================================================================

    // 2.1 Master Jemaah (Data Lengkap)
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $sql_jamaah = "CREATE TABLE $table_jamaah (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NULL, 
        nik varchar(20) UNIQUE,
        passport_number varchar(20),
        full_name varchar(150) NOT NULL,
        full_name_ar varchar(150),
        gender enum('L', 'P') NOT NULL,
        birth_place varchar(50),
        birth_date date,
        phone varchar(20),
        email varchar(100),
        address text,
        city varchar(50),
        job_title varchar(100),
        education varchar(50),
        clothing_size varchar(5),
        disease_history text,
        bpjs_number varchar(30),
        father_name varchar(100),
        mother_name varchar(100),
        spouse_name varchar(100),
        scan_ktp varchar(255),
        scan_kk varchar(255),
        scan_passport varchar(255),
        scan_photo varchar(255),
        scan_buku_nikah varchar(255),
        
        /* Relasi Transaksi */
        package_id bigint(20) UNSIGNED NULL,
        departure_id bigint(20) UNSIGNED NULL,
        room_type varchar(20) DEFAULT 'Quad',
        package_price decimal(15,2) DEFAULT 0,
        amount_paid decimal(15,2) DEFAULT 0,
        
        status enum('registered', 'dp', 'lunas', 'berangkat', 'selesai', 'batal') DEFAULT 'registered',
        payment_status enum('pending', 'belum_lunas', 'lunas') DEFAULT 'pending',
        
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY nik (nik),
        KEY phone (phone)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    // ==========================================================================
    // 3. PRODUK & INVENTORY (Paket)
    // ==========================================================================

    // 3.1 Katalog Paket
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql_packages = "CREATE TABLE $table_packages (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(200) NOT NULL,
        slug varchar(200) UNIQUE,
        type enum('umrah', 'haji', 'tour') DEFAULT 'umrah',
        category_id bigint(20) UNSIGNED NULL,
        airline_id bigint(20) UNSIGNED NULL,
        hotel_makkah_id bigint(20) UNSIGNED NULL,
        hotel_madinah_id bigint(20) UNSIGNED NULL,
        duration_days int DEFAULT 9,
        base_price decimal(15,2) DEFAULT 0,
        description longtext,
        included_features longtext,
        excluded_features longtext,
        terms_conditions longtext,
        status enum('active', 'archived') DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // 3.2 Jadwal Keberangkatan (Inventory)
    $table_departures = $wpdb->prefix . 'umh_departures';
    $sql_departures = "CREATE TABLE $table_departures (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id bigint(20) UNSIGNED NOT NULL,
        departure_date date NOT NULL,
        return_date date NOT NULL,
        airline_id bigint(20) UNSIGNED,
        origin_airport_id bigint(20) UNSIGNED,
        hotel_makkah_id bigint(20) UNSIGNED,
        hotel_madinah_id bigint(20) UNSIGNED,
        quota int DEFAULT 45,
        filled_seats int DEFAULT 0,
        available_seats int DEFAULT 45,
        price_quad decimal(15,2) DEFAULT 0,
        price_triple decimal(15,2) DEFAULT 0,
        price_double decimal(15,2) DEFAULT 0,
        price_override decimal(15,2) DEFAULT 0,
        currency varchar(3) DEFAULT 'IDR',
        tour_leader_name varchar(100),
        mutawwif_name varchar(100),
        status enum('open', 'closed', 'departed', 'completed', 'cancelled') DEFAULT 'open',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY package_id (package_id),
        KEY departure_date (departure_date)
    ) $charset_collate;";
    dbDelta($sql_departures);
    
    // 3.3 Kategori Paket
    $table_pkg_cats = $wpdb->prefix . 'umh_package_categories';
    $sql_pkg_cats = "CREATE TABLE $table_pkg_cats (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        slug varchar(100),
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_pkg_cats);

    // ==========================================================================
    // 4. KEUANGAN TERPADU (Unified Finance)
    // ==========================================================================
    
    // 4.1 Tabel Finance (Menggantikan umh_payments)
    $table_finance = $wpdb->prefix . 'umh_finance';
    $sql_finance = "CREATE TABLE $table_finance (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        transaction_date date NOT NULL,
        type enum('income', 'expense') NOT NULL,
        category varchar(100) DEFAULT 'General',
        amount decimal(15,2) NOT NULL,
        description text,
        jamaah_id bigint(20) UNSIGNED NULL,
        employee_id bigint(20) UNSIGNED NULL,
        agent_id bigint(20) UNSIGNED NULL,
        payment_method varchar(50) DEFAULT 'transfer',
        proof_file varchar(255) NULL,
        status enum('pending', 'verified', 'cancelled') DEFAULT 'verified',
        created_by bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY jamaah_id (jamaah_id),
        KEY type (type)
    ) $charset_collate;";
    dbDelta($sql_finance);
    
    // 4.2 Kategori Keuangan (COA)
    $table_categories = $wpdb->prefix . 'umh_categories';
    $sql_categories = "CREATE TABLE $table_categories (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        type enum('income', 'expense') NOT NULL,
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_categories);

    // ==========================================================================
    // 5. SUMBER DAYA MANUSIA (HR & Agen)
    // ==========================================================================
    
    // 5.1 Profil Agen (Fix Unique Key & Kolom)
    $table_agents = $wpdb->prefix . 'umh_agents';
    $sql_agents = "CREATE TABLE $table_agents (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL DEFAULT 0,
        name varchar(100) NOT NULL,
        email varchar(100),
        phone varchar(20),
        city varchar(50),
        code varchar(50), /* Kode unik agen */
        parent_id bigint(20) UNSIGNED NULL,
        type varchar(20) DEFAULT 'master',
        agency_name varchar(100),
        level enum('silver', 'gold', 'platinum') DEFAULT 'silver',
        fixed_commission decimal(15,2) DEFAULT 0,
        bank_name varchar(50),
        bank_account_number varchar(50),
        bank_account_holder varchar(100),
        status enum('active', 'suspended', 'inactive') DEFAULT 'active',
        joined_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY code (code)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // 5.2 Data Karyawan (HR)
    $table_employees = $wpdb->prefix . 'umh_hr_employees';
    $sql_employees = "CREATE TABLE $table_employees (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED DEFAULT 0,
        name varchar(100) NOT NULL,
        email varchar(100),
        phone varchar(20),
        position varchar(100),
        department varchar(100),
        join_date date,
        salary decimal(15,2) DEFAULT 0,
        status enum('active', 'resigned', 'terminated') DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    // 5.3 Absensi Karyawan (BARU)
    $table_attendance = $wpdb->prefix . 'umh_hr_attendance';
    $sql_attendance = "CREATE TABLE $table_attendance (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        date date NOT NULL,
        employee_id bigint(20) UNSIGNED NOT NULL,
        status enum('present', 'sick', 'permit', 'alpha') DEFAULT 'present',
        notes text,
        check_in_time time,
        check_out_time time,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY emp_date (employee_id, date)
    ) $charset_collate;";
    dbDelta($sql_attendance);

    // ==========================================================================
    // 6. MARKETING & LEADS
    // ==========================================================================

    // 6.1 Kampanye Iklan
    $table_marketing = $wpdb->prefix . 'umh_marketing'; 
    $sql_marketing = "CREATE TABLE $table_marketing (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        platform varchar(50),
        budget decimal(15,2) DEFAULT 0,
        start_date date,
        end_date date,
        status varchar(20) DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_marketing);

    // 6.2 Data Leads (Prospek)
    $table_leads = $wpdb->prefix . 'umh_leads';
    $sql_leads = "CREATE TABLE $table_leads (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        phone varchar(20),
        email varchar(100),
        source varchar(50),
        status varchar(50) DEFAULT 'new',
        notes text,
        follow_up_date date,
        assigned_to bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_leads);

    // ==========================================================================
    // 7. OPERASIONAL & PENDUKUNG
    // ==========================================================================

    // 7.1 Tabel Logistik
    $table_logistics = $wpdb->prefix . 'umh_logistics';
    $sql_logistics = "CREATE TABLE $table_logistics (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        item_name varchar(100) NOT NULL,
        stock_qty int DEFAULT 0,
        min_stock_alert int DEFAULT 10,
        unit varchar(20) DEFAULT 'Pcs',
        status varchar(20) DEFAULT 'safe',
        /* Kolom tambahan untuk tracking per jemaah jika desain tabel digabung */
        jamaah_id bigint(20) UNSIGNED NULL,
        items_status longtext, /* JSON status checklist */
        date_taken datetime,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_logistics);
    
    // 7.2 Tabel Tasks
    $table_tasks = $wpdb->prefix . 'umh_tasks';
    $sql_tasks = "CREATE TABLE $table_tasks (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        assigned_to bigint(20) UNSIGNED,
        due_date date,
        priority enum('low', 'medium', 'high') DEFAULT 'medium',
        status enum('pending', 'in_progress', 'completed') DEFAULT 'pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    // ==========================================================================
    // 8. USER MANAGEMENT & ROLES
    // ==========================================================================

    // 8.1 Tabel Users (Custom Auth)
    $table_users = $wpdb->prefix . 'umh_users';
    $sql_users = "CREATE TABLE $table_users (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        username varchar(60) NOT NULL,
        email varchar(100) NOT NULL,
        password_hash varchar(255) NOT NULL,
        full_name varchar(100),
        first_name varchar(100),
        last_name varchar(100),
        role varchar(50) DEFAULT 'subscriber',
        phone varchar(20),
        status varchar(20) DEFAULT 'active',
        auth_token varchar(255),
        token_expires datetime,
        wp_user_id bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY username (username),
        UNIQUE KEY email (email)
    ) $charset_collate;";
    dbDelta($sql_users);
    
    // 8.2 Master Roles
    $table_roles = $wpdb->prefix . 'umh_roles';
    $sql_roles = "CREATE TABLE $table_roles (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        role_key varchar(50) NOT NULL, 
        role_name varchar(100) NOT NULL,
        capabilities longtext,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY role_key (role_key)
    ) $charset_collate;";
    dbDelta($sql_roles);
}