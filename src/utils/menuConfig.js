import { 
    LayoutDashboard, Users, Plane, Calendar, Package, 
    CreditCard, Hotel, Briefcase, Settings, FileText, 
    Box, UserCheck, Shield
} from 'lucide-react';

export const menuItems = [
    {
        section: 'Utama',
        items: [
            { label: 'Dashboard', path: '/', icon: LayoutDashboard },
            { label: 'Data Jemaah', path: '/jamaah', icon: Users },
            { label: 'Keberangkatan', path: '/departures', icon: Calendar }, // Halaman Departures Baru
        ]
    },
    {
        section: 'Layanan & Produk',
        items: [
            { label: 'Katalog Paket', path: '/packages', icon: Package },
            { label: 'Hotel & Akomodasi', path: '/hotels', icon: Hotel },
            { label: 'Maskapai', path: '/flights', icon: Plane },
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
        section: 'Manajemen',
        items: [
            { label: 'Agen & Marketing', path: '/agents', icon: UserCheck },
            { label: 'Pengguna Sistem', path: '/users', icon: Shield }, // Admin management
            { label: 'Pengaturan', path: '/settings', icon: Settings },
        ]
    }
];