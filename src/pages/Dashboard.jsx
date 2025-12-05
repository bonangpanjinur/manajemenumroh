import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, ShoppingCart, Plane, DollarSign, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import Spinner from '../components/Spinner';

const StatCard = ({ title, value, subtext, icon: Icon, color, loading }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
            ) : (
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            )}
            {subtext && <p className={`text-xs mt-1 flex items-center gap-1 ${subtext.includes('+') ? 'text-green-600' : 'text-gray-400'}`}>
                {subtext.includes('+') && <TrendingUp size={10}/>} {subtext}
            </p>}
        </div>
        <div className={`p-3 rounded-lg ${color} shadow-sm`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

const Dashboard = () => {
    // PERBAIKAN: Inisialisasi state dengan struktur default yang aman
    const [stats, setStats] = useState({
        total_jamaah: 0,
        bookings_active: 0,
        upcoming_departures: 0,
        revenue_month: 0,
        recent_bookings: [], // Array kosong agar .map tidak error
        chart_data: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('umh/v1/stats');
                // PERBAIKAN: Handle jika response dibungkus wp_send_json_success ({ success: true, data: ... })
                // atau langsung dari REST API
                const realData = res.data.data ? res.data.data : res.data;
                
                if (realData && !realData.code) { // Pastikan bukan object error WP
                    setStats(realData);
                }
            } catch (e) {
                console.error("Gagal load stats", e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatIDR = (num) => {
        if (!num) return '0';
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'M';
        if (num >= 1000000) return (num / 1000000).toFixed(0) + 'jt';
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Safety check untuk recent_bookings
    const recentBookings = Array.isArray(stats?.recent_bookings) ? stats.recent_bookings : [];
    const chartData = Array.isArray(stats?.chart_data) ? stats.chart_data : [];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Executive Dashboard</h1>
                    <p className="text-gray-500">Ringkasan performa bisnis travel umroh real-time.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm flex items-center gap-2 text-gray-600">
                    <Clock size={16}/> {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Jamaah" 
                    value={stats.total_jamaah || 0} 
                    loading={loading}
                    icon={Users} color="bg-blue-600" 
                />
                <StatCard 
                    title="Booking Aktif" 
                    value={stats.bookings_active || 0} 
                    subtext={`${stats.bookings_need_confirm || 0} butuh konfirmasi`} 
                    loading={loading}
                    icon={ShoppingCart} color="bg-emerald-500" 
                />
                <StatCard 
                    title="Keberangkatan" 
                    value={stats.upcoming_departures || 0} 
                    subtext="30 Hari kedepan" 
                    loading={loading}
                    icon={Plane} color="bg-orange-500" 
                />
                <StatCard 
                    title="Omset Bulan Ini" 
                    value={`Rp ${formatIDR(stats.revenue_month || 0)}`} 
                    loading={loading}
                    icon={DollarSign} color="bg-indigo-600" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Real Data Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-700">5 Transaksi Terakhir</h3>
                            <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                                Lihat Semua <ArrowRight size={14}/>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white text-gray-500 font-medium border-b">
                                    <tr>
                                        <th className="px-6 py-3">Booking ID</th>
                                        <th className="px-6 py-3">Nama Pemesan</th>
                                        <th className="px-6 py-3">Paket</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="4" className="p-6 text-center"><Spinner size={20} /></td></tr>
                                    ) : recentBookings.length === 0 ? (
                                        <tr><td colSpan="4" className="p-6 text-center text-gray-400">Belum ada transaksi</td></tr>
                                    ) : (
                                        recentBookings.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{row.booking_code}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{row.contact_name}</td>
                                                <td className="px-6 py-4 text-gray-600">{row.package_name || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                                        row.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 
                                                        row.payment_status === 'dp' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        {row.payment_status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Chart with Real Data */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-700 mb-4">Tren Pendaftaran ({new Date().getFullYear()})</h3>
                        <div className="h-64 flex items-end justify-between gap-2 px-4 border-b border-gray-100 pb-2">
                            {chartData.length > 0 ? chartData.map((h, i) => {
                                const maxVal = Math.max(...chartData, 10); 
                                const heightPercent = (h / maxVal) * 100;
                                return (
                                    <div key={i} className="w-full bg-blue-50 rounded-t-lg relative group h-full flex items-end">
                                        <div 
                                            className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600 relative" 
                                            style={{ height: `${heightPercent || 2}%` }} 
                                        >
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none z-10 whitespace-nowrap">
                                                {h} Booking
                                            </div>
                                        </div>
                                    </div>
                                )
                            }) : <div className="w-full h-full flex items-center justify-center text-gray-400">Loading chart...</div>}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-gray-400 px-1 font-bold uppercase">
                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span>
                            <span>Jul</span><span>Agu</span><span>Sep</span><span>Okt</span><span>Nov</span><span>Des</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1">Target Sales</h3>
                            <p className="text-indigo-200 text-sm mb-4">Pencapaian penjualan paket Haji Plus.</p>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-bold">72%</span>
                            </div>
                            <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                                <div className="bg-green-400 h-full shadow-[0_0_10px_rgba(74,222,128,0.5)]" style={{ width: '72%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;