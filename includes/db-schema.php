<?php
/**
 * File: includes/db-schema.php
 * Deskripsi: THE ULTIMATE MERGER V4.0
 * Gabungan: Booking Engine V2 (Scalable) + HR & Auth V3 (Internal Mgmt)
 */

if (!defined('ABSPATH')) {
    exit;
}

function umh_create_tables() {
    global $wpdb;

    $charset_collate = $wpdb->get_charset_collate();
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

    // ==========================================================================
    // 1. SYSTEM CORE (AUTH & ROLES) - [ADAPTASI DARI ANDA]
    // ==========================================================================
    // Bagus untuk memisahkan user sistem travel dari user WordPress biasa

    $table_users = $wpdb->prefix . 'umh_users';
    $sql_users = "CREATE TABLE $table_users (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        username varchar(60) NOT NULL UNIQUE,
        email varchar(100) NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        full_name varchar(100),
        role_key varchar(50) DEFAULT 'subscriber', /* Link ke umh_roles */
        phone varchar(20),
        status enum('active', 'suspended', 'inactive') DEFAULT 'active',
        auth_token varchar(255),
        token_expires datetime,
        wp_user_id bigint(20) UNSIGNED, /* Integrasi opsional ke WP */
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_users);

    $table_roles = $wpdb->prefix . 'umh_roles';
    $sql_roles = "CREATE TABLE $table_roles (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        role_key varchar(50) NOT NULL UNIQUE, 
        role_name varchar(100) NOT NULL,
        capabilities longtext, /* JSON permission */
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_roles);

    // ==========================================================================
    // 2. HRD & TASK MANAGEMENT - [ADAPTASI DARI ANDA]
    // ==========================================================================
    
    $table_employees = $wpdb->prefix . 'umh_hr_employees';
    $sql_employees = "CREATE TABLE $table_employees (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        umh_user_id bigint(20) UNSIGNED, /* Link ke Custom User */
        name varchar(100) NOT NULL,
        position varchar(100),
        department varchar(100),
        salary decimal(15,2) DEFAULT 0,
        join_date date,
        status enum('active', 'resigned', 'terminated') DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    $table_attendance = $wpdb->prefix . 'umh_hr_attendance';
    $sql_attendance = "CREATE TABLE $table_attendance (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        date date NOT NULL,
        employee_id bigint(20) UNSIGNED NOT NULL,
        status enum('present', 'sick', 'permit', 'alpha') DEFAULT 'present',
        check_in_time time,
        check_out_time time,
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        UNIQUE KEY emp_date (employee_id, date)
    ) $charset_collate;";
    dbDelta($sql_attendance);

    $table_tasks = $wpdb->prefix . 'umh_tasks';
    $sql_tasks = "CREATE TABLE $table_tasks (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        description text,
        assigned_to bigint(20) UNSIGNED, /* Employee ID */
        due_date date,
        priority enum('low', 'medium', 'high') DEFAULT 'medium',
        status enum('pending', 'in_progress', 'completed') DEFAULT 'pending',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_tasks);

    // ==========================================================================
    // 3. MASTER DATA - [KOMBINASI]
    // ==========================================================================
    
    // Unified Location (Ide Anda bagus, kita pakai)
    $table_locations = $wpdb->prefix . 'umh_master_locations';
    $sql_locations = "CREATE TABLE $table_locations (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL, 
        code varchar(10) NULL,      
        type enum('airport', 'city') NOT NULL DEFAULT 'city',
        country varchar(50) DEFAULT 'Saudi Arabia',
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_locations);

    $table_hotels = $wpdb->prefix . 'umh_master_hotels';
    $sql_hotels = "CREATE TABLE $table_hotels (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(150) NOT NULL,
        city_id bigint(20) UNSIGNED, /* Link ke Location */
        star_rating int DEFAULT 4,
        distance_to_haram int,
        description text,
        map_link text,
        image_url varchar(255),
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_hotels);

    $table_airlines = $wpdb->prefix . 'umh_master_airlines';
    $sql_airlines = "CREATE TABLE $table_airlines (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        code varchar(10),
        logo_url varchar(255),
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_airlines);

    // ==========================================================================
    // 4. STRUKTUR CABANG & AGEN (PARTNERSHIP)
    // ==========================================================================

    $table_branches = $wpdb->prefix . 'umh_branches';
    $sql_branches = "CREATE TABLE $table_branches (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        branch_code varchar(20) NOT NULL UNIQUE,
        name varchar(100) NOT NULL,
        city varchar(100),
        head_of_branch bigint(20) UNSIGNED,
        is_active boolean DEFAULT 1,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_branches);

    $table_agents = $wpdb->prefix . 'umh_agents';
    $sql_agents = "CREATE TABLE $table_agents (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        umh_user_id bigint(20) UNSIGNED NOT NULL, /* Link ke Custom User */
        branch_id bigint(20) UNSIGNED DEFAULT 0,
        parent_agent_id bigint(20) UNSIGNED NULL, /* Upline */
        
        level enum('master', 'sub') DEFAULT 'master',
        commission_type enum('fixed', 'percent') DEFAULT 'fixed',
        commission_value decimal(15,2) DEFAULT 0,
        
        bank_details text,
        contract_file varchar(255),
        status enum('pending', 'active', 'suspended') DEFAULT 'pending',
        joined_date date,
        PRIMARY KEY  (id),
        KEY umh_user_id (umh_user_id),
        KEY parent_agent_id (parent_agent_id)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // ==========================================================================
    // 5. DATA JEMAAH - [STRICTLY PAKE PUSAT DATA V2]
    // ==========================================================================
    // PENTING: Jangan masukkan data transaksi/paket disini agar bisa repeat order
    
    $table_jamaah = $wpdb->prefix . 'umh_jamaah';
    $sql_jamaah = "CREATE TABLE $table_jamaah (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        umh_user_id bigint(20) UNSIGNED NULL, /* Jika jemaah punya akun login app */
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
        clothing_size varchar(5),
        disease_history text,
        father_name varchar(100),
        mother_name varchar(100),
        spouse_name varchar(100),
        
        /* Scan Dokumen */
        scan_ktp varchar(255),
        scan_passport varchar(255),
        scan_kk varchar(255),
        scan_photo varchar(255),
        scan_buku_kuning varchar(255),
        
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY nik (nik)
    ) $charset_collate;";
    dbDelta($sql_jamaah);

    // ==========================================================================
    // 6. PRODUK & INVENTORY
    // ==========================================================================
    
    // Kategori
    $table_pkg_cats = $wpdb->prefix . 'umh_package_categories';
    $sql_pkg_cats = "CREATE TABLE $table_pkg_cats (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        type enum('umrah', 'haji', 'tour') DEFAULT 'umrah',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_pkg_cats);

    // Paket (Header)
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql_packages = "CREATE TABLE $table_packages (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        category_id bigint(20) UNSIGNED NOT NULL,
        name varchar(150) NOT NULL,
        slug varchar(150),
        description longtext,
        duration_days int NOT NULL,
        
        /* Harga Dasar */
        currency varchar(3) DEFAULT 'IDR', 
        base_price_quad decimal(15,2) DEFAULT 0,
        base_price_triple decimal(15,2) DEFAULT 0,
        base_price_double decimal(15,2) DEFAULT 0,
        
        /* Syarat Pembayaran */
        down_payment_amount decimal(15,2) DEFAULT 0,
        payment_due_days int DEFAULT 30,
        
        hotel_makkah_id bigint(20) UNSIGNED NULL,
        hotel_madinah_id bigint(20) UNSIGNED NULL,
        airline_id bigint(20) UNSIGNED NULL,
        
        status enum('active', 'inactive', 'draft') DEFAULT 'draft',
        image_url varchar(255),
        brochure_pdf varchar(255),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_packages);

    // Detail Paket (Itinerary & Fasilitas) - PENTING UNTUK WEB
    $table_itinerary = $wpdb->prefix . 'umh_package_itineraries';
    $sql_itinerary = "CREATE TABLE $table_itinerary (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id bigint(20) UNSIGNED NOT NULL,
        day_number int NOT NULL,
        title varchar(150) NOT NULL,
        description text,
        location_id bigint(20) UNSIGNED, /* Link ke Master Location */
        meals varchar(50),
        image_url varchar(255),
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_itinerary);

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

    // Keberangkatan (Inventory)
    $table_departures = $wpdb->prefix . 'umh_departures';
    $sql_departures = "CREATE TABLE $table_departures (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id bigint(20) UNSIGNED NOT NULL,
        departure_date date NOT NULL,
        return_date date NOT NULL,
        
        /* Override Harga */
        price_quad decimal(15,2),
        price_triple decimal(15,2),
        price_double decimal(15,2),
        
        seat_quota int DEFAULT 45,
        seat_booked int DEFAULT 0,
        
        flight_number_depart varchar(20),
        flight_number_return varchar(20),
        tour_leader_name varchar(100),
        
        status enum('open', 'closed', 'departed', 'completed', 'cancelled') DEFAULT 'open',
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY departure_date (departure_date)
    ) $charset_collate;";
    dbDelta($sql_departures);

    // ==========================================================================
    // 7. TRANSAKSI (BOOKING & SALES) - [STRICTLY PAKE LOGIKA V2]
    // ==========================================================================
    // Harus ada tabel Header (Bookings) dan Detail (Passengers)
    
    // Kupon Diskon
    $table_coupons = $wpdb->prefix . 'umh_coupons';
    $sql_coupons = "CREATE TABLE $table_coupons (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        code varchar(50) NOT NULL UNIQUE,
        type enum('fixed', 'percent') DEFAULT 'fixed',
        amount decimal(15,2) DEFAULT 0,
        valid_until date,
        quota_limit int DEFAULT 0,
        status enum('active', 'inactive') DEFAULT 'active',
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_coupons);

    // Header Booking (Keranjang)
    $table_bookings = $wpdb->prefix . 'umh_bookings';
    $sql_bookings = "CREATE TABLE $table_bookings (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_code varchar(50) NOT NULL UNIQUE,
        departure_id bigint(20) UNSIGNED NOT NULL,
        
        booker_user_id bigint(20) UNSIGNED NULL, /* Siapa yg booking (bisa agen/user) */
        agent_id bigint(20) UNSIGNED NULL,
        sub_agent_id bigint(20) UNSIGNED NULL,
        branch_id bigint(20) UNSIGNED DEFAULT 0,
        
        /* Diskon */
        coupon_id bigint(20) UNSIGNED NULL,
        discount_amount decimal(15,2) DEFAULT 0,
        
        /* Financial */
        currency varchar(3) DEFAULT 'IDR',
        total_pax int DEFAULT 1,
        total_price decimal(15,2) DEFAULT 0,
        total_paid decimal(15,2) DEFAULT 0,
        
        /* Kontak */
        contact_name varchar(150),
        contact_phone varchar(20),
        contact_email varchar(100),
        
        payment_status enum('unpaid', 'dp', 'partial', 'paid', 'refunded', 'overdue') DEFAULT 'unpaid',
        status enum('draft', 'pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'draft',
        
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY departure_id (departure_id)
    ) $charset_collate;";
    dbDelta($sql_bookings);

    // Detail Penumpang
    $table_booking_pax = $wpdb->prefix . 'umh_booking_passengers';
    $sql_booking_pax = "CREATE TABLE $table_booking_pax (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        jamaah_id bigint(20) UNSIGNED NOT NULL, /* Link ke Profil */
        
        package_type enum('Quad', 'Triple', 'Double') DEFAULT 'Quad',
        price_pax decimal(15,2) DEFAULT 0,
        
        assigned_room_id bigint(20) UNSIGNED NULL, /* Link ke Rooming */
        visa_status enum('pending', 'processing', 'approved', 'rejected') DEFAULT 'pending',
        visa_number varchar(50),
        
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_booking_pax);

    // Request Refund/Reschedule
    $table_requests = $wpdb->prefix . 'umh_booking_requests';
    $sql_requests = "CREATE TABLE $table_requests (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        type enum('refund', 'reschedule', 'cancellation') NOT NULL,
        reason text,
        refund_amount decimal(15,2) DEFAULT 0,
        proof_file varchar(255),
        status enum('requested', 'approved', 'rejected') DEFAULT 'requested',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_requests);

    // ==========================================================================
    // 8. KEUANGAN TERPADU
    // ==========================================================================
    
    $table_finance = $wpdb->prefix . 'umh_finance';
    $sql_finance = "CREATE TABLE $table_finance (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        transaction_date date NOT NULL,
        type enum('income', 'expense') NOT NULL,
        category varchar(100) DEFAULT 'Pembayaran',
        amount decimal(15,2) NOT NULL,
        description text,
        
        booking_id bigint(20) UNSIGNED NULL, 
        payment_method varchar(50) DEFAULT 'transfer',
        proof_file varchar(255) NULL,
        
        /* Validasi */
        status enum('pending', 'verified', 'rejected') DEFAULT 'pending',
        verified_by bigint(20) UNSIGNED NULL,
        
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_finance);

    // ==========================================================================
    // 9. LOGISTIK & MARKETING
    // ==========================================================================
    
    // Inventory (Master Barang)
    $table_inventory = $wpdb->prefix . 'umh_inventory_items';
    $sql_inventory = "CREATE TABLE $table_inventory (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        item_code varchar(50) UNIQUE, 
        item_name varchar(100) NOT NULL,
        stock_qty int DEFAULT 0,
        min_stock_alert int DEFAULT 10,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_inventory);

    // Distribusi (Tracking per Jamaah)
    $table_distribution = $wpdb->prefix . 'umh_logistics_distribution';
    $sql_distribution = "CREATE TABLE $table_distribution (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_passenger_id bigint(20) UNSIGNED NOT NULL,
        item_id bigint(20) UNSIGNED NOT NULL,
        qty int DEFAULT 1,
        status enum('pending', 'ready', 'taken', 'shipped') DEFAULT 'pending',
        taken_date datetime,
        PRIMARY KEY  (id),
        KEY booking_passenger_id (booking_passenger_id)
    ) $charset_collate;";
    dbDelta($sql_distribution);
    
    // Marketing & Leads
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

    $table_leads = $wpdb->prefix . 'umh_leads'; 
    $sql_leads = "CREATE TABLE $table_leads (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        marketing_id bigint(20) UNSIGNED NULL,
        name varchar(100) NOT NULL,
        phone varchar(20),
        email varchar(100),
        interest_package_id bigint(20) UNSIGNED NULL,
        source varchar(50),
        status enum('new', 'contacted', 'hot', 'deal', 'lost') DEFAULT 'new',
        converted_booking_id bigint(20) UNSIGNED NULL, 
        notes text,
        assigned_to bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_leads);

    // Rooming
    $table_rooming = $wpdb->prefix . 'umh_rooming_list';
    $sql_rooming = "CREATE TABLE $table_rooming (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        departure_id bigint(20) UNSIGNED NOT NULL,
        hotel_name varchar(100),
        room_number varchar(20),
        room_capacity enum('2', '3', '4', '5') DEFAULT '4',
        gender enum('L', 'P', 'Family') NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_rooming);

    // Document Tracking
    $table_doc_track = $wpdb->prefix . 'umh_document_tracking';
    $sql_doc_track = "CREATE TABLE $table_doc_track (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_passenger_id bigint(20) UNSIGNED NOT NULL,
        document_type enum('passport', 'buku_kuning', 'foto', 'visa') NOT NULL,
        current_position enum('jamaah', 'office', 'provider', 'airport') DEFAULT 'jamaah',
        status enum('incomplete', 'received', 'processing', 'completed', 'returned') DEFAULT 'incomplete',
        PRIMARY KEY  (id),
        KEY booking_passenger_id (booking_passenger_id)
    ) $charset_collate;";
    dbDelta($sql_doc_track);

    update_option('umh_db_version', '4.0.0');
}
?>