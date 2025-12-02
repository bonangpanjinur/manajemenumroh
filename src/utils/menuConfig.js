import { 
    LayoutDashboard, Users, Plane, Calendar, Package, CreditCard, 
    Hotel, Settings, Box, UserCheck, Shield, Tags, 
    Briefcase, Megaphone, Wallet, Trash2 
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
        section: 'Produk & Layanan',
        items: [
            { label: 'Katalog Paket', path: '/packages', icon: Package },
            { label: 'Master Hotel', path: '/hotels', icon: Hotel },
            { label: 'Master Maskapai', path: '/flights', icon: Plane },
            { label: 'Kategori Paket', path: '/package-categories', icon: Tags },
        ]
    },
    {
        section: 'Keuangan & Aset',
        items: [
            { label: 'Transaksi & Kasir', path: '/finance', icon: Wallet },
            { label: 'Akun Keuangan (COA)', path: '/categories', icon: CreditCard },
            { label: 'Logistik & Stok', path: '/logistics', icon: Box },
        ]
    },
    {
        section: 'Tim & Marketing',
        items: [
            { label: 'Marketing & Leads', path: '/marketing', icon: Megaphone },
            { label: 'Agen & Mitra', path: '/agents', icon: UserCheck },
            { label: 'SDM (HR) & Absensi', path: '/hr', icon: Briefcase },
        ]
    },
    {
        section: 'Pengaturan Sistem',
        items: [
            { label: 'Pengguna Sistem', path: '/users', icon: Users },
            { label: 'Peran & Akses', path: '/roles', icon: Shield },
            { label: 'Pengaturan', path: '/settings', icon: Settings },
            // { label: 'Sampah (Trash)', path: '/trash', icon: Trash2 }, // Uncomment jika halaman Trash.jsx sudah siap
        ]
    }
];