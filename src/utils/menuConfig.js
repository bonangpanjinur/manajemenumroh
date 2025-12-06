import { 
    LayoutDashboard, 
    Users, 
    Calendar, 
    Package, 
    Briefcase, 
    Settings, 
    FileText, 
    DollarSign, 
    Truck, 
    Megaphone,
    Monitor // Icon baru untuk web simulation
} from 'lucide-react';

export const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    
    // ... Menu lama biarkan ...

    { section: 'Operasional' },
    { path: '/departures', label: 'Jadwal Keberangkatan', icon: Calendar },
    { path: '/rooming', label: 'Rooming List', icon: Users },
    
    { section: 'Produk' },
    { path: '/packages', label: 'Master Paket', icon: Package },
    { path: '/package-categories', label: 'Kategori Paket', icon: Package },
    { path: '/storefront-simulation', label: 'Simulasi Website', icon: Monitor }, // MENU BARU
    
    { section: 'Keuangan' },
    { path: '/bookings', label: 'Transaksi & Bayar', icon: FileText },
    { path: '/finance', label: 'Keuangan & Kas', icon: DollarSign },
    { path: '/accounting', label: 'Akuntansi (GL)', icon: Briefcase },

    { section: 'Lainnya' },
    { path: '/masters', label: 'Data Master', icon: Settings },
    { path: '/users', label: 'Manajemen User', icon: Users },
    { path: '/roles', label: 'Role & Akses', icon: Settings },
    { path: '/settings', label: 'Pengaturan', icon: Settings },
];