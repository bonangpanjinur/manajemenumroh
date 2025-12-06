import { 
    LayoutDashboard, Users, Calendar, Briefcase, 
    Settings, Package, FileText, DollarSign, 
    UserCheck, Megaphone, Database, Truck, PieChart,
    ShoppingBag, Globe, Layers
} from 'lucide-react';

export const menuItems = [
    // 1. Dashboard Utama
    { 
        label: 'Dashboard', 
        path: '/', 
        icon: LayoutDashboard 
    },

    // 2. Produk (Core Business) - Ditaruh paling atas
    {
        section: 'Produk & Katalog',
        items: [
            { label: 'Master Paket', path: '/packages', icon: Package },
            { label: 'Kategori Paket', path: '/package-categories', icon: Layers },
            { label: 'Simulasi Storefront', path: '/storefront', icon: Globe }, // Menu Baru
        ]
    },

    // 3. Penjualan & Marketing (Front Office)
    {
        section: 'Penjualan & Marketing',
        items: [
            { label: 'Booking & Order', path: '/bookings', icon: FileText },
            { label: 'Pipeline Leads (CRM)', path: '/marketing', icon: Megaphone },
            { label: 'Kemitraan Agen', path: '/agents', icon: UserCheck },
        ]
    },

    // 4. Operasional (Back Office)
    {
        section: 'Operasional Travel',
        items: [
            { label: 'Data Jemaah', path: '/jamaah', icon: Users },
            { label: 'Jadwal Keberangkatan', path: '/departures', icon: Calendar },
            { label: 'Logistik & Gudang', path: '/logistics', icon: Truck },
            { label: 'HR & Karyawan', path: '/hr', icon: Briefcase },
        ]
    },

    // 5. Keuangan (Finance)
    {
        section: 'Keuangan & Akuntansi',
        items: [
            { label: 'Arus Kas (Finance)', path: '/finance', icon: DollarSign },
            { label: 'Laporan Akuntansi', path: '/accounting', icon: PieChart },
        ]
    },

    // 6. Pengaturan Sistem
    {
        section: 'Sistem',
        items: [
            { label: 'Master Data Center', path: '/masters', icon: Database },
            { label: 'Pengaturan', path: '/settings', icon: Settings },
        ]
    }
];