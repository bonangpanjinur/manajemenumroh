import { 
    LayoutDashboard, Users, Calendar, Briefcase, 
    Settings, Package, FileText, DollarSign, 
    UserCheck, Megaphone, Database, Truck, PieChart 
} from 'lucide-react';

export const menuItems = [
    { 
        label: 'Dashboard', 
        path: '/', 
        icon: LayoutDashboard 
    },
    {
        section: 'Bisnis & Transaksi',
        items: [
            { label: 'Booking & Order', path: '/bookings', icon: FileText },
            { label: 'Keuangan (Finance)', path: '/finance', icon: DollarSign },
            { label: 'Laporan Akuntansi', path: '/accounting', icon: PieChart }, // Menu Baru V9.0
        ]
    },
    {
        section: 'Operasional',
        items: [
            { label: 'Data Jemaah', path: '/jamaah', icon: Users },
            { label: 'Jadwal Keberangkatan', path: '/departures', icon: Calendar },
            { label: 'Logistik & Gudang', path: '/logistics', icon: Truck },
        ]
    },
    {
        section: 'Enterprise',
        items: [
            { label: 'HR & Karyawan', path: '/hr', icon: Briefcase }, // Menu HR Ada
            { label: 'Marketing CRM', path: '/marketing', icon: Megaphone }, // Menu Marketing Ada
            { label: 'Agen & Mitra', path: '/agents', icon: UserCheck },
        ]
    },
    {
        section: 'Master Data',
        items: [
            { label: 'Produk & Paket', path: '/packages', icon: Package },
            { label: 'Master Data Center', path: '/masters', icon: Database },
            { label: 'Pengaturan', path: '/settings', icon: Settings },
        ]
    }
];