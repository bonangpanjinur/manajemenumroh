import { 
    HomeIcon, 
    UserGroupIcon, 
    BriefcaseIcon, 
    CurrencyDollarIcon,
    ChartBarIcon,
    CogIcon,
    UsersIcon,
    ClipboardDocumentListIcon,
    PaperAirplaneIcon,
    TruckIcon,
    MegaphoneIcon,
    BanknotesIcon,
    CheckBadgeIcon,
    ArchiveBoxIcon,
    ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const menuConfig = [
    { name: 'Dashboard', path: '/', icon: HomeIcon, roles: ['administrator', 'manager', 'staff'] },
    { name: 'Jamaah', path: '/jamaah', icon: UserGroupIcon, roles: ['administrator', 'manager', 'staff'] },
    
    // Fitur Baru: Tabungan Umroh
    { name: 'Tabungan Umroh', path: '/savings', icon: BanknotesIcon, roles: ['administrator', 'manager', 'finance'] },
    
    { name: 'Bookings', path: '/bookings', icon: ClipboardDocumentListIcon, roles: ['administrator', 'manager', 'staff'] },
    { name: 'Keberangkatan', path: '/departures', icon: PaperAirplaneIcon, roles: ['administrator', 'manager', 'staff'] },
    { name: 'Paket Travel', path: '/packages', icon: BriefcaseIcon, roles: ['administrator', 'manager'] }, 
    { name: 'Kategori Paket', path: '/package-categories', icon: ArchiveBoxIcon, roles: ['administrator', 'manager'] },
    
    { name: 'Agen & Mitra', path: '/agents', icon: UsersIcon, roles: ['administrator', 'manager'] },
    
    // ... item menu lainnya ...
    { name: 'Keuangan', path: '/finance', icon: CurrencyDollarIcon, roles: ['administrator', 'manager', 'finance'] },
    { name: 'Akuntansi', path: '/accounting', icon: ChartBarIcon, roles: ['administrator', 'finance'] },
    { name: 'Marketing', path: '/marketing', icon: MegaphoneIcon, roles: ['administrator', 'marketing'] },
    { name: 'Logistik', path: '/logistics', icon: TruckIcon, roles: ['administrator', 'logistics'] },
    { name: 'HR', path: '/hr', icon: UsersIcon, roles: ['administrator', 'hr'] },
    { name: 'Laporan', path: '/stats', icon: ChartBarIcon, roles: ['administrator', 'manager'] },
    
    { name: 'Master Data', path: '/masters', icon: CheckBadgeIcon, roles: ['administrator'] },
    { name: 'Pengaturan', path: '/settings', icon: CogIcon, roles: ['administrator'] },
];

export default menuConfig;