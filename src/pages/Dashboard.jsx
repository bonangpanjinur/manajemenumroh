import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { 
    Users, Briefcase, Calendar, DollarSign, TrendingUp, 
    UserPlus, FileText, ArrowRight, Activity, Plane 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

// --- KOMPONEN UI ---

const WelcomeBanner = () => (
    <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">Ahlan Wa Sahlan, Admin 👋</h1>
            <p className="text-blue-100 opacity-90">Pantau performa travel umrah Anda secara real-time hari ini.</p>
        </div>
        {/* Dekorasi Background */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white opacity-5 transform skew-x-12 translate-x-10"></div>
        <div className="absolute right-20 bottom-0 h-full w-1/3 bg-white opacity-5 transform skew-x-12"></div>
    </div>
);

const StatCard = ({ title, value, icon: Icon, trend, color, subValue }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            {trend && (
                <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <TrendingUp size={12} className="mr-1" /> {trend}
                </span>
            )}
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
    </div>
);

const QuickAction = ({ icon: Icon, label, onClick, color }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all group"
    >
        <div className={`p-3 rounded-full ${color} text-white mb-3 shadow-md group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
);

const SimpleBarChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.value), 100);
    return (
        <div className="flex items-end justify-between h-40 gap-2 mt-4 px-2">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                    <div className="relative w-full flex justify-center">
                        <div 
                            className="w-full max-w-[30px] bg-blue-100 rounded-t-sm group-hover:bg-blue-600 transition-colors relative"
                            style={{ height: `${(d.value / max) * 100}%` }}
                        >
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {d.value} Jamaah
                            </div>
                        </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

// --- LOGIC UTAMA ---

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [recentBookings, setRecentBookings] = useState([]);
    const [upcomingDepartures, setUpcomingDepartures] = useState([]);

    // Data Mock untuk Grafik (Bisa diganti real API nanti)
    const chartData = [
        { label: 'Jan', value: 45 }, { label: 'Feb', value: 62 }, { label: 'Mar', value: 85 }, 
        { label: 'Apr', value: 35 }, { label: 'Mei', value: 90 }, { label: 'Jun', value: 120 }
    ];

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            // Gunakan Promise.allSettled agar satu error tidak mematikan seluruh dashboard
            const results = await Promise.allSettled([
                api.get('/stats/summary'),
                api.get('/bookings?limit=5'),
                api.get('/departures?status=open&limit=3')
            ]);

            // Helper: Ekstrak data dengan aman, menangani struktur { data: ... } dari API WP
            const getVal = (res, def) => {
                if (res.status === 'fulfilled' && res.value) {
                    // Cek apakah data dibungkus dalam properti 'data' atau langsung
                    return res.value.data || res.value || def;
                }
                return def;
            };

            const statsData = getVal(results[0], {});
            
            // Set Stats dengan fallback 0 agar tidak blank
            setStats({
                total_jamaah: statsData.total_jamaah || 0,
                active_packages: statsData.active_packages || 0,
                upcoming_departures: statsData.upcoming_departures || 0,
                monthly_income: statsData.monthly_income || 0
            });

            // List Data: Pastikan selalu Array
            const bookings = getVal(results[1], []);
            setRecentBookings(Array.isArray(bookings) ? bookings : []);

            const departures = getVal(results[2], []);
            setUpcomingDepartures(Array.isArray(departures) ? departures : []);

        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Menyiapkan Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 space-y-8 animate-fadeIn pb-20">
            <WelcomeBanner />

            {/* KARTU STATISTIK UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Jamaah Aktif" 
                    value={stats.total_jamaah} 
                    subValue="Database terverifikasi"
                    icon={Users} 
                    color="bg-blue-600" 
                    trend="+12% bulan ini"
                />
                <StatCard 
                    title="Estimasi Omset" 
                    value={formatCurrency(stats.monthly_income)}
                    subValue="Bulan berjalan"
                    icon={DollarSign} 
                    color="bg-green-600"
                    trend="+5.4%"
                />
                <StatCard 
                    title="Jadwal Keberangkatan" 
                    value={stats.upcoming_departures} 
                    subValue="Status Open"
                    icon={Calendar} 
                    color="bg-purple-600"
                />
                <StatCard 
                    title="Paket Tersedia" 
                    value={stats.active_packages}
                    subValue="Siap dipublikasi" 
                    icon={Briefcase} 
                    color="bg-orange-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* KOLOM KIRI: Grafik & Quick Actions (2/3 Lebar) */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* GRAFIK */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Activity size={20} className="text-blue-600" />
                                Tren Pendaftaran Jamaah
                            </h3>
                            <select className="text-xs border-gray-200 rounded-lg p-1 bg-gray-50 text-gray-600">
                                <option>6 Bulan Terakhir</option>
                                <option>Tahun Ini</option>
                            </select>
                        </div>
                        <SimpleBarChart data={chartData} />
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <QuickAction icon={UserPlus} label="Input Jamaah" color="bg-blue-500" onClick={() => window.location.hash = '#/jamaah'} />
                        <QuickAction icon={FileText} label="Buat Booking" color="bg-green-500" onClick={() => window.location.hash = '#/bookings'} />
                        <QuickAction icon={Plane} label="Cek Jadwal" color="bg-purple-500" onClick={() => window.location.hash = '#/departures'} />
                        <QuickAction icon={DollarSign} label="Catat Bayar" color="bg-yellow-500" onClick={() => window.location.hash = '#/finance'} />
                    </div>

                    {/* TABEL BOOKING TERBARU */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Booking Terbaru</h3>
                            <button onClick={() => window.location.hash = '#/bookings'} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                                Lihat Semua <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="p-4 pl-6">Jamaah</th>
                                        <th className="p-4">Paket</th>
                                        <th className="p-4">Tanggal</th>
                                        <th className="p-4 pr-6 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentBookings.length === 0 ? (
                                        <tr><td colSpan="4" className="p-6 text-center text-gray-400">Belum ada data booking.</td></tr>
                                    ) : (
                                        recentBookings.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 pl-6 font-medium text-gray-900">{row.jamaah_name || 'Tanpa Nama'}</td>
                                                <td className="p-4 text-gray-600">{row.package_name || '-'}</td>
                                                <td className="p-4 text-gray-500">{row.departure_date ? formatDate(row.departure_date) : '-'}</td>
                                                <td className="p-4 pr-6 text-right">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                        row.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {row.status ? row.status.toUpperCase() : '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* KOLOM KANAN: Jadwal & Info (1/3 Lebar) */}
                <div className="space-y-8">
                    {/* JADWAL TERDEKAT */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-purple-600" />
                            Keberangkatan Dekat
                        </h3>
                        <div className="space-y-4">
                            {upcomingDepartures.length === 0 ? (
                                <p className="text-gray-400 text-center text-sm py-4">Tidak ada jadwal open dalam waktu dekat.</p>
                            ) : (
                                upcomingDepartures.map((dept, idx) => {
                                    const sisa = dept.quota - (dept.filled_seats || 0);
                                    const tgl = dept.departure_date ? new Date(dept.departure_date) : new Date();
                                    return (
                                        <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                                            <div className="bg-blue-100 text-blue-700 rounded-lg p-2 text-center min-w-[50px]">
                                                <span className="block text-xs font-bold uppercase">{tgl.toLocaleString('default', { month: 'short' })}</span>
                                                <span className="block text-lg font-bold">{tgl.getDate()}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{dept.package_name}</h4>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-xs text-gray-500">Kuota: {dept.quota}</span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${sisa < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                        Sisa: {sisa}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                        <button onClick={() => window.location.hash = '#/departures'} className="w-full mt-4 py-2 text-sm text-center text-gray-500 hover:text-blue-600 border border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors">
                            Lihat Kalender Lengkap
                        </button>
                    </div>

                    {/* PROMO / INFO CARD */}
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white text-center shadow-lg">
                        <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Briefcase size={24} />
                        </div>
                        <h4 className="font-bold mb-2">Butuh Paket Baru?</h4>
                        <p className="text-indigo-200 text-xs mb-4">Buat paket umrah custom atau reguler dengan mudah untuk musim depan.</p>
                        <button onClick={() => window.location.hash = '#/packages'} className="bg-white text-indigo-900 px-4 py-2 rounded-lg text-sm font-bold w-full hover:bg-indigo-50 transition-colors shadow-md">
                            Buat Paket Sekarang
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;