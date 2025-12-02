import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

const Trash = () => {
    const [activeType, setActiveType] = useState('jamaah');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Definisi tipe data yang bisa di-restore
    const types = [
        { id: 'jamaah', label: 'Data Jemaah', endpoint: 'umh/v1/jamaah' },
        { id: 'marketing/leads', label: 'Leads Marketing', endpoint: 'umh/v1/marketing/leads' },
        { id: 'marketing/campaigns', label: 'Kampanye Iklan', endpoint: 'umh/v1/marketing/campaigns' },
        { id: 'hr', label: 'Karyawan', endpoint: 'umh/v1/hr' },
    ];

    const fetchTrash = async () => {
        setLoading(true);
        try {
            const typeConfig = types.find(t => t.id === activeType);
            // Request dengan status='trash'
            const res = await api.get(typeConfig.endpoint, { params: { status: 'trash', per_page: 100 } });
            setData(Array.isArray(res) ? res : res.items || []);
        } catch (error) {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, [activeType]);

    const handleRestore = async (id) => {
        if(!window.confirm("Kembalikan data ini?")) return;
        try {
            const typeConfig = types.find(t => t.id === activeType);
            await api.post(`${typeConfig.endpoint}/restore/${id}`, {});
            toast.success("Data berhasil dipulihkan");
            fetchTrash();
        } catch (e) {
            toast.error("Gagal memulihkan data");
        }
    };

    return (
        <Layout title="Tong Sampah" subtitle="Data yang dihapus sementara">
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                {types.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveType(t.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            activeType === t.id 
                            ? 'bg-red-600 text-white shadow-md' 
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-red-50'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-10"><Spinner text="Memuat sampah..." /></div>
                ) : data.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center text-gray-400">
                        <Trash2 size={48} className="mb-3 opacity-20"/>
                        <p>Tidak ada data sampah di kategori ini.</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama / Identitas</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((item, idx) => (
                                <tr key={item.id || idx} className="hover:bg-red-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {item.full_name || item.name || item.title || `ID #${item.id}`}
                                        <div className="text-xs text-gray-500">{item.email || item.phone || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleRestore(item.id)}
                                            className="text-green-600 hover:text-green-900 flex items-center gap-1 ml-auto bg-white border border-green-200 px-3 py-1 rounded hover:bg-green-50"
                                        >
                                            <RefreshCw size={14}/> Pulihkan
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Layout>
    );
};

export default Trash;