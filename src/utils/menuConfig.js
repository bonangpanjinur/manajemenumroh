import { 
  Home, 
  Users, 
  ClipboardList, 
  Calendar, 
  Banknote, 
  Megaphone, 
  Briefcase, 
  Truck,
  QrCode,
  Layers,
  Package,
  Settings,
  Database,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

export const menuItems = [
  {
    category: "Utama",
    items: [
      { label: 'Dashboard', path: '/', icon: Home, roles: ['admin', 'staff'] }
    ]
  },
  {
    category: "Produk & Layanan",
    items: [
      { label: 'Data Paket', path: '/packages', icon: Package, roles: ['admin', 'staff'] },
      { label: 'Jadwal Keberangkatan', path: '/departures', icon: Calendar, roles: ['admin', 'staff'] },
      { label: 'Kategori Paket', path: '/package-categories', icon: Layers, roles: ['admin'] },
      { label: 'Data Booking', path: '/bookings', icon: ClipboardList, roles: ['admin', 'staff'] },
    ]
  },
  {
    category: "Operasional & CRM",
    items: [
      { label: 'Manajemen Jamaah', path: '/jamaah', icon: Users, roles: ['admin', 'staff'] },
      { label: 'Logistik', path: '/logistics', icon: Truck, roles: ['admin', 'logistics'] },
      { label: 'Kemitraan Agen', path: '/agents', icon: Users, roles: ['admin', 'marketing'] },
      { label: 'Tugas (Tasks)', path: '/tasks', icon: CheckSquare, roles: ['admin', 'staff'] },
    ]
  },
  {
    category: "Keuangan & Marketing",
    items: [
      { label: 'Keuangan', path: '/finance', icon: Banknote, roles: ['admin', 'finance'] },
      { label: 'Marketing', path: '/marketing', icon: Megaphone, roles: ['admin', 'marketing'] },
    ]
  },
  {
    category: "SDM & Internal",
    items: [
      { label: 'HR & Karyawan', path: '/hr', icon: Briefcase, roles: ['admin', 'hr'] },
      { label: 'Scan Absensi', path: '/attendance-scan', icon: QrCode, roles: ['admin', 'staff'] },
    ]
  },
  {
    category: "Sistem",
    items: [
      { label: 'Master Data', path: '/masters', icon: Database, roles: ['admin'] },
      { label: 'Pengguna (Users)', path: '/users', icon: ShieldCheck, roles: ['admin'] },
      { label: 'Role & Akses', path: '/roles', icon: ShieldCheck, roles: ['admin'] },
      { label: 'Pengaturan', path: '/settings', icon: Settings, roles: ['admin'] },
    ]
  }
];

export default menuItems;