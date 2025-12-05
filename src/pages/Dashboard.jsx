import React from 'react';
import { Users, ShoppingCart, Plane, DollarSign, ArrowRight, Clock } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            {subtext && <p className={`text-xs mt-1 ${subtext.includes('+') ? 'text-green-600' : 'text-gray-400'}`}>{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

const Dashboard = () => {
    // Data dummy untuk tampilan awal (bisa diganti data API nantinya)
    const recentBookings = [
        { id: 'BK-001', name: 'Ahmad Dahlan', package: 'Umroh Reguler', date: '05 Des 2025', status: 'Paid' },
        { id: 'BK-002', name: 'Siti Aminah', package: 'Haji Plus', date: '04 Des 2025', status: 'DP' },
        { id: 'BK-003', name: 'Budi Santoso', package: 'Wisata Halal', date: '04 Des 2025', status: 'Unpaid' },
    ];

    return (
        <div className="space-y-8">
            {/* Header Welcome */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                    <p className="text-gray-500">Selamat datang kembali di panel manajemen travel.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm flex items-center gap-2 text-gray-600">
                    <Clock size={16}/> {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Jamaah" 
                    value="1,240" 
                    subtext="+12 bulan ini" 
                    icon={Users} 
                    color="bg-blue-500" 
                />
                <StatCard 
                    title="Booking Aktif" 
                    value="45" 
                    subtext="8 perlu konfirmasi" 
                    icon={ShoppingCart} 
                    color="bg-emerald-500" 
                />
                <StatCard 
                    title="Jadwal Keberangkatan" 
                    value="3" 
                    subtext="Dalam 30 hari kedepan" 
                    icon={Plane} 
                    color="bg-orange-500" 
                />
                <StatCard 
                    title="Omset Bulan Ini" 
                    value="Rp 850jt" 
                    subtext="+5% dari target" 
                    icon={DollarSign} 
                    color="bg-indigo-500" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Recent Activity / Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Booking Terbaru</h3>
                            <button className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                                Lihat Semua <ArrowRight size={14}/>
                            </button>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-3">Nama Jamaah</th>
                                    <th className="px-6 py-3">Paket</th>
                                    <th className="px-6 py-3">Tanggal</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentBookings.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{row.name} <span className="block text-xs text-gray-400 font-normal">{row.id}</span></td>
                                        <td className="px-6 py-4 text-gray-600">{row.package}</td>
                                        <td className="px-6 py-4 text-gray-500">{row.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                row.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                                                row.status === 'DP' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Chart Section Placeholder */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-700 mb-4">Statistik Pendaftaran (Tahun 2025)</h3>
                        <div className="h-64 flex items-end justify-between gap-2 px-4">
                            {[40, 65, 30, 80, 55, 90, 45, 70, 60, 85, 50, 75].map((h, i) => (
                                <div key={i} className="w-full bg-blue-100 rounded-t-lg relative group">
                                    <div 
                                        className="absolute bottom-0 w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600" 
                                        style={{ height: `${h}%` }}
                                    ></div>
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none">
                                        {h} Jamaah
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400 px-4">
                            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span>
                            <span>Jul</span><span>Agu</span><span>Sep</span><span>Okt</span><span>Nov</span><span>Des</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Target Bulanan</h3>
                        <p className="text-indigo-100 text-sm mb-4">Pencapaian target penjualan paket bulan ini.</p>
                        <div className="flex items-end gap-2 mb-1">
                            <span className="text-4xl font-bold">85%</span>
                            <span className="text-indigo-200 text-sm mb-1">Tercapai</span>
                        </div>
                        <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                            <div className="bg-white h-full" style={{ width: '85%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h3 className="font-bold text-gray-700 mb-4">Jadwal Terdekat</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start pb-3 border-b border-gray-50">
                                <div className="bg-red-100 text-red-600 px-2 py-1 rounded text-center min-w-[50px]">
                                    <span className="block text-xs font-bold">DES</span>
                                    <span className="block text-lg font-bold">12</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">Manasik Akbar</h4>
                                    <p className="text-xs text-gray-500">Masjid Agung Al-Azhar</p>
                                    <span className="text-xs text-blue-600 mt-1 block">08:00 - 12:00 WIB</span>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-center min-w-[50px]">
                                    <span className="block text-xs font-bold">DES</span>
                                    <span className="block text-lg font-bold">15</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">Keberangkatan Grup A</h4>
                                    <p className="text-xs text-gray-500">Terminal 3 Soekarno Hatta</p>
                                    <span className="text-xs text-green-600 mt-1 block">Flight SV-819</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;