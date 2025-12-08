import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { Megaphone, Target, Users, TrendingUp, DollarSign } from 'lucide-react';

const Marketing = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_spend: 0, total_leads: 0, cpl: 0 });

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/marketing');
            const leads = Array.isArray(response) ? response : [];
            setData(leads);

            // Hitung Statistik Sederhana dari Data Client Side
            const totalSpend = leads.reduce((acc, curr) => acc + (parseFloat(curr.ad_cost) || 0), 0);
            const totalLeads = leads.length;
            setStats({
                total_spend: totalSpend,
                total_leads: totalLeads,
                cpl: totalLeads > 0 ? totalSpend / totalLeads : 0
            });

        } catch (error) {
            console.error("Error fetching leads:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    // Header Statistik Custom
    const MarketingStats = () => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><DollarSign size={20} /></div>
                <div>
                    <p className="text-xs text-gray-500">Total Biaya Iklan</p>
                    <p className="font-bold text-gray-800">{formatCurrency(stats.total_spend)}</p>
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={20} /></div>
                <div>
                    <p className="text-xs text-gray-500">Total Leads Masuk</p>
                    <p className="font-bold text-gray-800">{stats.total_leads} Orang</p>
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={20} /></div>
                <div>
                    <p className="text-xs text-gray-500">Cost Per Lead (CPL)</p>
                    <p className="font-bold text-gray-800">{formatCurrency(stats.cpl)}</p>
                </div>
            </div>
        </div>
    );

    const columns = [
        { 
            key: 'campaign_name', 
            label: 'Campaign & Platform',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-900 text-sm">{val || 'Organic'}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Megaphone size={10} /> {row.platform || 'Offline'}
                    </div>
                </div>
            )
        },
        { 
            key: 'customer_name', 
            label: 'Prospek',
            render: (val, row) => (
                <div>
                    <div className="font-medium text-gray-800">{val}</div>
                    <a href={`https://wa.me/${row.phone}`} target="_blank" className="text-xs text-green-600 hover:underline">
                        {row.phone}
                    </a>
                </div>
            )
        },
        { 
            key: 'ad_cost', 
            label: 'Biaya Iklan',
            render: (val) => <span className="font-mono text-xs text-gray-600">{val > 0 ? formatCurrency(val) : '-'}</span>
        },
        { 
            key: 'status', 
            label: 'Pipeline Status',
            render: (val) => {
                const colors = { 
                    new: 'bg-blue-100 text-blue-700', 
                    contacted: 'bg-yellow-100 text-yellow-700', 
                    closing: 'bg-green-100 text-green-700', 
                    lost: 'bg-gray-100 text-gray-500' 
                };
                return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${colors[val] || 'bg-gray-100'}`}>{val}</span>;
            }
        }
    ];

    const formFields = [
        { section: 'Sumber & Campaign' },
        { 
            name: 'platform', 
            label: 'Platform Iklan', 
            type: 'select', 
            options: [
                {value: 'Facebook Ads', label: 'Facebook Ads'}, 
                {value: 'Instagram Ads', label: 'Instagram Ads'}, 
                {value: 'TikTok Ads', label: 'TikTok Ads'}, 
                {value: 'Google Ads', label: 'Google Ads'},
                {value: 'Offline/Event', label: 'Offline / Event'},
                {value: 'Referral', label: 'Referral / Teman'}
            ], 
            width: 'half' 
        },
        { name: 'campaign_name', label: 'Nama Campaign / Materi Iklan', type: 'text', width: 'half', placeholder: 'Cth: Promo Awal Tahun' },
        { name: 'ad_cost', label: 'Biaya Akuisisi (Cost)', type: 'number', width: 'full', help: 'Estimasi biaya yang dikeluarkan untuk mendapatkan lead ini (Opsional).' },

        { section: 'Data Calon Jamaah' },
        { name: 'customer_name', label: 'Nama Prospek', type: 'text', required: true, width: 'half' },
        { name: 'phone', label: 'No. WhatsApp', type: 'text', required: true, width: 'half' },
        { name: 'interest', label: 'Minat Paket', type: 'text', width: 'full', placeholder: 'Cth: Umrah Ramadhan' },

        { section: 'Status Follow Up' },
        { 
            name: 'status', 
            label: 'Tahapan Pipeline', 
            type: 'select', 
            options: [
                {value: 'new', label: 'New Lead (Baru Masuk)'}, 
                {value: 'contacted', label: 'Contacted (Sedang Chat)'}, 
                {value: 'interest', label: 'Interested (Minat Tinggi)'},
                {value: 'closing', label: 'Closing / Won (Daftar)'},
                {value: 'lost', label: 'Lost (Tidak Jadi)'}
            ], 
            defaultValue: 'new',
            width: 'full' 
        },
        { name: 'notes', label: 'Catatan Follow Up', type: 'textarea', width: 'full' }
    ];

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="text-red-500" /> Marketing Intelligence
            </h2>
            
            <MarketingStats />

            <CrudTable
                title="Data Leads & Iklan"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchLeads}
                formFields={formFields}
                searchPlaceholder="Cari nama, campaign, atau status..."
            />
        </div>
    );
};

export default Marketing;