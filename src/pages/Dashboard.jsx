import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { Users, DollarSign, Calendar, Shield, TrendingUp, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold mt-1 text-gray-800">{value}</h3>
      {subtext && <p className={`text-xs mt-2 ${color.text}`}>{subtext}</p>}
    </div>
    <div className={`p-3 rounded-full ${color.bg}`}>
      <Icon className={`w-6 h-6 ${color.icon}`} />
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_savings: 0,
    active_bookings: 0,
    private_requests: 0,
    upcoming_departures: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Menggunakan endpoint stats yang sudah ada atau simulasi hitungan
        const statData = await api.get('/stats/summary'); // Asumsi endpoint ini ada di api-stats.php
        const reqData = await api.get('/private/requests'); // Ambil request private terbaru
        
        if (statData) setStats(statData);
        // Jika endpoint stats belum siap, kita bisa simulasi atau biarkan 0 dulu
        
        if (reqData && Array.isArray(reqData)) {
          setRecentRequests(reqData.slice(0, 5)); // Ambil 5 terbaru
        }
      } catch (e) {
        console.error("Dashboard load failed", e);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Ringkasan aktivitas travel hari ini.</p>
        </div>
        <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded shadow-sm">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Booking Aktif" 
          value={stats.active_bookings || 0} 
          subtext="Jamaah siap berangkat"
          icon={Users} 
          color={{ bg: 'bg-blue-100', icon: 'text-blue-600', text: 'text-blue-600' }} 
        />
        <StatCard 
          title="Dana Tabungan" 
          value={formatCurrency(stats.total_savings || 0)} 
          subtext="Total aset tabungan jamaah"
          icon={TrendingUp} 
          color={{ bg: 'bg-green-100', icon: 'text-green-600', text: 'text-green-600' }} 
        />
        <StatCard 
          title="Request Private Baru" 
          value={recentRequests.filter(r => r.status === 'new').length} 
          subtext="Butuh follow up segera"
          icon={Shield} 
          color={{ bg: 'bg-purple-100', icon: 'text-purple-600', text: 'text-purple-600' }} 
        />
        <StatCard 
          title="Keberangkatan Bulan Ini" 
          value={stats.upcoming_departures || 0} 
          subtext="Grup terjadwal"
          icon={Calendar} 
          color={{ bg: 'bg-orange-100', icon: 'text-orange-600', text: 'text-orange-600' }} 
        />
      </div>

      {/* --- RECENT ACTIVITY SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Private Request Inbox */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Request Private Umrah Terbaru</h3>
            <button className="text-sm text-blue-600 hover:underline">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Nama Kontak</th>
                  <th className="px-4 py-2">Pax</th>
                  <th className="px-4 py-2">Tanggal</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.length > 0 ? recentRequests.map((req) => (
                  <tr key={req.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{req.contact_name}</td>
                    <td className="px-4 py-3">{req.pax_count} Org</td>
                    <td className="px-4 py-3">{req.travel_date_start}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        req.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-4 text-center text-gray-400">Belum ada request baru</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Aksi Cepat</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-lg flex items-center gap-3 transition-colors group">
              <div className="bg-blue-100 p-2 rounded-full group-hover:bg-blue-200">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700">Daftarkan Jamaah Baru</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-green-50 rounded-lg flex items-center gap-3 transition-colors group">
              <div className="bg-green-100 p-2 rounded-full group-hover:bg-green-200">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-medium text-gray-700">Catat Pembayaran</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-purple-50 rounded-lg flex items-center gap-3 transition-colors group">
              <div className="bg-purple-100 p-2 rounded-full group-hover:bg-purple-200">
                <Shield className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium text-gray-700">Buat Penawaran Private</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Status Sistem</h4>
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
              <AlertCircle className="w-4 h-4" />
              <span>Database v6.1.0 (Latest)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;