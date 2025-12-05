import { 
    LayoutDashboard, Users, Package, Calendar, 
    CreditCard, UserCheck, Briefcase, ClipboardList, 
    Truck, BarChart3, Settings, Shield, Tag, UserPlus 
} from 'lucide-react';

export const menuItems = [
    {
        title: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
        roles: ['administrator', 'staff', 'finance', 'agent']
    },
    {
        title: 'Produk & Paket',
        icon: Package,
        roles: ['administrator', 'staff'],
        submenu: [
            { title: 'Katalog Paket', path: '/packages', icon: Package },
            { title: 'Kategori', path: '/package-categories', icon: Tag },
            { title: 'Jadwal (Departures)', path: '/departures', icon: Calendar } // Optional page
        ]
    },
    {
        title: 'Transaksi',
        icon: CreditCard,
        roles: ['administrator', 'staff', 'finance'],
        submenu: [
            { title: 'Data Booking', path: '/bookings', icon: ClipboardList },
            { title: 'Keuangan', path: '/finance', icon: BarChart3 }
        ]
    },
    {
        title: 'Operasional',
        icon: Briefcase,
        roles: ['administrator', 'staff'],
        submenu: [
            { title: 'Data Jemaah', path: '/jamaah', icon: Users },
            { title: 'Logistik', path: '/logistics', icon: Truck },
            { title: 'Tugas Tim', path: '/tasks', icon: UserCheck }
        ]
    },
    {
        title: 'HR & Kemitraan',
        icon: UserPlus,
        roles: ['administrator', 'hr'],
        submenu: [
            { title: 'Karyawan (HR)', path: '/hr', icon: Users },
            { title: 'Scan Absensi', path: '/attendance-scanner', icon: UserCheck },
            { title: 'Agen & Mitra', path: '/agents', icon: Users }
        ]
    },
    {
        title: 'Marketing (CRM)',
        path: '/marketing',
        icon: BarChart3,
        roles: ['administrator', 'marketing']
    },
    {
        title: 'Sistem',
        icon: Settings,
        roles: ['administrator'],
        submenu: [
            { title: 'Pengguna', path: '/users', icon: Users },
            { title: 'Master Data', path: '/masters', icon: Settings }, // Hotel & Airlines
            { title: 'Hak Akses', path: '/roles', icon: Shield },
            { title: 'Pengaturan', path: '/settings', icon: Settings }
        ]
    }
];