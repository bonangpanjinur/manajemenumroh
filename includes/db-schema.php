<?php
/**
 * File: includes/db-schema.php
 * Deskripsi: Skema Database Final Enterprise (End-to-End)
 * Update: Menambahkan kolom yang hilang di tabel packages.
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
        star_rating tinyint(1) DEFAULT 5,
        distance_to_haram int DEFAULT 0, 
        map_url text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    // ==========================================================================
    // 2. CRM & DATA JEMAAH (Profile)
    // ==========================================================================

    // 2.1 Master Jemaah (Data Diri)
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
        
        /* Data Fisik & Kesehatan */
        clothing_size varchar(5),
        disease_history text,
        bpjs_number varchar(30),
        
        /* Relasi Keluarga (Mahram) */
        father_name varchar(100),
        mother_name varchar(100),
        spouse_name varchar(100),
        
        /* Dokumen Master (URL File) */
        scan_ktp varchar(255),
        scan_kk varchar(255),
        scan_passport varchar(255),
        scan_photo varchar(255),
        scan_buku_nikah varchar(255),
        
        /* Transaksi Ringkas (Denormalisasi) */
        package_id bigint(20) UNSIGNED NULL,
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

    // 3.1 Katalog Paket (Template)
    // UPDATE: Menambahkan kolom airline, hotel, price agar sesuai frontend
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql_packages = "CREATE TABLE $table_packages (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(200) NOT NULL,
        slug varchar(200) UNIQUE,
        type enum('umrah', 'haji', 'tour') DEFAULT 'umrah',
        category_id bigint(20) UNSIGNED NULL,
        
        /* Spesifikasi Default Paket */
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
        filled_seats int DEFAULT 0, /* Kolom ini penting untuk hitung sisa */
        available_seats int DEFAULT 45,
        price_quad decimal(15,2) NOT NULL,
        price_triple decimal(15,2) DEFAULT 0,
        price_double decimal(15,2) DEFAULT 0,
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

    // ... (Tabel lainnya seperti finance, logistik, dll tetap sama)
    // Saya sertakan tabel penting lainnya agar tidak hilang saat copy-paste full file
    
    // 7.1 Profil Agen
    $table_agents = $wpdb->prefix . 'umh_agents';
    $sql_agents = "CREATE TABLE $table_agents (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL DEFAULT 0,
        name varchar(100) NOT NULL,
        email varchar(100),
        phone varchar(20),
        city varchar(50),
        code varchar(50),
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
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // 5. PEMBAYARAN JAMAAH
    $table_payments = $wpdb->prefix . 'umh_payments';
    $sql_payments = "CREATE TABLE $table_payments (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        amount decimal(15,2) NOT NULL,
        payment_date date NOT NULL,
        payment_method varchar(50) DEFAULT 'transfer',
        status enum('pending', 'verified', 'cancelled') DEFAULT 'pending',
        notes text,
        created_by bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_payments);

    // 12.1 Master Roles
    $table_app_roles = $wpdb->prefix . 'umh_app_roles';
    $sql_app_roles = "CREATE TABLE $table_app_roles (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        role_name varchar(50) NOT NULL, 
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_app_roles);
    
    // 10.1 Data Karyawan (HR)
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

    // 11.2 Transaksi Keuangan (Categories)
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
    
    // Tabel Logistik
    $table_logistics = $wpdb->prefix . 'umh_logistics';
    $sql_logistics = "CREATE TABLE $table_logistics (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        item_name varchar(100) NOT NULL,
        stock_qty int DEFAULT 0,
        min_stock_alert int DEFAULT 10,
        unit varchar(20) DEFAULT 'Pcs',
        status varchar(20) DEFAULT 'safe',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_logistics);
    
    // Tabel Tasks
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

    // Tabel Users (Custom untuk staf jika tidak pakai WP users penuh)
    $table_users = $wpdb->prefix . 'umh_users';
    $sql_users = "CREATE TABLE $table_users (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        username varchar(60) NOT NULL,
        email varchar(100) NOT NULL,
        password_hash varchar(255) NOT NULL,
        full_name varchar(100),
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
}