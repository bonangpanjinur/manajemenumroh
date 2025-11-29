<?php
/**
 * File: includes/db-migration-v3.php
 * Deskripsi: Skema Database Final Enterprise (End-to-End)
 * Mencakup: Master, CRM, Produk, Transaksi, Keuangan, Logistik, Agen, Operasional, Marketing, HR, Roomlist & Hak Akses.
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
        code varchar(10) NULL,      /* CGK, JED, MED */
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
        code varchar(10) NULL, /* SV, QR, GA */
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
        city varchar(50) NOT NULL, /* Makkah, Madinah */
        star_rating tinyint(1) DEFAULT 5,
        distance_to_haram int DEFAULT 0, /* Meter */
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
        user_id bigint(20) UNSIGNED NULL, /* Link ke WP Users jika jemaah punya akun login */
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
    $table_packages = $wpdb->prefix . 'umh_packages';
    $sql_packages = "CREATE TABLE $table_packages (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(200) NOT NULL,
        slug varchar(200) UNIQUE,
        type enum('umrah', 'haji', 'tour') DEFAULT 'umrah',
        category_id bigint(20) UNSIGNED NULL, /* VIP, Hemat, Plus Turki */
        duration_days int DEFAULT 9,
        description longtext,
        included_facilities longtext,
        excluded_facilities longtext,
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
        
        /* Hotel Spesifik */
        hotel_makkah_id bigint(20) UNSIGNED,
        hotel_madinah_id bigint(20) UNSIGNED,
        
        /* Stok & Harga */
        quota int DEFAULT 45,
        available_seats int DEFAULT 45,
        price_quad decimal(15,2) NOT NULL,
        price_triple decimal(15,2) DEFAULT 0,
        price_double decimal(15,2) DEFAULT 0,
        currency varchar(3) DEFAULT 'IDR',
        
        /* Pembimbing */
        tour_leader_name varchar(100),
        mutawwif_name varchar(100),

        status enum('open', 'closed', 'departed', 'completed', 'cancelled') DEFAULT 'open',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY package_id (package_id),
        KEY departure_date (departure_date)
    ) $charset_collate;";
    dbDelta($sql_departures);

    // 3.3 Itinerary Harian
    $table_itinerary = $wpdb->prefix . 'umh_package_itineraries';
    $sql_itinerary = "CREATE TABLE $table_itinerary (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        package_id bigint(20) UNSIGNED NOT NULL,
        day_number int NOT NULL,
        title varchar(200) NOT NULL,
        description text,
        location_id bigint(20) UNSIGNED NULL,
        meal_plan varchar(50),
        PRIMARY KEY  (id),
        KEY package_id (package_id)
    ) $charset_collate;";
    dbDelta($sql_itinerary);

    // ==========================================================================
    // 4. TRANSAKSI (BOOKING ENGINE)
    // ==========================================================================

    // 4.1 Header Booking (Invoice Group)
    $table_bookings = $wpdb->prefix . 'umh_bookings';
    $sql_bookings = "CREATE TABLE $table_bookings (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_code varchar(20) UNIQUE NOT NULL,
        departure_id bigint(20) UNSIGNED NOT NULL,
        
        /* Penanggung Jawab */
        contact_name varchar(100) NOT NULL,
        contact_phone varchar(20) NOT NULL,
        contact_email varchar(100),
        
        /* Sales / Agen */
        agent_id bigint(20) UNSIGNED NULL, 
        is_agent_booking tinyint(1) DEFAULT 0, /* Apakah booking ini dibuat oleh agen? */

        /* Keuangan Total */
        total_pax int NOT NULL DEFAULT 1,
        total_price decimal(15,2) NOT NULL,
        total_paid decimal(15,2) DEFAULT 0,
        payment_status enum('unpaid', 'partial', 'paid', 'overpaid') DEFAULT 'unpaid',
        
        status enum('pending', 'confirmed', 'cancelled', 'refunded') DEFAULT 'pending',
        notes text,
        booking_date datetime DEFAULT CURRENT_TIMESTAMP,
        created_by bigint(20) UNSIGNED, /* User ID yang input (Admin/Agen) */
        PRIMARY KEY  (id),
        KEY departure_id (departure_id),
        KEY booking_code (booking_code),
        KEY agent_id (agent_id)
    ) $charset_collate;";
    dbDelta($sql_bookings);

    // 4.2 Detail Penumpang (Manifest)
    $table_passengers = $wpdb->prefix . 'umh_booking_passengers';
    $sql_passengers = "CREATE TABLE $table_passengers (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        jamaah_id bigint(20) UNSIGNED NOT NULL,
        
        /* Paket & Kamar */
        room_type enum('quad', 'triple', 'double') DEFAULT 'quad',
        price_pax decimal(15,2) NOT NULL,
        
        /* Status Dokumen & Visa */
        passport_status enum('not_received', 'received', 'returned') DEFAULT 'not_received',
        visa_status enum('pending', 'processing', 'issued', 'rejected') DEFAULT 'pending',
        visa_number varchar(50),
        ticket_number varchar(50),
        
        /* Logistik Kamar (Linked to Rooming List Table now) */
        assigned_room_id bigint(20) UNSIGNED NULL, /* Link ke umh_departure_rooms */

        /* File Upload Khusus Perjalanan Ini */
        visa_file varchar(255),
        ticket_file varchar(255),

        status enum('active', 'cancelled') DEFAULT 'active',
        PRIMARY KEY  (id),
        KEY booking_id (booking_id),
        KEY jamaah_id (jamaah_id)
    ) $charset_collate;";
    dbDelta($sql_passengers);

    // ==========================================================================
    // 5. PEMBAYARAN JAMAAH (RECEIVABLES)
    // ==========================================================================

    $table_payments = $wpdb->prefix . 'umh_payments';
    $sql_payments = "CREATE TABLE $table_payments (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        booking_id bigint(20) UNSIGNED NOT NULL,
        transaction_date datetime NOT NULL,
        amount decimal(15,2) NOT NULL,
        method enum('transfer', 'cash', 'credit_card', 'va') DEFAULT 'transfer',
        bank_name varchar(50), /* Bank Tujuan */
        proof_file varchar(255),
        
        status enum('pending', 'verified', 'rejected') DEFAULT 'pending',
        verified_by bigint(20) UNSIGNED NULL,
        notes text,
        
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY booking_id (booking_id)
    ) $charset_collate;";
    dbDelta($sql_payments);

    // ==========================================================================
    // 6. LOGISTIK & PERLENGKAPAN
    // ==========================================================================

    $table_logistics = $wpdb->prefix . 'umh_logistics_distribution';
    $sql_logistics = "CREATE TABLE $table_logistics (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        passenger_id bigint(20) UNSIGNED NOT NULL,
        item_name varchar(100) NOT NULL, /* Koper, Batik, Ihram */
        qty int DEFAULT 1,
        status enum('pending', 'taken', 'shipped') DEFAULT 'pending',
        taken_date datetime,
        taken_by varchar(100),
        notes text,
        PRIMARY KEY  (id),
        KEY passenger_id (passenger_id)
    ) $charset_collate;";
    dbDelta($sql_logistics);

    // ==========================================================================
    // 7. KEAGENAN & KEMITRAAN
    // ==========================================================================

    // 7.1 Profil Agen
    $table_agents = $wpdb->prefix . 'umh_agents';
    $sql_agents = "CREATE TABLE $table_agents (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL, /* Link ke WP User */
        agent_code varchar(20) UNIQUE,
        level enum('silver', 'gold', 'platinum') DEFAULT 'silver',
        commission_rate decimal(5,2) DEFAULT 0, /* Persen komisi default */
        fixed_commission decimal(15,2) DEFAULT 0, /* Nominal komisi per pax */
        
        bank_name varchar(50),
        bank_account_number varchar(50),
        bank_account_holder varchar(100),
        
        status enum('active', 'suspended') DEFAULT 'active',
        joined_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql_agents);

    // 7.2 Riwayat Komisi Agen
    $table_commissions = $wpdb->prefix . 'umh_commissions';
    $sql_commissions = "CREATE TABLE $table_commissions (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        agent_id bigint(20) UNSIGNED NOT NULL,
        booking_id bigint(20) UNSIGNED NOT NULL,
        amount decimal(15,2) NOT NULL,
        description varchar(255), /* Komisi Booking TRX-001 (5 Pax) */
        
        status enum('pending', 'approved', 'paid', 'cancelled') DEFAULT 'pending',
        paid_at datetime,
        proof_file varchar(255), /* Bukti transfer komisi ke agen */
        
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY agent_id (agent_id)
    ) $charset_collate;";
    dbDelta($sql_commissions);

    // ==========================================================================
    // 8. OPERASIONAL & ROOMING LIST (UPDATE)
    // ==========================================================================

    // 8.1 Checklist Tugas per Keberangkatan
    $table_dep_tasks = $wpdb->prefix . 'umh_departure_tasks';
    $sql_dep_tasks = "CREATE TABLE $table_dep_tasks (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        departure_id bigint(20) UNSIGNED NOT NULL,
        task_name varchar(100) NOT NULL, /* e.g., 'Submit Visa ke Muassasah' */
        category enum('document', 'finance', 'logistics', 'transport') DEFAULT 'document',
        
        status enum('pending', 'in_progress', 'completed', 'problem') DEFAULT 'pending',
        assigned_to bigint(20) UNSIGNED NULL, /* Staff ID */
        due_date date,
        completed_at datetime,
        notes text,
        
        PRIMARY KEY  (id),
        KEY departure_id (departure_id)
    ) $charset_collate;";
    dbDelta($sql_dep_tasks);

    // 8.2 Tugas Tim Umum (General Tasks)
    $table_team_tasks = $wpdb->prefix . 'umh_team_tasks';
    $sql_team_tasks = "CREATE TABLE $table_team_tasks (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        title varchar(200) NOT NULL,
        description text,
        assigned_to bigint(20) UNSIGNED NULL, /* User ID Pelaksana */
        assigned_by bigint(20) UNSIGNED NULL, /* User ID Pemberi Tugas */
        due_date datetime,
        priority enum('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status enum('todo', 'in_progress', 'review', 'completed') DEFAULT 'todo',
        
        completed_at datetime,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_team_tasks);

    // 8.3 Manajemen Roomlist (NEW)
    // Mengatur kamar hotel secara spesifik (lantai, nomor kamar, kapasitas)
    $table_rooms = $wpdb->prefix . 'umh_departure_rooms';
    $sql_rooms = "CREATE TABLE $table_rooms (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        departure_id bigint(20) UNSIGNED NOT NULL,
        hotel_id bigint(20) UNSIGNED NOT NULL, /* Relasi ke Master Hotel */
        
        room_number varchar(20) NOT NULL, /* '101', '204A' */
        floor_level varchar(10), /* 'Lantai 1' */
        capacity int DEFAULT 4, /* 4 (Quad), 3 (Triple), 2 (Double) */
        room_gender enum('male', 'female', 'family') DEFAULT 'family',
        notes text, /* 'Dekat Lift', 'Connecting Door' */
        
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY departure_id (departure_id)
    ) $charset_collate;";
    dbDelta($sql_rooms);

    // ==========================================================================
    // 9. MARKETING & LEADS
    // ==========================================================================

    $table_leads = $wpdb->prefix . 'umh_marketing_leads';
    $sql_leads = "CREATE TABLE $table_leads (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL,
        phone varchar(20),
        source varchar(50), /* Instagram, Facebook Ads, Walk-in */
        interest_level enum('cold', 'warm', 'hot') DEFAULT 'cold',
        preferred_package_type enum('umrah', 'haji', 'tour') DEFAULT 'umrah',
        
        last_contacted_at datetime,
        next_follow_up date,
        assigned_to bigint(20) UNSIGNED NULL, /* Sales ID */
        
        status enum('new', 'contacted', 'converted', 'lost') DEFAULT 'new',
        notes text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_leads);

    // ==========================================================================
    // 10. HR & ABSENSI (SMART ATTENDANCE)
    // ==========================================================================

    // 10.1 Data Karyawan
    $table_employees = $wpdb->prefix . 'umh_hr_employees';
    $sql_employees = "CREATE TABLE $table_employees (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL, /* Link ke WP Users */
        position varchar(100), /* Staff IT, CS, Finance */
        department varchar(100),
        join_date date,
        
        /* Komponen Gaji */
        basic_salary decimal(15,2) DEFAULT 0,
        allowance_transport decimal(15,2) DEFAULT 0,
        allowance_meal decimal(15,2) DEFAULT 0,
        
        status enum('active', 'resigned', 'terminated') DEFAULT 'active',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id)
    ) $charset_collate;";
    dbDelta($sql_employees);

    // 10.2 Lokasi Kantor
    $table_offices = $wpdb->prefix . 'umh_hr_office_locations';
    $sql_offices = "CREATE TABLE $table_offices (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL, /* Kantor Pusat, Cabang A */
        address text,
        
        /* Geo-Fencing Data */
        latitude decimal(11,8) NOT NULL,
        longitude decimal(11,8) NOT NULL,
        radius_meter int DEFAULT 50, /* Jarak maksimal scan dari titik pusat */
        qr_token varchar(255) NOT NULL, /* Kode unik yang di-generate untuk QR */
        
        is_active tinyint(1) DEFAULT 1,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_offices);

    // 10.3 Log Absensi
    $table_attendance = $wpdb->prefix . 'umh_hr_attendance';
    $sql_attendance = "CREATE TABLE $table_attendance (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        user_id bigint(20) UNSIGNED NOT NULL,
        date date NOT NULL,
        
        /* Jam Masuk */
        check_in_time datetime,
        check_in_location varchar(100), /* Disimpan format Lat,Long */
        check_in_photo varchar(255), /* URL Foto selfie */
        
        /* Jam Pulang */
        check_out_time datetime,
        check_out_location varchar(100),
        
        /* Metadata */
        type enum('office_qr', 'remote_gps') NOT NULL,
        office_id bigint(20) UNSIGNED NULL, /* Jika Absen Kantor */
        status enum('present', 'late', 'absent', 'permit', 'sick') DEFAULT 'present',
        notes text,
        
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY date (date)
    ) $charset_collate;";
    dbDelta($sql_attendance);

    // 10.4 Manajemen Kasbon
    $table_loans = $wpdb->prefix . 'umh_hr_loans';
    $sql_loans = "CREATE TABLE $table_loans (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        employee_id bigint(20) UNSIGNED NOT NULL,
        amount decimal(15,2) NOT NULL,
        reason text,
        application_date date,
        
        status enum('pending', 'approved', 'rejected', 'paid_off') DEFAULT 'pending',
        approved_by bigint(20) UNSIGNED,
        
        repayment_months int DEFAULT 1, /* Dicicil berapa kali */
        remaining_amount decimal(15,2), /* Sisa hutang */
        
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY employee_id (employee_id)
    ) $charset_collate;";
    dbDelta($sql_loans);

    // 10.5 Payroll (Penggajian)
    $table_payroll = $wpdb->prefix . 'umh_hr_payroll';
    $sql_payroll = "CREATE TABLE $table_payroll (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        employee_id bigint(20) UNSIGNED NOT NULL,
        period_month varchar(7), /* Format: 2023-11 */
        
        basic_salary decimal(15,2) DEFAULT 0,
        total_allowance decimal(15,2) DEFAULT 0,
        total_deductions decimal(15,2) DEFAULT 0, /* Termasuk potongan kasbon */
        net_salary decimal(15,2) DEFAULT 0,
        
        status enum('draft', 'final', 'paid') DEFAULT 'draft',
        payment_date datetime,
        notes text,
        
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY employee_id (employee_id)
    ) $charset_collate;";
    dbDelta($sql_payroll);

    // ==========================================================================
    // 11. KEUANGAN UMUM (GENERAL FINANCE)
    // ==========================================================================

    // 11.1 Akun Keuangan (Chart of Accounts Mini)
    $table_fin_accounts = $wpdb->prefix . 'umh_finance_accounts';
    $sql_fin_accounts = "CREATE TABLE $table_fin_accounts (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        name varchar(100) NOT NULL, /* Kas Kecil, Bank Mandiri, Biaya Listrik */
        code varchar(20), /* 101, 501 */
        type enum('asset', 'liability', 'equity', 'revenue', 'expense') NOT NULL,
        current_balance decimal(15,2) DEFAULT 0,
        is_active tinyint(1) DEFAULT 1,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_fin_accounts);

    // 11.2 Transaksi Keuangan Umum (Income/Expense)
    // Mencakup: Pemasukan Travel, Pengeluaran Gaji, Pengeluaran Fee Agen
    $table_fin_trx = $wpdb->prefix . 'umh_finance_transactions';
    $sql_fin_trx = "CREATE TABLE $table_fin_trx (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        transaction_date datetime NOT NULL,
        description varchar(255) NOT NULL,
        amount decimal(15,2) NOT NULL,
        type enum('income', 'expense') NOT NULL,
        
        account_id bigint(20) UNSIGNED NOT NULL, /* Akun Kategori (misal: Beban Gaji) */
        payment_method_id bigint(20) UNSIGNED NULL, /* Sumber Dana (misal: Bank Mandiri) */
        
        /* Referensi Lintas Modul (Integrasi) */
        reference_id bigint(20) UNSIGNED NULL, /* ID Payroll / ID Komisi */
        reference_table varchar(50) NULL, /* 'umh_hr_payroll' atau 'umh_commissions' */
        
        proof_file varchar(255),
        created_by bigint(20) UNSIGNED,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY account_id (account_id)
    ) $charset_collate;";
    dbDelta($sql_fin_trx);

    // ==========================================================================
    // 12. HAK AKSES & ROLES (RBAC) - NEW
    // ==========================================================================

    // 12.1 Master Roles (Selain role bawaan WP)
    $table_app_roles = $wpdb->prefix . 'umh_app_roles';
    $sql_app_roles = "CREATE TABLE $table_app_roles (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        role_name varchar(50) NOT NULL, /* 'Finance Staff', 'Manifest Officer' */
        description text,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_app_roles);

    // 12.2 Master Permissions (Fitur apa yang bisa diakses)
    $table_app_perms = $wpdb->prefix . 'umh_app_permissions';
    $sql_app_perms = "CREATE TABLE $table_app_perms (
        id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        permission_key varchar(50) UNIQUE NOT NULL, /* 'view_finance', 'approve_payment' */
        label varchar(100) NOT NULL,
        group_name varchar(50), /* 'Finance', 'HR', 'Operations' */
        PRIMARY KEY  (id)
    ) $charset_collate;";
    dbDelta($sql_app_perms);

    // 12.3 Mapping Role -> Permissions
    $table_role_perms = $wpdb->prefix . 'umh_app_role_permissions';
    $sql_role_perms = "CREATE TABLE $table_role_perms (
        role_id bigint(20) UNSIGNED NOT NULL,
        permission_id bigint(20) UNSIGNED NOT NULL,
        PRIMARY KEY  (role_id, permission_id)
    ) $charset_collate;";
    dbDelta($sql_role_perms);

    // 12.4 Mapping User -> Custom Roles
    $table_user_roles = $wpdb->prefix . 'umh_app_user_assignments';
    $sql_user_roles = "CREATE TABLE $table_user_roles (
        user_id bigint(20) UNSIGNED NOT NULL, /* WP User ID */
        role_id bigint(20) UNSIGNED NOT NULL,
        assigned_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (user_id, role_id)
    ) $charset_collate;";
    dbDelta($sql_user_roles);
}