<?php
/**
 * File: includes/db-schema.php
 * Deskripsi: Skema Database Final Enterprise (Clean Version)
 * Update: Hapus komentar inline untuk mencegah error dbDelta
 */

if (!defined('ABSPATH')) {
    exit;
}

function umh_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

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
        mutawwif_name varchar(100),
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

    // 4.1 Tabel Finance
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
    
    // 5.1 Profil Agen
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

    // 5.2 Data Karyawan
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

    // 5.3 Absensi Karyawan
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

    // 6.2 Leads
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

    // 7.1 Logistik
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
    
    // 7.2 Inventory (Barang Master)
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

    // 7.3 Distribusi Logistik
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

    // 7.4 Tabel Tasks
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

    // 9.1 Bookings (Header)
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
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY departure_id (departure_id)
    ) $charset_collate;";
    dbDelta($sql_bookings);

    // 9.2 Booking Passengers
    $table_booking_pax = $wpdb->prefix . 'umh_booking_passengers';
    $sql_booking_pax = "CREATE TABLE $table_booking_pax (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        package_type enum('Quad', 'Triple', 'Double') DEFAULT 'Quad',
        price_pax decimal(15,2) DEFAULT 0,
        assigned_room_id bigint(20) UNSIGNED NULL,
        visa_status enum('pending', 'processing', 'approved', 'rejected') DEFAULT 'pending',
        visa_number varchar(50),
        ticket_number varchar(100),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_booking_pax);

    // 9.3 Rooming List
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

    // 9.4 Coupons
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

    // 9.5 Booking Requests
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

    // 10.1 Branches
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

    // 10.2 Doc Tracking
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

    // 10.3 Activity Logs
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

    update_option('umh_db_version', '4.0.1');
}