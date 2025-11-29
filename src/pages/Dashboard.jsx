import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext';
import api from '../utils/api';
import { Users, DollarSign, Calendar, CheckSquare, Plane, TrendingUp, AlertCircle } from 'lucide-react';
import formatters from '../utils/formatters';

const Dashboard = () => {
    const { user } = useData();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('umh/v1/dashboard-stats');
                setStats(response);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Layout title="Dashboard"><div className="p-8 text-center">Memuat Data Dashboard...</div></Layout>;

    // Card Component
    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-all">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-white`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    );

    return (
        <Layout title={`Selamat Datang, ${user?.name || 'Admin'}`}>
            <div className="space-y-6">
                
                {/* 1. Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Jemaah Aktif" 
                        value={stats?.cards?.active_jamaah} 
                        icon={Users} 
                        color="bg-blue-600"
                        subtext="Menunggu Keberangkatan"
                    />
                    <StatCard 
                        title="Omset Bulan Ini" 
                        value={formatters.currency(stats?.cards?.monthly_revenue)} 
                        icon={DollarSign} 
                        color="bg-green-600"
                        subtext="Pemasukan terverifikasi"
                    />
                    <StatCard 
                        title="Jadwal Terdekat" 
                        value={stats?.cards?.next_departure ? 
                            formatters.date(stats?.cards?.next_departure.departure_date) : '-'} 
                        icon={Plane} 
                        color="bg-purple-600"
                        subtext={stats?.cards?.next_departure ? 
                            `${stats.cards.next_departure.booked} / ${stats.cards.next_departure.quota} Seat Terisi` : 'Belum ada jadwal'}
                    />
                    <StatCard 
                        title="Tugas Pending" 
                        value={stats?.cards?.pending_tasks} 
                        icon={CheckSquare} 
                        color="bg-orange-500"
                        subtext="Perlu diselesaikan"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 2. Upcoming Departures Table */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Calendar size={18} className="text-blue-600"/> Jadwal Keberangkatan
                            </h3>
                            <button className="text-sm text-blue-600 font-medium hover:underline">Lihat Semua</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                                    <tr>
                                        <th className="py-3 px-4">Paket</th>
                                        <th className="py-3 px-4">Tanggal</th>
                                        <th className="py-3 px-4 text-center">Seat</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {stats?.upcoming?.map((item) => {
                                        const occupancy = (item.booked / item.quota) * 100;
                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-3 px-4 font-medium text-gray-800">{item.name}</td>
                                                <td className="py-3 px-4 text-gray-600">{formatters.date(item.departure_date)}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className={`h-full ${occupancy > 90 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${occupancy}%`}}></div>
                                                        </div>
                                                        <span className="text-xs text-gray-500">{item.booked}/{item.quota}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">{item.status}</span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {(!stats?.upcoming || stats.upcoming.length === 0) && (
                                        <tr><td colSpan="4" className="text-center py-4 text-gray-400">Tidak ada jadwal dalam waktu dekat</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 3. Quick Actions / Alerts */}
                    <div className="space-y-6">
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingUp size={18} className="text-green-600"/> Pertumbuhan
                            </h3>
                            {/* Simple Chart Placeholder using HTML/CSS */}
                            <div className="h-40 flex items-end justify-between gap-2 border-b border-gray-200 pb-2">
                                {stats?.chart?.map((c, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-1 w-full">
                                        <div 
                                            className="w-full bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-all" 
                                            style={{height: `${Math.min(c.count * 10, 100)}%`}}
                                        ></div>
                                        <span className="text-[10px] text-gray-400">{c.month.split('-')[1]}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-2">Pendaftaran 6 Bulan Terakhir</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;