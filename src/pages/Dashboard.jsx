import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useData } from '../contexts/DataContext'; // Ambil role dari sini
import api from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import Spinner from '../components/Spinner';
import { 
    UsersIcon, 
    CurrencyDollarIcon, 
    BriefcaseIcon, 
    CheckCircleIcon,
    TicketIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    const { role, user } = useData(); // Role: administrator, agent, jamaah
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Endpoint statistik menyesuaikan role di backend
                // Kita bisa pakai endpoint /stats yang sudah ada (pastikan backend-nya juga context aware)
                // Atau untuk Agen kita bisa pakai data dari /agents/me
                
                if (role === 'agent') {
                    const agentData = await api.get('/agents/me');
                    setStats({
                        type: 'agent',
                        total_bookings: agentData.stats.total_bookings,
                        commission: agentData.stats.total_commission,
                        paid: agentData.stats.commission_paid
                    });
                } else if (role === 'administrator') {
                    const res = await api.get('/stats/dashboard'); // Asumsi endpoint ini ada
                    setStats({ type: 'admin', ...res });
                } else {
                    // Jamaah View (Placeholder Data / Future Endpoint)
                    setStats({ type: 'jamaah' });
                }
            } catch (error) {
                console.error("Gagal load stats", error);
            } finally {
                setLoading(false);
            }
        };

        if (role) fetchStats();
    }, [role]);

    if (loading) return <Layout title="Dashboard"><Spinner /></Layout>;

    // --- TAMPILAN ADMIN ---
    if (role === 'administrator') {
        return (
            <Layout title="Dashboard Pusat">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Total Jamaah" value={stats?.total_jamaah || 0} icon={UsersIcon} color="blue" />
                    <StatCard title="Booking Bulan Ini" value={stats?.bookings_month || 0} icon={TicketIcon} color="green" />
                    <StatCard title="Omset Bulan Ini" value={formatCurrency(stats?.revenue_month || 0)} icon={CurrencyDollarIcon} color="purple" />
                    <StatCard title="Keberangkatan Aktif" value={stats?.active_departures || 0} icon={BriefcaseIcon} color="orange" />
                </div>
                {/* Grafik & Tabel Ringkasan bisa ditambahkan di sini */}
            </Layout>
        );
    }

    // --- TAMPILAN AGEN ---
    if (role === 'agent') {
        return (
            <Layout title="Dashboard Mitra/Agen">
                <div className="bg-indigo-600 rounded-lg shadow-lg p-6 mb-6 text-white">
                    <h2 className="text-2xl font-bold">Halo, {user?.display_name}!</h2>
                    <p className="opacity-90">Terus tingkatkan syiar Baitullah bersama kami.</p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <StatCard title="Total Jamaah Anda" value={stats?.total_bookings || 0} icon={UserGroupIcon} color="blue" />
                    <StatCard title="Total Komisi" value={formatCurrency(stats?.commission || 0)} icon={CurrencyDollarIcon} color="green" />
                    <StatCard title="Komisi Dicairkan" value={formatCurrency(stats?.paid || 0)} icon={CheckCircleIcon} color="yellow" />
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Aksi Cepat</h3>
                    <div className="flex gap-4">
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium">
                            + Daftarkan Jamaah Baru
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium">
                            Lihat Katalog Paket
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    // --- TAMPILAN JAMAAH ---
    return (
        <Layout title="Dashboard Jamaah">
            <div className="bg-green-600 rounded-lg shadow-lg p-6 mb-6 text-white">
                <h2 className="text-2xl font-bold">Labbaik Allahumma Labbaik</h2>
                <p className="opacity-90">Semoga persiapan ibadah Umroh Anda dilancarkan.</p>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Status Persiapan Anda</h3>
                <div className="space-y-4">
                    <ProgressItem label="Pendaftaran & Administrasi" status="done" />
                    <ProgressItem label="Pembayaran DP" status="done" />
                    <ProgressItem label="Penyerahan Dokumen Paspor" status="pending" />
                    <ProgressItem label="Pelunasan Biaya" status="waiting" />
                    <ProgressItem label="Visa & Tiket" status="waiting" />
                </div>
            </div>
        </Layout>
    );
}

// Komponen Kecil
function StatCard({ title, value, icon: Icon, color }) {
    const colors = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        yellow: 'bg-yellow-500',
    };
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${colors[color]}`}>
                        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd className="text-lg font-medium text-gray-900">{value}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProgressItem({ label, status }) {
    let statusClass = "bg-gray-200 text-gray-500";
    let statusText = "Menunggu";
    
    if (status === 'done') {
        statusClass = "bg-green-100 text-green-800";
        statusText = "Selesai";
    } else if (status === 'pending') {
        statusClass = "bg-yellow-100 text-yellow-800";
        statusText = "Perlu Tindakan";
    }

    return (
        <div className="flex justify-between items-center border-b pb-2 last:border-0">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                {statusText}
            </span>
        </div>
    );
}