import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api'; // PERBAIKAN: Menggunakan named import { api }

const Logistics = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogistics = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/logistics/items');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching logistics:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogistics();
    }, [fetchLogistics]);

    const columns = [
        { 
            key: 'item_name', 
            label: 'Nama Barang',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-800">{val}</div>
                    <div className="text-xs text-gray-500">SKU: {row.sku || '-'}</div>
                </div>
            )
        },
        { key: 'category', label: 'Kategori', render: (val) => <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs">{val}</span> },
        { 
            key: 'stock_quantity', 
            label: 'Stok', 
            render: (val, row) => (
                <div className={`font-mono font-bold ${val < 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {val} {row.unit || 'Pcs'}
                </div>
            )
        },
        { key: 'location', label: 'Lokasi Gudang' }
    ];

    const formFields = [
        { section: 'Detail Barang' },
        { name: 'item_name', label: 'Nama Perlengkapan', type: 'text', required: true, width: 'half' },
        { name: 'sku', label: 'Kode SKU', type: 'text', width: 'half' },
        { 
            name: 'category', 
            label: 'Kategori', 
            type: 'select', 
            options: [
                {value: 'Koper', label: 'Koper & Tas'}, 
                {value: 'Seragam', label: 'Kain & Seragam'}, 
                {value: 'Buku', label: 'Buku & Panduan'},
                {value: 'Aksesoris', label: 'ID Card & Aksesoris'}
            ], 
            width: 'half' 
        },
        
        { section: 'Inventory' },
        { name: 'stock_quantity', label: 'Jumlah Stok Awal', type: 'number', required: true, width: 'third' },
        { name: 'unit', label: 'Satuan', type: 'text', placeholder: 'Pcs/Rim/Box', width: 'third' },
        { name: 'min_stock', label: 'Stok Minimum (Alert)', type: 'number', width: 'third' },
        { name: 'location', label: 'Lokasi Penyimpanan', type: 'text', width: 'full' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Inventaris Logistik"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchLogistics}
                formFields={formFields}
                searchPlaceholder="Cari barang..."
            />
        </div>
    );
};

export default Logistics;