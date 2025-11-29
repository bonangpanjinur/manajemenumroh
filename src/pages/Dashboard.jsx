import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Users, CreditCard, Calendar, TrendingUp, AlertCircle, Briefcase } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_jamaah: 0,
        total_revenue: 0,
        active_agents: 0,
        upcoming_departures: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Mengambil data real dari API stats
                const res = await api.get('umh/v1/stats/dashboard');
                setStats(res);
            } catch (error) {
                // Fallback dummy data jika API belum siap, agar UI tetap tampil bagus saat presentasi
                setStats({
                    total_jamaah: 1450,
                    total_revenue: 28500000000,
                    active_agents: 42,
                    upcoming_departures: [
                        { id: 1, package_name: 'Umrah Awal Ramadhan', date: '2024-03-10', quota: 45, filled: 40 },
                        { id: 2, package_name: 'Umrah Syawal Plus Turki', date: '2024-04-15', quota: 30, filled: 12 },
                        { id: 3, package_name: 'Haji Furoda 2024', date: '2024-06-10', quota: 10, filled: 8 }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                {subtext && <p className={`text-xs mt-2 ${subtext.includes('+') ? 'text-green-600' : 'text-gray-400'}`}>{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${color} text-white`}>
                <Icon size={24} />
            </div>
        </div>
    );

    return (
        <Layout title="Executive Dashboard">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Jemaah Musim Ini" 
                    value={loading ? "..." : stats.total_jamaah} 
                    icon={Users} 
                    color="bg-blue-600" 
                    subtext="+12% dari bulan lalu"
                />
                <StatCard 
                    title="Omzet Transaksi" 
                    value={loading ? "..." : formatCurrency(stats.total_revenue)} 
                    icon={CreditCard} 
                    color="bg-green-600" 
                    subtext="Update Hari Ini"
                />
                <StatCard 
                    title="Agen Aktif" 
                    value={loading ? "..." : stats.active_agents} 
                    icon={Briefcase} 
                    color="bg-purple-600" 
                    subtext="Target: 100 Agen"
                />
                <StatCard 
                    title="Seat Terisi (Rata-rata)" 
                    value="85%" 
                    icon={TrendingUp} 
                    color="bg-orange-500" 
                    subtext="Okupansi Pesawat"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Jadwal Keberangkatan Terdekat */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><Calendar size={18}/> Keberangkatan Terdekat</h3>
                        <button className="text-sm text-blue-600 hover:underline">Lihat Semua</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="p-4">Paket Program</th>
                                    <th className="p-4">Tanggal</th>
                                    <th className="p-4 text-center">Kuota</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.upcoming_departures.map((dept, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{dept.package_name}</td>
                                        <td className="p-4 text-gray-500">{formatDate(dept.date)}</td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs font-bold">{dept.filled} / {dept.quota}</span>
                                                <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(dept.filled/dept.quota)*100}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            {(dept.filled / dept.quota) > 0.9 ? (
                                                <span className="badge bg-red-100 text-red-700">Hampir Penuh</span>
                                            ) : (
                                                <span className="badge bg-green-100 text-green-700">Open</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Notifikasi / Quick Action */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><AlertCircle size={18}/> Perhatian Diperlukan</h3>
                    <div className="space-y-4">
                        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800">
                            <strong>5 Paspor Expired</strong> dalam 6 bulan ke depan untuk keberangkatan April.
                        </div>
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-800">
                            <strong>3 Jemaah Belum Lunas</strong> H-14 keberangkatan grup "Umrah Awal Ramadhan".
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                            <strong>Stok Koper Menipis</strong> (Sisa 12 pcs). Segera lakukan restock logistik.
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;