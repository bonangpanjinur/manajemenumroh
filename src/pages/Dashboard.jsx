import React from 'react';
import useCRUD from '../hooks/useCRUD.js';
import Spinner from '../components/Spinner.jsx';

const StatCard = ({ title, value, subtext, color, icon }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`rounded-md p-3 ${color} bg-opacity-10`}>
             {icon}
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd>
              <div className="text-2xl font-semibold text-gray-900">{value || 0}</div>
            </dd>
            {subtext && <dd className="text-xs text-gray-400 mt-1">{subtext}</dd>}
          </dl>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  // Gunakan object kosong {} sebagai default, bukan null
  const { data, loading, error } = useCRUD('/stats/dashboard', {});
  
  const defaultStats = {
      cards: { total_jamaah: 0, active_bookings: 0, monthly_revenue: 0, next_departure: null },
      chart: [],
      upcoming_departures: [],
      recent_activities: []
  };

  // Merge defensive: gunakan defaultStats jika data kosong/error
  const displayData = (data && data.cards) ? data : defaultStats;

  if (loading) return <Spinner text="Memuat Ringkasan..." />;
  
  if (error) {
      return (
          <div className="p-6 bg-red-50 text-red-700 rounded-lg border border-red-200">
              <h3 className="font-bold">Koneksi Database Terputus</h3>
              <p className="text-sm mt-1">{error}</p>
              <p className="text-xs mt-2 bg-white p-2 rounded border border-red-100 inline-block">
                 Tips: Nonaktifkan & Aktifkan plugin untuk memperbaiki struktur tabel.
              </p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Jamaah" 
          value={displayData.cards?.total_jamaah} 
          subtext="Terdaftar"
          color="bg-blue-500 text-blue-600"
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
        />
        <StatCard 
          title="Booking Aktif" 
          value={displayData.cards?.active_bookings} 
          subtext="Keberangkatan"
          color="bg-purple-500 text-purple-600"
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
        <StatCard 
          title="Revenue (Bulan Ini)" 
          value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumSignificantDigits: 3 }).format(displayData.cards?.monthly_revenue || 0)} 
          subtext="Verified"
          color="bg-green-500 text-green-600"
          icon={<svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>
      
      {/* Fallback tampilan aman jika data kosong */}
      {displayData.cards?.next_departure ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
              <div className="flex">
                  <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                          <span className="font-bold">Next Departure: </span>
                          {displayData.cards.next_departure.name} ({displayData.cards.next_departure.departure_date})
                      </p>
                  </div>
              </div>
          </div>
      ) : null}
    </div>
  );
};

export default Dashboard;