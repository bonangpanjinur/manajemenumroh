import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { Archive, AlertTriangle, CheckCircle } from 'lucide-react';

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
                    <div className="font-bold text-gray-900">{val}</div>
                    <div className="text-xs text-gray-500">SKU: {row.sku || '-'}</div>
                </div>
            )
        },
        { 
            key: 'category', 
            label: 'Kategori',
            render: (val) => <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{val}</span>
        },
        { 
            key: 'stock_quantity', 
            label: 'Stok Gudang',
            render: (val, row) => {
                const min = row.min_stock || 10;
                let statusColor = 'text-green-600';
                let Icon = CheckCircle;
                
                if (val <= 0) { statusColor = 'text-red-600'; Icon = AlertTriangle; }
                else if (val <= min) { statusColor = 'text-yellow-600'; Icon = AlertTriangle; }

                return (
                    <div className={`flex items-center gap-2 font-bold ${statusColor}`}>
                        <Icon size={16} />
                        {val} {row.unit}
                    </div>
                );
            }
        },
        { 
            key: 'location', 
            label: 'Lokasi',
            render: (val) => <span className="text-xs font-mono text-blue-600 border border-blue-200 px-1 rounded">{val || 'Gudang Utama'}</span>
        }
    ];

    const formFields = [
        { section: 'Identitas Barang' },
        { name: 'item_name', label: 'Nama Barang', type: 'text', required: true, width: 'half' },
        { name: 'sku', label: 'Kode SKU / Barcode', type: 'text', width: 'half' },
        { 
            name: 'category', 
            label: 'Kategori', 
            type: 'select', 
            options: [
                {value: 'Koper', label: 'Koper & Tas'}, 
                {value: 'Kain Ihram', label: 'Kain Ihram / Mukena'}, 
                {value: 'Seragam', label: 'Bahan Seragam / Batik'},
                {value: 'Buku', label: 'Buku Panduan / Doa'},
                {value: 'Aksesoris', label: 'ID Card / Syal / Sabuk'},
                {value: 'Dokumen', label: 'Sampul Paspor / Dokumen'}
            ], 
            width: 'full' 
        },

        { section: 'Stok & Penyimpanan' },
        { name: 'stock_quantity', label: 'Jumlah Stok Awal', type: 'number', required: true, width: 'third' },
        { name: 'min_stock', label: 'Batas Minimum (Alert)', type: 'number', defaultValue: 10, width: 'third' },
        { name: 'unit', label: 'Satuan', type: 'text', placeholder: 'Pcs / Box / Rim', width: 'third' },
        { name: 'location', label: 'Lokasi Rak / Gudang', type: 'text', width: 'full', placeholder: 'Rak A-01, Gudang Belakang...' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Inventaris Logistik & Perlengkapan"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchLogistics}
                formFields={formFields}
                searchPlaceholder="Cari barang atau SKU..."
            />
        </div>
    );
};

export default Logistics;