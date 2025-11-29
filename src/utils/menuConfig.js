import React from 'react';
import { 
    LayoutDashboard, Users, Briefcase, Calendar, Wallet, Megaphone, 
    ClipboardList, UserCog, Settings, Box, Plane, Building, UserCheck 
} from 'lucide-react';

export const MENUS = [
    {
        header: 'Utama',
        items: [
            { path: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['all'] },
            { path: 'jamaah', label: 'Data Jemaah', icon: <Users size={20} />, roles: ['super_admin', 'administrator', 'owner', 'admin_staff', 'agent'] },
            { path: 'packages', label: 'Paket Umrah/Haji', icon: <Briefcase size={20} />, roles: ['super_admin', 'administrator', 'owner', 'admin_staff', 'marketing_staff'] },
            { path: 'departures', label: 'Jadwal Keberangkatan', icon: <Calendar size={20} />, roles: ['super_admin', 'administrator', 'owner', 'admin_staff'] }
        ]
    },
    {
        header: 'Keuangan & Bisnis',
        items: [
            { path: 'finance', label: 'Keuangan & Kasir', icon: <Wallet size={20} />, roles: ['super_admin', 'administrator', 'owner', 'finance_staff'] },
            { path: 'marketing', label: 'Marketing & Leads', icon: <Megaphone size={20} />, roles: ['super_admin', 'administrator', 'owner', 'marketing_staff'] },
            // Point 7: Menu Sub Agent (Gabung di Agents page tapi label jelas)
            { path: 'agents', label: 'Agen & Mitra', icon: <UserCheck size={20} />, roles: ['super_admin', 'administrator', 'owner', 'marketing_staff'] }
        ]
    },
    {
        header: 'Operasional Internal',
        items: [
            { path: 'tasks', label: 'Tugas Tim', icon: <ClipboardList size={20} />, roles: ['super_admin', 'administrator', 'owner', 'admin_staff', 'hr_staff'] },
            { path: 'logistics', label: 'Logistik', icon: <Box size={20} />, roles: ['super_admin', 'administrator', 'owner', 'admin_staff'] },
            // Point 6: HR Menu
            { path: 'hr', label: 'HR & Karyawan', icon: <UserCog size={20} />, roles: ['super_admin', 'administrator', 'owner', 'hr_staff'] }
        ]
    },
    {
        header: 'Master Data',
        items: [
            { path: 'hotels', label: 'Hotel', icon: <Building size={18} />, roles: ['super_admin', 'administrator', 'owner'] },
            { path: 'flights', label: 'Maskapai', icon: <Plane size={18} />, roles: ['super_admin', 'administrator', 'owner'] },
            { path: 'users', label: 'Pengguna Sistem', icon: <Users size={18} />, roles: ['super_admin', 'administrator', 'owner'] },
            { path: 'settings', label: 'Pengaturan', icon: <Settings size={18} />, roles: ['super_admin', 'administrator'] }
        ]
    }
];

export const hasAccess = (userRole, allowedRoles) => {
    if (!userRole) return false;
    if (allowedRoles.includes('all')) return true;
    if (userRole === 'super_admin' || userRole === 'administrator') return true; // Admin WP selalu allow
    return allowedRoles.includes(userRole);
};