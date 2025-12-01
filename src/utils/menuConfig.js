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
    Megaphone
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
            { label: 'Kategori Paket', path: '/categories', icon: Tags },
            { label: 'Hotel & Akomodasi', path: '/hotels', icon: Hotel },
            { label: 'Maskapai Penerbangan', path: '/flights', icon: Plane },
        ]
    },
    {
        section: 'Keuangan & Logistik',
        items: [
            { label: 'Transaksi & Kasir', path: '/finance', icon: CreditCard },
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