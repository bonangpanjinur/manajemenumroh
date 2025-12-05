import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Briefcase, Calendar, DollarSign, TrendingUp, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({ bookings: 0, jamaah: 0, departures: 0, revenue: 0 });
    const [recents, setRecents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await api.get('umh/v1/stats/dashboard');
                if (res.data.success) {
                    setStats(res.data.counts);
                    setRecents(res.data.recent_bookings);
                }
            } catch (e) {
                console.error("Gagal load dashboard", e);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const formatMoney = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n || 0);

    if (loading) return <div className="p-10 text-center">Memuat Dashboard...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500">Ringkasan aktivitas travel hari ini.</p>
            </div>

            {/* Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Booking" value={stats.bookings} icon={Briefcase} color="bg-blue-100 text-blue-600" />
                <StatCard title="Jemaah Aktif" value={stats.jamaah} icon={Users} color="bg-purple-100 text-purple-600" />
                <StatCard title="Jadwal Open" value={stats.departures} icon={Calendar} color="bg-orange-100 text-orange-600" />
                <StatCard title="Profit Bersih" value={formatMoney(stats.revenue)} icon={DollarSign} color="bg-green-100 text-green-600" />
            </div>

            {/* Konten Bawah */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tabel Booking Terakhir */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-5 border-b flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><Activity size={18}/> Booking Terbaru</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="p-4">Kode</th>
                                    <th className="p-4">Nama Kontak</th>
                                    <th className="p-4">Pax</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recents.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-4 font-mono text-blue-600">{row.booking_code}</td>
                                        <td className="p-4 font-medium">{row.contact_name}</td>
                                        <td className="p-4">{row.total_pax}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                                                row.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-500">{new Date(row.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {recents.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-gray-400">Belum ada data booking.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Widget Info (Bisa diisi Pengumuman/Task) */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg text-white p-6">
                    <h3 className="font-bold text-xl mb-2">Selamat Datang!</h3>
                    <p className="opacity-90 mb-6 text-sm">Kelola travel umroh Anda dengan mudah dan efisien. Cek menu di samping untuk mulai bekerja.</p>
                    <div className="space-y-3">
                        <div className="bg-white/10 p-3 rounded flex items-center gap-3">
                            <TrendingUp size={20}/>
                            <div>
                                <div className="font-bold">Target Bulan Ini</div>
                                <div className="text-xs opacity-75">Progress 75% tercapai</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;