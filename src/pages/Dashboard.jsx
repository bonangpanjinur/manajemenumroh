import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { Users, DollarSign, Briefcase, AlertCircle, Calendar } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    useEffect(() => {
        api.get('umh/v1/dashboard/stats').then(res => setStats(res.data)).catch(console.error);
    }, []);

    if (!stats) return <Spinner />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Executive Dashboard</h1>
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded shadow flex items-center gap-4 border-l-4 border-blue-500">
                    <Users className="text-blue-500"/> <div><p className="text-sm text-gray-500">Total Jemaah</p><h3 className="text-xl font-bold">{stats.counts.jamaah}</h3></div>
                </div>
                <div className="bg-white p-4 rounded shadow flex items-center gap-4 border-l-4 border-green-500">
                    <DollarSign className="text-green-500"/> <div><p className="text-sm text-gray-500">Omset Bulan Ini</p><h3 className="text-xl font-bold">{new Intl.NumberFormat('id', {notation:'compact'}).format(stats.counts.revenue)}</h3></div>
                </div>
                <div className="bg-white p-4 rounded shadow flex items-center gap-4 border-l-4 border-purple-500">
                    <Briefcase className="text-purple-500"/> <div><p className="text-sm text-gray-500">Mitra Agen</p><h3 className="text-xl font-bold">{stats.counts.agents}</h3></div>
                </div>
                <div className="bg-white p-4 rounded shadow flex items-center gap-4 border-l-4 border-orange-500">
                    <AlertCircle className="text-orange-500"/> <div><p className="text-sm text-gray-500">Leads Baru</p><h3 className="text-xl font-bold">{stats.counts.leads}</h3></div>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded shadow">
                <h3 className="font-bold mb-4 flex gap-2"><Calendar/> Jadwal Keberangkatan Terdekat</h3>
                {stats.upcoming.map((u, i) => (
                    <div key={i} className="flex justify-between border-b py-2">
                        <div><div className="font-bold">{u.package_name}</div><div className="text-xs text-gray-500">{u.flight_number_depart}</div></div>
                        <div className="text-right"><div className="font-bold text-blue-600">{u.departure_date}</div><div className="text-xs">Sisa Seat: {u.available_seats}</div></div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Dashboard;