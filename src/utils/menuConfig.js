import { 
    LayoutDashboard, 
    Users, 
    Plane, 
    Calendar, 
    Package, 
    CreditCard, 
    Hotel, 
    Settings, 
    Box, 
    UserCheck, 
    Shield, 
    Tags, 
    CheckSquare, 
    Briefcase,
    Megaphone,
    BarChart3 // Icon baru untuk COA/Keuangan
} from 'lucide-react';

export const menuItems = [
    {
        section: 'Utama',
        items: [
            { label: 'Dashboard', path: '/', icon: LayoutDashboard },
            { label: 'Data Jemaah', path: '/jamaah', icon: Users },
            { label: 'Jadwal Keberangkatan', path: '/departures', icon: Calendar },
        ]
    },
    {
        section: 'Layanan & Produk',
        items: [
            { label: 'Katalog Paket', path: '/packages', icon: Package },
            // PERBAIKAN 1: Arahkan ke route package-categories yang benar
            { label: 'Kategori Paket', path: '/package-categories', icon: Tags },
            { label: 'Hotel & Akomodasi', path: '/hotels', icon: Hotel },
            { label: 'Maskapai Penerbangan', path: '/flights', icon: Plane },
        ]
    },
    {
        section: 'Keuangan & Logistik',
        items: [
            { label: 'Transaksi & Kasir', path: '/finance', icon: CreditCard },
            // PERBAIKAN 2: Pindahkan Kategori Keuangan (COA) ke sini agar logis
            { label: 'Kategori Keuangan (COA)', path: '/finance-categories', icon: BarChart3 },
            { label: 'Perlengkapan (Logistik)', path: '/logistics', icon: Box },
        ]
    },
    {
        section: 'Tim & Manajemen',
        items: [
            { label: 'Marketing & Leads', path: '/marketing', icon: Megaphone },
            { label: 'Agen & Mitra', path: '/agents', icon: UserCheck },
            { label: 'Tugas & Pekerjaan', path: '/tasks', icon: CheckSquare },
            { label: 'SDM & HR', path: '/hr', icon: Briefcase },
        ]
    },
    {
        section: 'Admin Sistem',
        items: [
            { label: 'Pengguna Sistem', path: '/users', icon: Shield },
            { label: 'Role & Akses', path: '/roles', icon: Shield },
            { label: 'Pengaturan', path: '/settings', icon: Settings },
        ]
    }
];