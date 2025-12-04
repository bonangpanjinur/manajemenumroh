import React from 'react';
import { 
  HomeIcon, 
  UsersIcon, 
  ClipboardDocumentListIcon, 
  BanknotesIcon, 
  MegaphoneIcon, 
  BriefcaseIcon, 
  TruckIcon,
  QrCodeIcon 
} from '@heroicons/react/24/outline';

// Perhatikan: Kita tambahkan 'export' di depan const agar menjadi Named Export
export const menuItems = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <HomeIcon className="w-5 h-5" />,
    roles: ['admin', 'staff', 'agent']
  },
  {
    title: 'Manajemen Jamaah',
    path: '/jamaah',
    icon: <UsersIcon className="w-5 h-5" />,
    roles: ['admin', 'staff']
  },
  {
    title: 'Booking & Paket',
    path: '/bookings',
    icon: <ClipboardDocumentListIcon className="w-5 h-5" />,
    roles: ['admin', 'staff']
  },
  {
    title: 'Scan Absensi',
    path: '/attendance-scan',
    icon: <QrCodeIcon className="w-5 h-5" />,
    roles: ['admin', 'staff', 'driver', 'handling']
  },
  {
    title: 'Keuangan',
    path: '/finance',
    icon: <BanknotesIcon className="w-5 h-5" />,
    roles: ['admin', 'finance']
  },
  {
    title: 'HR & Absensi',
    path: '/hr',
    icon: <BriefcaseIcon className="w-5 h-5" />,
    roles: ['admin', 'hr']
  },
  {
    title: 'Logistik',
    path: '/logistics',
    icon: <TruckIcon className="w-5 h-5" />,
    roles: ['admin', 'logistics']
  },
  {
    title: 'Marketing',
    path: '/marketing',
    icon: <MegaphoneIcon className="w-5 h-5" />,
    roles: ['admin', 'marketing']
  },
  {
    title: 'Kemitraan Agen',
    path: '/agents',
    icon: <UsersIcon className="w-5 h-5" />,
    roles: ['admin', 'marketing']
  },
];

// Kita juga sediakan default export untuk kompatibilitas
export default menuItems;