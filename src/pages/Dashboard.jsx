import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { Users, DollarSign, Briefcase, TrendingUp, Calendar, FileText } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await api.get('umh/v1/dashboard/stats');
                if (res.data.success) setData(res.data);
            } catch (error) {
                console.error("Gagal load stats", error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) return <Spinner />;
    if (!data) return <div className="p-8 text-center">Gagal memuat data dashboard.</div>;

    // Config Grafik Chart.js
    const chartData = {
        labels: data.chart.labels,
        datasets: [
            {
                label: 'Pemasukan',
                data: data.chart.income,
                borderColor: '#10B981', // Emerald 500
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            },
            {
                label: 'Pengeluaran',
                data: data.chart.expense,
                borderColor: '#EF4444', // Red 500
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            tooltip: { 
                mode: 'index', 
                intersect: false,
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': Rp ' + new Intl.NumberFormat('id-ID').format(context.raw);
                    }
                }
            },
        },
        scales: {
            y: { beginAtZero: true, ticks: { callback: (val) => (val/1000000) + 'jt' } }
        },
        maintainAspectRatio: false
    };

    const StatCard = ({ title, value, icon: Icon, color, subValue }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500">Ringkasan performa bisnis Anda hari ini.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-gray-600">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Jemaah" value={data.counts.jamaah} icon={Users} color="bg-blue-600 text-blue-600" subValue="Aktif & Alumni" />
                <StatCard title="Leads Baru" value={data.counts.leads} icon={TrendingUp} color="bg-orange-500 text-orange-500" subValue="Perlu difollow-up" />
                <StatCard title="Booking Pending" value={data.counts.bookings_pending} icon={FileText} color="bg-yellow-500 text-yellow-500" subValue="Menunggu Pembayaran" />
                <StatCard title="Keberangkatan" value={data.counts.departures_next_month} icon={Calendar} color="bg-purple-500 text-purple-500" subValue="Bulan Depan" />
            </div>

            {/* Main Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800 text-lg">Arus Kas & Transaksi</h3>
                    <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                        <option>6 Bulan Terakhir</option>
                        <option>Tahun Ini</option>
                    </select>
                </div>
                <div className="h-80 w-full">
                    <Line options={options} data={chartData} />
                </div>
            </div>

            {/* Bottom Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Recent Bookings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-700">Booking Terbaru</h3>
                        <button className="text-xs text-blue-600 hover:underline">Lihat Semua</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Kode</th>
                                    <th className="px-4 py-3 font-medium">Jemaah</th>
                                    <th className="px-4 py-3 font-medium">Total</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.recent?.bookings?.length > 0 ? (
                                    data.recent.bookings.map((b, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-xs">{b.booking_code}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-800">{b.contact_name}</div>
                                                <div className="text-xs text-gray-500">{b.package_name}</div>
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                Rp {new Intl.NumberFormat('id-ID').format(b.total_price)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold 
                                                    ${b.status==='paid'?'bg-green-100 text-green-700':
                                                    b.status==='pending'?'bg-yellow-100 text-yellow-700':'bg-gray-100 text-gray-600'}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="4" className="p-4 text-center text-gray-400">Belum ada booking.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 2. Upcoming Departures */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-700">Jadwal Keberangkatan Terdekat</h3>
                        <button className="text-xs text-blue-600 hover:underline">Lihat Jadwal</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Tanggal</th>
                                    <th className="px-4 py-3 font-medium">Paket</th>
                                    <th className="px-4 py-3 font-medium">Seat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.recent?.departures?.length > 0 ? (
                                    data.recent.departures.map((d, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-blue-600">
                                                {new Date(d.departure_date).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'2-digit'})}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">{d.package_name}</td>
                                            <td className="px-4 py-3">
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((d.quota - d.available_seats)/d.quota)*100}%` }}></div>
                                                </div>
                                                <div className="text-xs text-gray-500">Sisa {d.available_seats} / {d.quota}</div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3" className="p-4 text-center text-gray-400">Tidak ada jadwal dekat.</td></tr>
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