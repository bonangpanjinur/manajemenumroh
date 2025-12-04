import { 
    LayoutDashboard, Users, Package, Calendar, 
    ShoppingCart, Truck, Briefcase, 
    Megaphone, DollarSign, Settings, 
    Shield, Layers, Database
} from 'lucide-react';

export const menuItems = [
    {
        category: 'Utama',
        items: [
            { path: '/', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/bookings', label: 'Transaksi Booking', icon: ShoppingCart },
        ]
    },
    {
        category: 'Produk & Layanan',
        items: [
            { path: '/packages', label: 'Katalog Paket', icon: Package },
            { path: '/departures', label: 'Jadwal Keberangkatan', icon: Calendar },
            { path: '/package-categories', label: 'Kategori Paket', icon: Layers },
        ]
    },
    {
        category: 'Operasional',
        items: [
            { path: '/jamaah', label: 'Data Master Jemaah', icon: Users },
            { path: '/logistics', label: 'Logistik & Gudang', icon: Truck },
            { path: '/marketing', label: 'Marketing & Leads', icon: Megaphone },
        ]
    },
    {
        category: 'Back Office',
        items: [
            { path: '/finance', label: 'Keuangan', icon: DollarSign },
            { path: '/hr', label: 'HR & Karyawan', icon: Briefcase },
            { path: '/agents', label: 'Kemitraan (Agen)', icon: Users }, // Icon sama gpp, konteks beda
        ]
    },
    {
        category: 'Sistem',
        items: [
            { path: '/masters', label: 'Data Master (Hotel/Pesawat)', icon: Database },
            { path: '/users', label: 'Manajemen User', icon: Shield },
            { path: '/roles', label: 'Hak Akses (Role)', icon: Shield },
            { path: '/settings', label: 'Pengaturan', icon: Settings },
        ]
    }
];