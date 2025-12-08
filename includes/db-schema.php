<?php
/**
 * File: includes/db-schema.php
 * Deskripsi: Skema Database Final Enterprise (All-in-One Version)
 * Versi DB: 6.1.0
 * Fitur: Core + HR + Agen + Logistik + Tabungan + Private Detail + Mutawwif + Badal + Manasik + Support + Review + Utilities
 */

if (!defined('ABSPATH')) {
    exit;
}

function umh_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // ==========================================
    // 1. MASTER DATA (Global)
    // ==========================================

    // 1.1 Master Lokasi
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
        city_id bigint(20) UNSIGNED,
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

    // 1.4 Master Mutawwif
    $table_mutawwif = $wpdb->prefix . 'umh_master_mutawwifs';
    $sql_mutawwif = "CREATE TABLE $table_mutawwif (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        phone varchar(20) NOT NULL,
        email varchar(100),
        photo_url varchar(255),
        license_number varchar(50),
        languages text,                             
        specialization varchar(100),                
        base_location enum('Makkah', 'Madinah', 'Indonesia') DEFAULT 'Indonesia',
        experience_years int DEFAULT 1,
        rating decimal(3,2) DEFAULT 5.00,
        total_groups_handled int DEFAULT 0,
        status enum('active', 'inactive', 'suspended') DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_mutawwif);

    // ==========================================
    // 2. DATA JAMAAH
    // ==========================================

    // 2.1 Master Jemaah
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $sql_jamaah = "CREATE TABLE $table_jamaah (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NULL, 
        umh_user_id bigint(20) UNSIGNED NULL,
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

    // ==========================================
    // 3. KATALOG & PRODUK
    // ==========================================

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
        base_price_quad decimal(15,2) DEFAULT 0,
        base_price_triple decimal(15,2) DEFAULT 0,
        base_price_double decimal(15,2) DEFAULT 0,
        currency varchar(3) DEFAULT 'IDR',
        down_payment_amount decimal(15,2) DEFAULT 0,
        payment_due_days int DEFAULT 30,
        description longtext,
        included_features longtext,
        excluded_features longtext,
        terms_conditions longtext,
        status enum('active', 'archived', 'inactive', 'draft') DEFAULT 'active',
        image_url varchar(255),
        brochure_pdf varchar(255),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // 3.2 Jadwal Keberangkatan
    $table_departures = $wpdb->prefix . 'umh_departures';
    $sql_departures = "CREATE TABLE $table_departures (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id bigint(20) UNSIGNED NOT NULL,
        departure_type enum('regular', 'private') DEFAULT 'regular',
        linked_private_request_id bigint(20) UNSIGNED NULL,
        departure_date date NOT NULL,
        return_date date NOT NULL,
        airline_id bigint(20) UNSIGNED,
        origin_airport_id bigint(20) UNSIGNED,
        hotel_makkah_id bigint(20) UNSIGNED,
        hotel_madinah_id bigint(20) UNSIGNED,
        quota int DEFAULT 45,
        seat_quota int DEFAULT 45,
        filled_seats int DEFAULT 0,
        seat_booked int DEFAULT 0,
        available_seats int DEFAULT 45,
        price_quad decimal(15,2) DEFAULT 0,
        price_triple decimal(15,2) DEFAULT 0,
        price_double decimal(15,2) DEFAULT 0,
        price_override decimal(15,2) DEFAULT 0,
        currency varchar(3) DEFAULT 'IDR',
        tour_leader_name varchar(100),
        tour_leader_id bigint(20) UNSIGNED NULL,
        mutawwif_name varchar(100),
        mutawwif_id bigint(20) UNSIGNED NULL,
        flight_number_depart varchar(20),
        flight_number_return varchar(20),
        status enum('open', 'closed', 'departed', 'completed', 'cancelled') DEFAULT 'open',
        notes text,
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
        type enum('umrah', 'haji', 'tour') DEFAULT 'umrah',
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_pkg_cats);

    // 3.4 Itinerary
    $table_itinerary = $wpdb->prefix . 'umh_package_itineraries';
    $sql_itinerary = "CREATE TABLE $table_itinerary (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id bigint(20) UNSIGNED NOT NULL,
        day_number int NOT NULL,
        title varchar(150) NOT NULL,
        description text,
        location varchar(100),
        location_id bigint(20) UNSIGNED,
        meals varchar(50),
        image_url varchar(255),
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_itinerary);

    // 3.5 Fasilitas
    $table_facilities = $wpdb->prefix . 'umh_package_facilities';
    $sql_facilities = "CREATE TABLE $table_facilities (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id bigint(20) UNSIGNED NOT NULL,
        item_name varchar(200) NOT NULL,
        type enum('include', 'exclude') NOT NULL,
        icon_class varchar(50),
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_facilities);

    // ==========================================
    // 4. FITUR TABUNGAN (SAVINGS)
    // ==========================================

    // 4.1 Akun Tabungan
    $table_savings = $wpdb->prefix . 'umh_savings_accounts';
    $sql_savings = "CREATE TABLE $table_savings (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        package_id bigint(20) UNSIGNED DEFAULT NULL,   
        tenure_years int(2) NOT NULL DEFAULT 1,        
        target_amount decimal(15,2) NOT NULL,          
        current_balance decimal(15,2) DEFAULT 0,       
        start_date date NOT NULL,
        end_date date NOT NULL,
        status enum('active', 'completed', 'cancelled', 'converted') DEFAULT 'active',
        converted_booking_id bigint(20) UNSIGNED NULL, 
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql_savings);

    // 4.2 Transaksi Tabungan
    $table_saving_trx = $wpdb->prefix . 'umh_savings_transactions';
    $sql_saving_trx = "CREATE TABLE $table_saving_trx (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        savings_account_id bigint(20) UNSIGNED NOT NULL,
        amount decimal(15,2) NOT NULL,
        transaction_date date NOT NULL,
        proof_file_url text NOT NULL,
        payment_method varchar(50) DEFAULT 'bank_transfer',
        status enum('pending', 'verified', 'rejected') DEFAULT 'pending',
        verified_by bigint(20) UNSIGNED DEFAULT NULL,
        verified_at datetime DEFAULT NULL,
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY savings_account_id (savings_account_id)
    ) $charset_collate;";
    dbDelta($sql_saving_trx);

    // ==========================================
    // 5. FITUR PRIVATE UMRAH (UPDATED - STRUCTURED)
    // ==========================================

    // 5.1 Request Private (Detail Pilihan)
    $table_private_req = $wpdb->prefix . 'umh_private_requests';
    $sql_private_req = "CREATE TABLE $table_private_req (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED DEFAULT NULL,
        contact_name varchar(100) NOT NULL,
        contact_phone varchar(20) NOT NULL,
        pax_count int(5) NOT NULL,
        travel_date_start date NOT NULL,
        duration_days int(3) DEFAULT 9,
        
        -- Preferensi Hotel (Pilihan)
        hotel_makkah_pref_id bigint(20) UNSIGNED NULL,
        hotel_madinah_pref_id bigint(20) UNSIGNED NULL,
        hotel_rating_pref enum('3_star', '4_star', '5_star', 'mix') DEFAULT '4_star',
        
        -- Preferensi Maskapai (Pilihan)
        airline_pref_id bigint(20) UNSIGNED NULL,
        
        -- Detail Lainnya (Pilihan Menu & Kendaraan)
        vehicle_type enum('Bus', 'HiAce', 'GMC', 'Private Car') DEFAULT 'Bus',
        meal_type enum('Fullboard', 'Catering', 'Breakfast Only', 'None') DEFAULT 'Fullboard',
        
        budget_per_pax decimal(15,2) DEFAULT NULL,
        additional_notes text,
        
        status enum('new', 'quoted', 'accepted', 'rejected', 'expired') DEFAULT 'new',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_private_req);

    // 5.2 Quotation Private
    $table_private_quote = $wpdb->prefix . 'umh_private_quotations';
    $sql_private_quote = "CREATE TABLE $table_private_quote (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        request_id bigint(20) UNSIGNED NOT NULL,
        title varchar(255) NOT NULL,
        itinerary_details longtext,
        price_per_pax decimal(15,2) NOT NULL,
        total_price decimal(15,2) NOT NULL,
        valid_until date NOT NULL,
        status enum('draft', 'sent', 'accepted', 'expired') DEFAULT 'draft',
        created_by bigint(20) UNSIGNED NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY request_id (request_id)
    ) $charset_collate;";
    dbDelta($sql_private_quote);

    // ==========================================
    // 6. FITUR MANAJEMEN MANASIK
    // ==========================================

    // 6.1 Jadwal Manasik
    $table_manasik = $wpdb->prefix . 'umh_manasik_schedules';
    $sql_manasik = "CREATE TABLE $table_manasik (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        departure_id bigint(20) UNSIGNED NULL, -- Link ke keberangkatan
        title varchar(200) NOT NULL,
        event_date datetime NOT NULL,
        location_name varchar(150),
        location_map_url text,
        ustadz_name varchar(100),
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY departure_id (departure_id)
    ) $charset_collate;";
    dbDelta($sql_manasik);

    // 6.2 Absensi Manasik
    $table_manasik_attn = $wpdb->prefix . 'umh_manasik_attendance';
    $sql_manasik_attn = "CREATE TABLE $table_manasik_attn (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        manasik_schedule_id bigint(20) UNSIGNED NOT NULL,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        status enum('present', 'absent', 'permit') DEFAULT 'absent',
        check_in_time datetime NULL,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY schedule_jamaah (manasik_schedule_id, jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_manasik_attn);

    // ==========================================
    // 7. FITUR SUPPORT & KOMPLAIN
    // ==========================================

    // 7.1 Tiket Bantuan
    $table_tickets = $wpdb->prefix . 'umh_support_tickets';
    $sql_tickets = "CREATE TABLE $table_tickets (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        booking_id bigint(20) UNSIGNED NULL,
        subject varchar(200) NOT NULL,
        category enum('General', 'Hotel', 'Food', 'Transport', 'Visa', 'Other') DEFAULT 'General',
        priority enum('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
        status enum('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql_tickets);

    // 7.2 Pesan/Reply Tiket
    $table_ticket_msgs = $wpdb->prefix . 'umh_support_messages';
    $sql_ticket_msgs = "CREATE TABLE $table_ticket_msgs (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        ticket_id bigint(20) UNSIGNED NOT NULL,
        sender_id bigint(20) UNSIGNED NOT NULL, -- User ID pengirim
        sender_type enum('User', 'Staff', 'System') DEFAULT 'User',
        message text NOT NULL,
        attachment_url varchar(255) NULL,
        is_read boolean DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY ticket_id (ticket_id)
    ) $charset_collate;";
    dbDelta($sql_ticket_msgs);

    // ==========================================
    // 8. FITUR REVIEW & TESTIMONI
    // ==========================================

    $table_reviews = $wpdb->prefix . 'umh_reviews';
    $sql_reviews = "CREATE TABLE $table_reviews (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        user_id bigint(20) UNSIGNED NOT NULL,
        rating_overall int(1) NOT NULL, -- 1 sampai 5
        rating_hotel int(1) DEFAULT 5,
        rating_food int(1) DEFAULT 5,
        rating_mutawwif int(1) DEFAULT 5,
        review_text text,
        is_published boolean DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_reviews);

    // ==========================================
    // 9. FITUR BADAL UMRAH
    // ==========================================
    
    $table_badal = $wpdb->prefix . 'umh_badal_umrah';
    $sql_badal = "CREATE TABLE $table_badal (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        badal_for_name varchar(150) NOT NULL,
        badal_for_gender enum('L', 'P') NOT NULL,
        badal_reason enum('deceased', 'sick', 'old_age') DEFAULT 'deceased',
        assigned_mutawwif_id bigint(20) UNSIGNED NULL,
        execution_date date NULL,                   
        price decimal(15,2) NOT NULL,
        status enum('pending', 'paid', 'assigned', 'completed', 'certificate_sent', 'cancelled') DEFAULT 'pending',
        certificate_url varchar(255) NULL,          
        video_proof_url varchar(255) NULL,          
        admin_notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql_badal);

    // ==========================================
    // 10. FINANCE & TRANSAKSI
    // ==========================================

    // 10.1 Tabel Finance
    $table_finance = $wpdb->prefix . 'umh_finance';
    $sql_finance = "CREATE TABLE $table_finance (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        transaction_date date NOT NULL,
        type enum('income', 'expense') NOT NULL,
        category varchar(100) DEFAULT 'General',
        amount decimal(15,2) NOT NULL,
        description text,
        jamaah_id bigint(20) UNSIGNED NULL,
        booking_id bigint(20) UNSIGNED NULL,
        related_savings_id bigint(20) UNSIGNED NULL, 
        related_badal_id bigint(20) UNSIGNED NULL,   
        employee_id bigint(20) UNSIGNED NULL,
        agent_id bigint(20) UNSIGNED NULL,
        branch_id bigint(20) UNSIGNED DEFAULT 0,
        payment_method varchar(50) DEFAULT 'transfer',
        proof_file varchar(255) NULL,
        status enum('pending', 'verified', 'rejected', 'cancelled') DEFAULT 'verified',
        verified_by bigint(20) UNSIGNED NULL,
        verified_at datetime NULL,
        created_by bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id),
        KEY type (type)
    ) $charset_collate;";
    dbDelta($sql_finance);
    
    // ==========================================
    // 11. AGEN & HR
    // ==========================================

    // 11.1 Profil Agen
    $table_agents = $wpdb->prefix . 'umh_agents';
    $sql_agents = "CREATE TABLE $table_agents (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL DEFAULT 0,
        umh_user_id bigint(20) UNSIGNED,
        name varchar(100) NOT NULL,
        email varchar(100),
        phone varchar(20),
        city varchar(50),
        code varchar(50),
        branch_id bigint(20) UNSIGNED DEFAULT 0,
        parent_id bigint(20) UNSIGNED NULL,
        parent_agent_id bigint(20) UNSIGNED NULL,
        type varchar(20) DEFAULT 'master',
        agency_name varchar(100),
        level enum('silver', 'gold', 'platinum', 'master', 'sub') DEFAULT 'master',
        fixed_commission decimal(15,2) DEFAULT 0,
        commission_type enum('fixed', 'percent') DEFAULT 'fixed',
        commission_value decimal(15,2) DEFAULT 0,
        bank_name varchar(50),
        bank_account_number varchar(50),
        bank_account_holder varchar(100),
        bank_details text,
        contract_file varchar(255),
        status enum('active', 'suspended', 'inactive', 'pending') DEFAULT 'active',
        joined_at datetime DEFAULT CURRENT_TIMESTAMP,
        joined_date date,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // 11.2 Data Karyawan
    $table_employees = $wpdb->prefix . 'umh_hr_employees';
    $sql_employees = "CREATE TABLE $table_employees (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED DEFAULT 0,
        umh_user_id bigint(20) UNSIGNED,
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

    // 11.3 Absensi Karyawan
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

    // ==========================================
    // 12. MARKETING & LEADS
    // ==========================================

    // 12.1 Kampanye Iklan
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

    // 12.2 Leads
    $table_leads = $wpdb->prefix . 'umh_leads';
    $sql_leads = "CREATE TABLE $table_leads (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        phone varchar(20),
        email varchar(100),
        source varchar(50),
        marketing_id bigint(20) UNSIGNED NULL,
        interest_package_id bigint(20) UNSIGNED NULL,
        status enum('new', 'contacted', 'hot', 'deal', 'lost') DEFAULT 'new',
        converted_booking_id bigint(20) UNSIGNED NULL,
        notes text,
        follow_up_date date,
        assigned_to bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_leads);

    // ==========================================
    // 13. LOGISTIK & INVENTORY
    // ==========================================

    // 13.1 Logistik Jamaah
    $table_logistics = $wpdb->prefix . 'umh_logistics';
    $sql_logistics = "CREATE TABLE $table_logistics (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        item_name varchar(100) NOT NULL,
        stock_qty int DEFAULT 0,
        min_stock_alert int DEFAULT 10,
        unit varchar(20) DEFAULT 'Pcs',
        status varchar(20) DEFAULT 'safe',
        jamaah_id bigint(20) UNSIGNED NULL,
        items_status longtext,
        date_taken datetime,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_logistics);
    
    // 13.2 Inventory (Barang Master)
    $table_inventory = $wpdb->prefix . 'umh_inventory_items';
    $sql_inventory = "CREATE TABLE $table_inventory (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        item_code varchar(50) UNIQUE, 
        item_name varchar(100) NOT NULL,
        category enum('perlengkapan', 'dokumen', 'souvenir') DEFAULT 'perlengkapan',
        stock_qty int DEFAULT 0,
        min_stock_alert int DEFAULT 10,
        unit_cost decimal(15,2) DEFAULT 0,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_inventory);

    // 13.3 Distribusi Logistik
    $table_dist = $wpdb->prefix . 'umh_logistics_distribution';
    $sql_dist = "CREATE TABLE $table_dist (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_passenger_id bigint(20) UNSIGNED NOT NULL,
        item_id bigint(20) UNSIGNED NOT NULL,
        qty int DEFAULT 1,
        status enum('pending', 'ready', 'taken', 'shipped') DEFAULT 'pending',
        taken_by varchar(100),
        taken_date datetime,
        shipping_resi varchar(100),
        staff_id bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_passenger_id (booking_passenger_id),
        KEY item_id (item_id)
    ) $charset_collate;";
    dbDelta($sql_dist);

    // ==========================================
    // 14. USERS, ROLES & TASKS
    // ==========================================

    // 14.1 Tabel Tasks
    $table_tasks = $wpdb->prefix . 'umh_tasks';
    $sql_tasks = "CREATE TABLE $table_tasks (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        description text,
        assigned_to bigint(20) UNSIGNED,
        due_date date,
        priority enum('low', 'medium', 'high') DEFAULT 'medium',
        status enum('pending', 'in_progress', 'completed') DEFAULT 'pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    // 14.2 Tabel Users
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
        role_key varchar(50) DEFAULT 'subscriber',
        phone varchar(20),
        status enum('active', 'suspended', 'inactive') DEFAULT 'active',
        auth_token varchar(255),
        token_expires datetime,
        wp_user_id bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY username (username),
        UNIQUE KEY email (email)
    ) $charset_collate;";
    dbDelta($sql_users);
    
    // 14.3 Master Roles
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

    // ==========================================
    // 15. BOOKINGS & OPERATIONAL (Main)
    // ==========================================

    // 15.1 Bookings (Header)
    $table_bookings = $wpdb->prefix . 'umh_bookings';
    $sql_bookings = "CREATE TABLE $table_bookings (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_code varchar(50) NOT NULL UNIQUE,
        departure_id bigint(20) UNSIGNED NOT NULL,
        user_id bigint(20) UNSIGNED NULL,
        booker_user_id bigint(20) UNSIGNED NULL,
        branch_id bigint(20) UNSIGNED DEFAULT 0,
        agent_id bigint(20) UNSIGNED NULL,
        sub_agent_id bigint(20) UNSIGNED NULL,
        coupon_id bigint(20) UNSIGNED NULL,
        discount_amount decimal(15,2) DEFAULT 0,
        contact_name varchar(150),
        contact_phone varchar(20),
        contact_email varchar(100),
        currency varchar(3) DEFAULT 'IDR',
        total_pax int DEFAULT 1,
        total_price decimal(15,2) DEFAULT 0,
        total_paid decimal(15,2) DEFAULT 0,
        commission_agent decimal(15,2) DEFAULT 0,
        commission_sub_agent decimal(15,2) DEFAULT 0,
        payment_status enum('unpaid', 'dp', 'partial', 'paid', 'refunded', 'overdue') DEFAULT 'unpaid',
        status enum('draft', 'pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'draft',
        is_from_savings boolean DEFAULT 0,              
        source_savings_id bigint(20) UNSIGNED NULL,     
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY departure_id (departure_id)
    ) $charset_collate;";
    dbDelta($sql_bookings);

    // 15.2 Booking Passengers
    $table_booking_pax = $wpdb->prefix . 'umh_booking_passengers';
    $sql_booking_pax = "CREATE TABLE $table_booking_pax (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        package_type enum('Quad', 'Triple', 'Double') DEFAULT 'Quad',
        price_pax decimal(15,2) DEFAULT 0,
        assigned_room_id bigint(20) UNSIGNED NULL,
        visa_status enum('pending', 'processing', 'approved', 'rejected') DEFAULT 'pending',
        visa_batch_id bigint(20) UNSIGNED NULL,       
        visa_number varchar(50),
        ticket_number varchar(100),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_booking_pax);

    // 15.3 Rooming List
    $table_rooming = $wpdb->prefix . 'umh_rooming_list';
    $sql_rooming = "CREATE TABLE $table_rooming (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        departure_id bigint(20) UNSIGNED NOT NULL,
        hotel_name varchar(100),
        room_number varchar(20),
        room_capacity enum('2', '3', '4', '5') DEFAULT '4',
        gender enum('L', 'P', 'Family') NOT NULL,
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY departure_id (departure_id)
    ) $charset_collate;";
    dbDelta($sql_rooming);

    // 15.4 Coupons
    $table_coupons = $wpdb->prefix . 'umh_coupons';
    $sql_coupons = "CREATE TABLE $table_coupons (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        code varchar(50) NOT NULL UNIQUE,
        description text,
        type enum('fixed', 'percent') DEFAULT 'fixed',
        amount decimal(15,2) DEFAULT 0,
        min_transaction decimal(15,2) DEFAULT 0,
        max_discount decimal(15,2) DEFAULT 0,
        valid_from date,
        valid_until date,
        quota_limit int DEFAULT 0,
        quota_used int DEFAULT 0,
        status enum('active', 'inactive') DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_coupons);

    // 15.5 Booking Requests
    $table_requests = $wpdb->prefix . 'umh_booking_requests';
    $sql_requests = "CREATE TABLE $table_requests (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        type enum('refund', 'reschedule', 'cancellation') NOT NULL,
        reason text,
        old_value varchar(255),
        new_value varchar(255),
        refund_amount decimal(15,2) DEFAULT 0,
        proof_file varchar(255),
        status enum('requested', 'approved', 'rejected') DEFAULT 'requested',
        admin_notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_requests);

    // ==========================================
    // 16. SYSTEM UTILS (Batch Visa & Notif)
    // ==========================================

    // 16.1 Notifikasi System
    $table_notif = $wpdb->prefix . 'umh_notifications';
    $sql_notif = "CREATE TABLE $table_notif (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,       
        type varchar(50) DEFAULT 'system',          
        title varchar(150) NOT NULL,
        message text NOT NULL,
        action_url varchar(255) NULL,               
        is_read boolean DEFAULT 0,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY is_read (is_read)
    ) $charset_collate;";
    dbDelta($sql_notif);
    
    // 16.2 Batch Visa
    $table_visa = $wpdb->prefix . 'umh_visa_batches';
    $sql_visa = "CREATE TABLE $table_visa (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        batch_name varchar(100) NOT NULL,           
        provider_name varchar(100) NOT NULL,        
        submission_date date NULL,
        estimated_completion_date date NULL,
        status enum('collecting', 'submitted', 'partially_approved', 'completed', 'problem') DEFAULT 'collecting',
        notes text,
        created_by bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_visa);

    // 16.3 Branches
    $table_branches = $wpdb->prefix . 'umh_branches';
    $sql_branches = "CREATE TABLE $table_branches (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        branch_code varchar(20) NOT NULL UNIQUE,
        name varchar(100) NOT NULL,
        city varchar(100) NOT NULL,
        address text,
        head_of_branch bigint(20) UNSIGNED,
        phone varchar(20),
        is_active boolean DEFAULT 1,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_branches);

    // 16.4 Doc Tracking
    $table_doc_track = $wpdb->prefix . 'umh_document_tracking';
    $sql_doc_track = "CREATE TABLE $table_doc_track (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_passenger_id bigint(20) UNSIGNED NOT NULL,
        document_type enum('passport', 'buku_kuning', 'foto', 'visa') NOT NULL,
        current_position enum('jamaah', 'office', 'provider', 'airport') DEFAULT 'jamaah',
        position_details varchar(100),
        received_date datetime,
        returned_date datetime,
        status enum('incomplete', 'received', 'processing', 'completed', 'returned') DEFAULT 'incomplete',
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_passenger_id (booking_passenger_id)
    ) $charset_collate;";
    dbDelta($sql_doc_track);

    // 16.5 Activity Logs
    $table_logs = $wpdb->prefix . 'umh_activity_logs';
    $sql_logs = "CREATE TABLE $table_logs (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        action varchar(100) NOT NULL,
        details text,
        ip_address varchar(45),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_logs);

    // ==========================================
    // 17. UTILITIES & ADD-ONS (FINAL POLISH)
    // ==========================================

    // 17.1 Master Rekening Bank Perusahaan
    $table_banks = $wpdb->prefix . 'umh_master_bank_accounts';
    $sql_banks = "CREATE TABLE $table_banks (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        bank_name varchar(50) NOT NULL,             -- BCA, Mandiri, BSI
        account_number varchar(50) NOT NULL,
        account_holder varchar(100) NOT NULL,       -- a.n PT Berkah Travel
        swift_code varchar(20),
        is_active boolean DEFAULT 1,
        is_primary boolean DEFAULT 0,               -- Rekening utama
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_banks);

    // 17.2 Booking Add-ons (Upselling)
    $table_addons = $wpdb->prefix . 'umh_booking_addons';
    $sql_addons = "CREATE TABLE $table_addons (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        addon_name varchar(150) NOT NULL,
        price decimal(15,2) DEFAULT 0,
        qty int DEFAULT 1,
        total decimal(15,2) DEFAULT 0,
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_addons);

    // 17.3 Template Notifikasi (Whatsapp/Email)
    $table_templates = $wpdb->prefix . 'umh_notification_templates';
    $sql_templates = "CREATE TABLE $table_templates (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        slug varchar(100) NOT NULL UNIQUE,          -- payment_success, booking_confirmed, manasik_reminder
        name varchar(150) NOT NULL,                 -- Nama deskriptif untuk Admin
        channel enum('whatsapp', 'email', 'sms') DEFAULT 'whatsapp',
        subject varchar(200),                       -- Hanya untuk Email
        content text NOT NULL,                      -- Isi pesan dengan variable {name}, {amount}
        is_active boolean DEFAULT 1,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) $charset_collate;";
    dbDelta($sql_templates);

    update_option('umh_db_version', '6.1.0'); // Major Version Update
}