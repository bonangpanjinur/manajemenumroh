import React, { useState, useEffect } from 'react';
import useCRUD from '../hooks/useCRUD';
import Spinner from '../components/Spinner';

// Komponen Card Statistik Sederhana
const StatCard = ({ title, value, subtext, color, icon }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`rounded-md p-3 ${color} bg-opacity-10`}>
             {/* Render Icon based on props */}
             {icon}
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
            </dd>
            {subtext && <dd className="text-xs text-gray-400 mt-1">{subtext}</dd>}
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  // Kita bisa menggunakan hook useCRUD untuk mengambil data ringkasan
  // Asumsi: endpoint '/stats' mengembalikan json berisi summary
  const { data: stats, loading, fetchData } = useCRUD('/stats', {
    total_jamaah: 0,
    monthly_income: 0,
    upcoming_departures: [],
    pending_payments: 0,
    recent_bookings: []
  });

  useEffect(() => {
    // Override fetch default untuk hit endpoint stats
    // Di real app, pastikan backend mendukung endpoint ini
    // fetchData(); 
    
    // MOCK DATA sementara agar UI terlihat (karena backend belum tentu siap)
    // Hapus bagian ini jika backend sudah ready
  }, []);

  // Mock data untuk visualisasi sementara
  const mockStats = {
    total_jamaah: 1240,
    active_packages: 8,
    pending_tasks: 12,
    monthly_revenue: '1.2M',
    upcoming_departures: [
      { id: 1, name: 'Paket Awal Ramadhan', date: '2024-03-10', seats: '45/50', status: 'Finalizing' },
      { id: 2, name: 'Paket Syawal Plus Turki', date: '2024-04-15', seats: '20/40', status: 'Open' },
    ],
    recent_activities: [
      { id: 1, text: 'Budi Santoso melunasi pembayaran', time: '10 menit lalu', type: 'payment' },
      { id: 2, text: 'Booking baru: Keluarga H. Ahmad (4 Pax)', time: '1 jam lalu', type: 'booking' },
      { id: 3, text: 'Manifest keberangkatan 10 Mar dicetak', time: '3 jam lalu', type: 'system' },
    ]
  };

  const displayData = loading ? {} : mockStats; // Gunakan stats dari API jika sudah ada

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Update Terakhir: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* --- Section 1: Statistik Utama --- */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Jamaah (YTD)" 
          value={displayData.total_jamaah} 
          subtext="↑ 12% dari tahun lalu"
          color="bg-blue-500 text-blue-600"
          icon={
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard 
          title="Pendapatan Bulan Ini" 
          value={`Rp ${displayData.monthly_revenue}`} 
          subtext="Estimasi cash in"
          color="bg-green-500 text-green-600"
          icon={
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard 
          title="Paket Aktif" 
          value={displayData.active_packages} 
          subtext="Open for booking"
          color="bg-purple-500 text-purple-600"
          icon={
            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatCard 
          title="Pending Task" 
          value={displayData.pending_tasks} 
          subtext="Butuh tindakan segera"
          color="bg-red-500 text-red-600"
          icon={
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- Section 2: Keberangkatan Terdekat (Tabel Widget) --- */}
        <div className="bg-white shadow rounded-lg p-5 lg:col-span-2 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Keberangkatan Terdekat</h3>
            <button className="text-sm text-blue-600 hover:text-blue-500">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seat</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayData.upcoming_departures.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-3 py-3 text-sm text-gray-500">{item.date}</td>
                    <td className="px-3 py-3 text-sm text-gray-500">{item.seats}</td>
                    <td className="px-3 py-3 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'Finalizing' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Section 3: Aktivitas Terbaru (Timeline Widget) --- */}
        <div className="bg-white shadow rounded-lg p-5 border border-gray-100">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Aktivitas Terbaru</h3>
          <ul className="space-y-4">
            {displayData.recent_activities.map((activity) => (
              <li key={activity.id} className="relative flex gap-x-4">
                <div className={`absolute left-0 top-0 flex w-6 justify-center -bottom-6`}>
                  <div className="w-px bg-gray-200"></div>
                </div>
                <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                  {activity.type === 'payment' && <div className="h-2 w-2 rounded-full bg-green-600 ring-1 ring-green-300"></div>}
                  {activity.type === 'booking' && <div className="h-2 w-2 rounded-full bg-blue-600 ring-1 ring-blue-300"></div>}
                  {activity.type === 'system' && <div className="h-2 w-2 rounded-full bg-gray-400 ring-1 ring-gray-300"></div>}
                </div>
                <div className="flex-auto py-0.5 text-xs leading-5 text-gray-500">
                  <span className="font-medium text-gray-900 block">{activity.text}</span>
                  <span className="text-gray-400">{activity.time}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <button className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Lihat Log Lengkap
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;