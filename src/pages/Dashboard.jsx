import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { Users, Briefcase, Calendar, DollarSign, TrendingUp, UserCheck } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import Spinner from '../components/Spinner';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            {loading ? (
                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            )}
        </div>
    </div>
);

const Dashboard = () => {
    // 1. Initial State yang Aman
    const [stats, setStats] = useState({
        total_jamaah: 0,
        active_packages: 0,
        upcoming_departures: 0,
        monthly_income: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [upcomingDepartures, setUpcomingDepartures] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. Fetch Data dengan Error Handling Kuat
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            // Gunakan Promise.allSettled agar jika satu widget error, dashboard tetap tampil
            const results = await Promise.allSettled([
                api.get('/stats/summary'),
                api.get('/bookings?limit=5'),
                api.get('/departures?status=open&limit=5')
            ]);

            // Helper untuk mengambil data dengan aman
            const getVal = (res, defaultVal) => (res.status === 'fulfilled' && res.value) ? res.value : defaultVal;

            // Update State
            setStats(getVal(results[0], {
                total_jamaah: 0,
                active_packages: 0,
                upcoming_departures: 0,
                monthly_income: 0
            }));

            // Pastikan data list selalu array
            const bookings = getVal(results[1], []);
            setRecentBookings(Array.isArray(bookings) ? bookings : []);

            const departures = getVal(results[2], []);
            setUpcomingDepartures(Array.isArray(departures) ? departures : []);

        } catch (error) {
            console.error("Dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Jamaah" 
                    value={stats.total_jamaah || 0} 
                    icon={Users} 
                    color="bg-blue-500" 
                    loading={loading}
                />
                <StatCard 
                    title="Paket Aktif" 
                    value={stats.active_packages || 0} 
                    icon={Briefcase} 
                    color="bg-green-500" 
                    loading={loading}
                />
                <StatCard 
                    title="Jadwal Keberangkatan" 
                    value={stats.upcoming_departures || 0} 
                    icon={Calendar} 
                    color="bg-purple-500" 
                    loading={loading}
                />
                <StatCard 
                    title="Pemasukan Bulan Ini" 
                    value={formatCurrency(stats.monthly_income || 0)} 
                    icon={DollarSign} 
                    color="bg-yellow-500" 
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings Widget */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-gray-700 flex items-center gap-2">
                            <UserCheck size={18} /> Booking Terbaru
                        </h2>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="p-3">Jamaah</th>
                                    <th className="p-3">Paket</th>
                                    <th className="p-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" className="p-6 text-center text-gray-400">Memuat data...</td></tr>
                                ) : recentBookings.length === 0 ? (
                                    <tr><td colSpan="3" className="p-6 text-center text-gray-400">Belum ada booking terbaru.</td></tr>
                                ) : (
                                    // SAFETY CHECK: .map() hanya jalan di array valid
                                    recentBookings.map((booking, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{booking.jamaah_name || 'Tanpa Nama'}</td>
                                            <td className="p-3 text-gray-600">{booking.package_name || '-'}</td>
                                            <td className="p-3 text-right">
                                                <span className={`px-2 py-1 rounded text-xs ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upcoming Departures Widget */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-gray-700 flex items-center gap-2">
                            <TrendingUp size={18} /> Jadwal Terdekat
                        </h2>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="p-3">Tanggal</th>
                                    <th className="p-3">Program</th>
                                    <th className="p-3 text-right">Seat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" className="p-6 text-center text-gray-400">Memuat jadwal...</td></tr>
                                ) : upcomingDepartures.length === 0 ? (
                                    <tr><td colSpan="3" className="p-6 text-center text-gray-400">Tidak ada jadwal terdekat.</td></tr>
                                ) : (
                                    // SAFETY CHECK: .map() aman
                                    upcomingDepartures.map((dept, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                            <td className="p-3 font-medium text-blue-600">{formatDate(dept.departure_date)}</td>
                                            <td className="p-3">{dept.package_name}</td>
                                            <td className="p-3 text-right">
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">
                                                    {dept.filled_seats || 0}/{dept.quota}
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
        </div>
    );
};

export default Dashboard;