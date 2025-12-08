import { 
  Home, Users, Briefcase, Calendar, FileText, 
  DollarSign, Truck, Megaphone, Settings, CheckSquare,
  CreditCard, Shield, UserPlus, Heart, MessageSquare
} from 'lucide-react';

export const menuItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  
  { section: 'Produk & Layanan' },
  { path: '/packages', label: 'Paket Umrah', icon: Briefcase },
  { path: '/departures', label: 'Jadwal Keberangkatan', icon: Calendar },
  { path: '/private-umrah', label: 'Private / Custom', icon: Shield }, // NEW
  { path: '/badal', label: 'Badal Umrah', icon: Heart }, // NEW
  
  { section: 'Transaksi' },
  { path: '/bookings', label: 'Data Booking', icon: FileText },
  { path: '/savings', label: 'Tabungan Umrah', icon: CreditCard }, // NEW
  { path: '/finance', label: 'Keuangan', icon: DollarSign },
  
  { section: 'Operasional' },
  { path: '/jamaah', label: 'Data Jamaah', icon: Users },
  { path: '/mutawwif', label: 'Mutawwif', icon: UserPlus }, // NEW
  { path: '/manasik', label: 'Manasik', icon: CheckSquare }, // NEW
  { path: '/logistics', label: 'Logistik', icon: Truck },
  
  { section: 'Lainnya' },
  { path: '/marketing', label: 'Marketing', icon: Megaphone },
  { path: '/agents', label: 'Keagenan', icon: Users },
  { path: '/hr', label: 'SDM / HR', icon: Users },
  { path: '/support', label: 'Support & Tiket', icon: MessageSquare }, // NEW
  { path: '/masters', label: 'Data Master', icon: Settings },
  { path: '/settings', label: 'Pengaturan', icon: Settings },
];