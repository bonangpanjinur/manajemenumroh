import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { formatCurrency } from '../utils/formatters';

export default function Stats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Assuming you have a general stats endpoint, if not, this will fail gracefully
                // You might need to adjust the endpoint based on your backend
                const res = await api.get('/stats'); 
                setStats(res);
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <Layout title="Laporan & Statistik"><Spinner /></Layout>;

    return (
        <Layout title="Laporan & Statistik">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Jamaah" value={stats?.total_jamaah || 0} />
                <StatCard title="Total Booking" value={stats?.total_bookings || 0} />
                <StatCard title="Total Pendapatan" value={formatCurrency(stats?.total_revenue || 0)} />
            </div>
            
            {/* Add charts or more detailed tables here */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ringkasan Bulanan</h3>
                <p className="text-gray-500">Grafik statistik akan ditampilkan di sini.</p>
            </div>
        </Layout>
    );
}

function StatCard({ title, value }) {
    return (
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
        </div>
    );
}