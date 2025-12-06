import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Users, CreditCard, Plane, TrendingUp, AlertCircle, Calendar, Wallet } from 'lucide-react';
import Spinner from '../components/Spinner';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const res = await api.get('umh/v1/stats/dashboard');
            if (res.data.success) setStats(res.data.data);
        } catch (e) { console.error("Error loading dashboard data:", e); toast.error("Gagal memuat data dashboard."); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

    if (loading) return <Spinner />;
    if (!stats) return <div className="p-8 text-center text-gray-500">Data tidak tersedia. Cek koneksi API.</div>;

    const StatCard = ({ title, value, sub, icon: Icon, color, alert }) => {
        const colorClasses = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            purple: 'bg-purple-50 text-purple-600 border-purple-200',
            orange: 'bg-orange-50 text-orange-600 border-orange-200',
            red: 'bg-red-50 text-red-600 border-red-200',
        };
    
        return (
            <div className={`bg-white p-6 rounded-xl shadow-sm border ${colorClasses[color]} ${alert ? 'ring-2 ring-red-100' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-lg ${colorClasses[color].replace('border', '').replace('text', 'bg')}`}>
                        <Icon size={24} />
                    </div>
                    {alert && <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>}
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-xs text-gray-400">{sub}</p>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Eksekutif</h1>
                    <p className="text-gray-500 text-sm">Ringkasan performa bisnis bulan **{new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}**.</p>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Total Omset (Bln Ini)" 
                    value={formatIDR(stats.sales_month?.total_revenue)} 
                    sub={`Dari ${stats.sales_month?.total_bookings || 0} booking`}
                    icon={TrendingUp} color="blue" 
                />
                <StatCard 
                    title="Cash Received (Bln Ini)" 
                    value={formatIDR(stats.sales_month?.cash_received)} 
                    sub="Dana yang sudah terverifikasi masuk"
                    icon={CreditCard} color="green" 
                />
                <StatCard 
                    title="Dana Agen (Liability)" 
                    value={formatIDR(stats.total_wallet_balance)} 
                    sub="Total Saldo Deposit Agen"
                    icon={Wallet} color="purple" 
                />
                <StatCard 
                    title="Verifikasi Pembayaran" 
                    value={stats.pending_payments} 
                    sub="Bukti Pembayaran Pending"
                    icon={AlertCircle} color={stats.pending_payments > 0 ? "red" : "orange"} 
                    alert={stats.pending_payments > 0}
                />
            </div>

            {/* UPCOMING DEPARTURES */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <Plane className="text-blue-500" size={20}/> Jadwal Terdekat
                </h3>
                <div className="space-y-4">
                    {stats.upcoming_departures?.length === 0 ? (
                        <p className="text-gray-400 text-sm italic">Tidak ada jadwal dalam waktu dekat.</p>
                    ) : (
                        stats.upcoming_departures.map(d => {
                            const filledSeats = d.seats_filled || (d.quota - d.available_seats);
                            const percentFilled = (filledSeats / d.quota) * 100;
                            return (
                                <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 text-blue-600 font-bold px-3 py-2 rounded text-center min-w-[60px] flex flex-col items-center">
                                            <div className="text-xs">{new Date(d.departure_date).toLocaleString('id-ID', { month: 'short' }).toUpperCase()}</div>
                                            <div className="text-lg">{new Date(d.departure_date).getDate()}</div>
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">{d.package_name}</div>
                                            <div className="text-xs text-gray-500">{d.flight_number_depart} • TL: {d.tour_leader_name || '-'}</div>
                                        </div>
                                    </div>
                                    <div className="w-32 text-right">
                                        <div className="text-xs text-gray-400 mb-1">Terisi: {filledSeats} / {d.quota}</div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${percentFilled > 80 ? 'bg-red-500' : 'bg-green-500'}`} 
                                                style={{width: `${percentFilled}%`}}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;