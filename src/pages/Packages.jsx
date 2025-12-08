import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { Package, MapPin, Plane, Hotel, CheckCircle } from 'lucide-react';

const Packages = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    const fetchPackages = useCallback(async () => {
        setLoading(true);
        try {
            const [pkgRes, catRes] = await Promise.all([
                api.get('/packages'),
                api.get('/package-categories')
            ]);
            setData(Array.isArray(pkgRes) ? pkgRes : []);
            setCategories(Array.isArray(catRes) ? catRes : []);
        } catch (error) {
            console.error("Error fetching packages:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    const columns = [
        { 
            key: 'name', 
            label: 'Nama Paket & Durasi',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-900 text-base">{val}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                            <Package size={10} /> {row.duration_days} Hari
                        </span>
                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100 flex items-center gap-1">
                            <Plane size={10} /> {row.airline || 'Maskapai -'}
                        </span>
                    </div>
                </div>
            )
        },
        { 
            key: 'base_price_quad', 
            label: 'Harga (Mulai Dari)', 
            render: (val) => (
                <div>
                    <span className="block font-bold text-green-700 text-sm">{formatCurrency(val)}</span>
                    <span className="text-[10px] text-gray-400">per pax (Quad)</span>
                </div>
            )
        },
        { 
            key: 'hotel_makkah', 
            label: 'Akomodasi',
            render: (_, row) => (
                <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1 text-gray-700">
                        <Hotel size={12} className="text-orange-500" /> 
                        <span className="font-semibold">Makkah:</span> {row.hotel_makkah || '-'}
                    </div>
                    <div className="flex items-center gap-1 text-gray-700">
                        <Hotel size={12} className="text-green-500" /> 
                        <span className="font-semibold">Madinah:</span> {row.hotel_madinah || '-'}
                    </div>
                </div>
            )
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => {
                const map = { active: 'bg-green-100 text-green-800', draft: 'bg-gray-100 text-gray-600', archived: 'bg-red-100 text-red-800' };
                return <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${map[val] || 'bg-gray-100'}`}>{val}</span>;
            }
        }
    ];

    const formFields = [
        { section: 'Informasi Dasar' },
        { name: 'name', label: 'Nama Paket', type: 'text', required: true, width: 'full', placeholder: 'Promo Umrah Syawal 2025' },
        { 
            name: 'category_id', 
            label: 'Kategori', 
            type: 'select', 
            options: categories.map(c => ({ value: c.id, label: c.name })),
            width: 'half' 
        },
        { name: 'duration_days', label: 'Durasi (Hari)', type: 'number', width: 'quarter' },
        { name: 'status', label: 'Status Publikasi', type: 'select', options: [{value: 'active', label: 'Published'}, {value: 'draft', label: 'Draft'}], width: 'quarter' },

        { section: 'Detail Harga (Per Tipe Kamar)' },
        { name: 'base_price_quad', label: 'Harga Quad (Sekamar 4)', type: 'number', required: true, width: 'third', help: 'Harga termurah/dasar' },
        { name: 'base_price_triple', label: 'Harga Triple (Sekamar 3)', type: 'number', width: 'third' },
        { name: 'base_price_double', label: 'Harga Double (Sekamar 2)', type: 'number', width: 'third' },
        { name: 'currency', label: 'Mata Uang', type: 'select', options: [{value: 'IDR', label: 'Rupiah (IDR)'}, {value: 'USD', label: 'Dollar (USD)'}], width: 'full' },

        { section: 'Fasilitas & Akomodasi' },
        { name: 'airline', label: 'Maskapai Penerbangan', type: 'text', width: 'full', placeholder: 'Garuda Indonesia / Saudia' },
        { name: 'hotel_makkah', label: 'Hotel Makkah', type: 'text', width: 'half', placeholder: 'Zamzam Tower...' },
        { name: 'hotel_madinah', label: 'Hotel Madinah', type: 'text', width: 'half', placeholder: 'Rove Hotel...' },
        { name: 'included_features', label: 'Termasuk (Include)', type: 'textarea', width: 'half', placeholder: '- Visa Umrah\n- Makan 3x Sehari' },
        { name: 'excluded_features', label: 'Tidak Termasuk (Exclude)', type: 'textarea', width: 'half', placeholder: '- Pembuatan Paspor\n- Keperluan Pribadi' },
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Katalog Paket Umrah & Haji"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchPackages}
                formFields={formFields}
                searchPlaceholder="Cari paket, hotel, atau harga..."
            />
        </div>
    );
};

export default Packages;