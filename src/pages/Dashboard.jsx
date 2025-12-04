import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { 
    Users, Briefcase, DollarSign, Calendar, TrendingUp, 
    ArrowRight, Loader 
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Mengambil data dari endpoint API Stats yang baru
                const res = await api.get('umh/v1/stats/dashboard');
                // Handle response jika dibungkus property 'data' atau langsung
                const data = res.data || res;
                if (res.success || data) {
                    setStats(data);
                }
            } catch (err) {
                console.error("Gagal memuat statistik dashboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <Layout title="Dashboard">
                <div className="h-screen flex items-center justify-center">
                    <Loader className="animate-spin text-blue-600" size={40} />
                </div>
            </Layout>
        );
    }

    if (!stats || !stats.cards) return (
        <Layout title="Dashboard">
            <div className="p-8 text-center text-gray-500">
                Data dashboard tidak tersedia atau gagal dimuat.
            </div>
        </Layout>
    );

    // Konfigurasi Data Grafik
    const chartData = {
        labels: stats.chart ? Object.keys(stats.chart) : [],
        datasets: [
            {
                label: 'Pemasukan (Verified)',
                data: stats.chart ? Object.values(stats.chart).map(d => d.income || 0) : [],
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
            },
            {
                label: 'Pengeluaran',
                data: stats.chart ? Object.values(stats.chart).map(d => d.expense || 0) : [],
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Arus Kas 6 Bulan Terakhir' },
        },
    };

    return (
        <Layout title="Dashboard & Ringkasan">
            {/* KARTU STATISTIK UTAMA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Total Jemaah" 
                    value={stats.cards.total_jamaah || 0} 
                    icon={Users} 
                    color="blue" 
                    desc="Terdaftar di database"
                />
                <StatCard 
                    title="Booking Aktif" 
                    value={stats.cards.active_bookings || 0} 
                    icon={Briefcase} 
                    color="purple" 
                    desc="Menunggu keberangkatan"
                />
                <StatCard 
                    title="Omzet Bulan Ini" 
                    value={formatCurrency(stats.cards.monthly_revenue || 0)} 
                    icon={DollarSign} 
                    color="green" 
                    desc="Pemasukan terverifikasi"
                />
                <StatCard 
                    title="Jadwal Terdekat" 
                    value={stats.cards.next_departure ? formatDate(stats.cards.next_departure.departure_date) : '-'} 
                    icon={Calendar} 
                    color="orange" 
                    desc={stats.cards.next_departure ? `${stats.cards.next_departure.name} (Sisa: ${(stats.cards.next_departure.seat_quota || 0) - (stats.cards.next_departure.seat_booked || 0)} Seat)` : 'Belum ada jadwal'}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* GRAFIK KEUANGAN */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <Bar options={chartOptions} data={chartData} />
                </div>

                {/* QUICK ACTIONS / SHORTCUTS */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-600"/> Akses Cepat
                    </h3>
                    <div className="space-y-3">
                        <ShortcutBtn to="/bookings" label="Buat Booking Baru" color="bg-blue-50 text-blue-700 hover:bg-blue-100" />
                        <ShortcutBtn to="/jamaah" label="Input Data Jemaah" color="bg-green-50 text-green-700 hover:bg-green-100" />
                        <ShortcutBtn to="/finance" label="Validasi Pembayaran" color="bg-orange-50 text-orange-700 hover:bg-orange-100" />
                        <ShortcutBtn to="/marketing" label="Lihat Prospek (Leads)" color="bg-purple-50 text-purple-700 hover:bg-purple-100" />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

// Komponen Kecil untuk Card
const StatCard = ({ title, value, icon: Icon, color, desc }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-500 text-sm font-medium">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[color] || 'bg-gray-100'}`}>
                    <Icon size={24} />
                </div>
            </div>
            <p className="text-xs text-gray-400">{desc}</p>
        </div>
    );
};

const ShortcutBtn = ({ to, label, color }) => (
    <a href={`#${to}`} className={`flex items-center justify-between w-full p-3 rounded-lg transition ${color}`}>
        <span className="font-medium text-sm">{label}</span>
        <ArrowRight size={16} />
    </a>
);

export default Dashboard;