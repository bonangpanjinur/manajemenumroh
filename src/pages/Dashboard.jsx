import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { Users, TrendingUp, Calendar, Package, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import Spinner from '../components/Spinner';

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_jamaah: 0,
        total_revenue: 0,
        active_packages: 0,
        upcoming_departures: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Mengambil data dari endpoint statistik (pastikan backend mendukung /stats atau ambil count manual)
                // Di sini kita simulasi fetch count dari masing-masing endpoint jika endpoint stats khusus belum ada
                const [jamaah, payments, packages] = await Promise.all([
                    api.get('umh/v1/jamaah').catch(() => []),
                    api.get('umh/v1/payments').catch(() => []),
                    api.get('umh/v1/packages').catch(() => [])
                ]);

                // Hitung manual sederhana untuk Client-side (idealnya di backend)
                const revenue = Array.isArray(payments) 
                    ? payments.reduce((acc, curr) => curr.status === 'verified' ? acc + parseFloat(curr.amount) : acc, 0)
                    : 0;

                setStats({
                    total_jamaah: Array.isArray(jamaah) ? jamaah.length : 0,
                    total_revenue: revenue,
                    active_packages: Array.isArray(packages) ? packages.length : 0,
                    upcoming_departures: [] // Perlu endpoint khusus jadwal
                });
            } catch (error) {
                console.error("Gagal memuat dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <Layout><div className="h-screen flex items-center justify-center"><Spinner /></div></Layout>;

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${color} text-white shadow-lg`}>
                    <Icon size={24} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bulan Ini</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <div className="text-2xl font-bold text-gray-800">{value}</div>
            {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
        </div>
    );

    return (
        <Layout title="Dashboard Executive">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Jemaah Terdaftar" 
                    value={stats.total_jamaah} 
                    icon={Users} 
                    color="bg-gradient-to-br from-blue-500 to-blue-600" 
                    subtext="Jemaah aktif dalam database"
                />
                <StatCard 
                    title="Omzet Masuk (Verified)" 
                    value={formatCurrency(stats.total_revenue)} 
                    icon={TrendingUp} 
                    color="bg-gradient-to-br from-green-500 to-green-600" 
                    subtext="Pembayaran terkonfirmasi"
                />
                <StatCard 
                    title="Paket Aktif" 
                    value={stats.active_packages} 
                    icon={Package} 
                    color="bg-gradient-to-br from-purple-500 to-purple-600" 
                    subtext="Katalog paket tersedia"
                />
                <StatCard 
                    title="Jadwal Keberangkatan" 
                    value="0" 
                    icon={Calendar} 
                    color="bg-gradient-to-br from-orange-500 to-orange-600" 
                    subtext="Grup berangkat bulan ini"
                />
            </div>

            {/* Quick Actions & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bagian Kiri: Shortcut / Info */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertCircle size={20} className="text-blue-500"/> Status Sistem
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
                            <div className="bg-blue-200 p-2 rounded-full text-blue-700 mt-1">ℹ️</div>
                            <div>
                                <h4 className="font-bold text-blue-900 text-sm">Selamat Datang di Sistem Manajemen Umrah</h4>
                                <p className="text-sm text-blue-800 mt-1">
                                    Sistem telah diperbarui. Pastikan Anda melengkapi data Master (Hotel & Maskapai) sebelum membuat Paket Perjalanan baru.
                                </p>
                            </div>
                        </div>
                        {stats.active_packages === 0 && (
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 flex items-start gap-3">
                                <div className="text-orange-500 mt-1">⚠️</div>
                                <div>
                                    <h4 className="font-bold text-orange-900 text-sm">Belum Ada Paket</h4>
                                    <p className="text-sm text-orange-800 mt-1">
                                        Segera buat paket perjalanan agar Anda bisa mendaftarkan jemaah.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bagian Kanan: Recent Activity (Placeholder) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Aktivitas Terakhir</h3>
                    <div className="text-center py-10 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        Belum ada log aktivitas tercatat.
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;