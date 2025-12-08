import React from 'react';
import { 
    LayoutDashboard, 
    Users, 
    Briefcase, 
    Calendar, 
    CreditCard, 
    UserCheck, 
    Settings, 
    FileText,
    Archive,
    Package,
    MapPin,
    Shield,
    Database,
    PhoneCall,
    Award
} from 'lucide-react';

// Pastikan export const (named export) agar sesuai dengan import { menuItems }
export const menuItems = [
    { 
        path: '/', 
        label: 'Dashboard', 
        icon: <LayoutDashboard size={20} />,
        roles: ['admin', 'manager', 'staff']
    },
    { 
        path: '/bookings', 
        label: 'Pemesanan', 
        icon: <UserCheck size={20} />,
        roles: ['admin', 'sales']
    },
    { 
        path: '/jamaah', 
        label: 'Data Jamaah', 
        icon: <Users size={20} />,
        roles: ['admin', 'staff']
    },
    { 
        path: '/departures', 
        label: 'Jadwal Keberangkatan', 
        icon: <Calendar size={20} />,
        roles: ['admin', 'manager']
    },
    { 
        path: '/packages', 
        label: 'Paket Umrah', 
        icon: <Briefcase size={20} />,
        roles: ['admin', 'manager']
    },
    { 
        path: '/finance', 
        label: 'Keuangan', 
        icon: <CreditCard size={20} />,
        roles: ['admin', 'finance']
    },
    { 
        path: '/savings', 
        label: 'Tabungan', 
        icon: <Database size={20} />,
        roles: ['admin', 'finance']
    },
    { 
        path: '/manasik', 
        label: 'Manasik', 
        icon: <MapPin size={20} />,
        roles: ['admin', 'staff']
    },
    { 
        path: '/logistics', 
        label: 'Logistik', 
        icon: <Archive size={20} />,
        roles: ['admin', 'logistics']
    },
    { 
        path: '/marketing', 
        label: 'Marketing & Leads', 
        icon: <PhoneCall size={20} />,
        roles: ['admin', 'marketing']
    },
    { 
        path: '/private-umrah', 
        label: 'Request Private', 
        icon: <Shield size={20} />,
        roles: ['admin', 'sales']
    },
    { 
        path: '/badal', 
        label: 'Badal Umrah', 
        icon: <Award size={20} />,
        roles: ['admin', 'sales']
    },
    { 
        path: '/agents', 
        label: 'Agen & Mitra', 
        icon: <Users size={20} />,
        roles: ['admin', 'manager']
    },
    { 
        path: '/masters', 
        label: 'Data Master', 
        icon: <FileText size={20} />,
        roles: ['admin']
    },
    { 
        path: '/settings', 
        label: 'Pengaturan', 
        icon: <Settings size={20} />,
        roles: ['admin']
    }
];