import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const Savings = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jamaah, setJamaah] = useState([]);

    const fetchSavings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/savings');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching savings:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load Jamaah untuk dropdown
    useEffect(() => {
        const loadJamaah = async () => {
            try {
                const res = await api.get('/jamaah');
                setJamaah(Array.isArray(res) ? res : []);
            } catch (e) {
                setJamaah([]);
            }
        };
        fetchSavings();
        loadJamaah();
    }, [fetchSavings]);

    const columns = [
        { 
            key: 'account_number', 
            label: 'No. Rekening', 
            render: (val) => <span className="font-mono text-blue-600 font-bold">{val}</span>
        },
        { 
            key: 'jamaah_name', 
            label: 'Pemilik Tabungan',
            render: (val) => <span className="font-semibold text-gray-800">{val}</span>
        },
        { 
            key: 'balance', 
            label: 'Saldo Terkini', 
            render: (val) => <span className="font-bold text-green-700">{formatCurrency(val)}</span>
        },
        { 
            key: 'target_amount', 
            label: 'Target', 
            render: (val, row) => {
                const percent = val > 0 ? Math.round((row.balance / val) * 100) : 0;
                return (
                    <div className="w-24">
                        <div className="text-xs text-gray-500 mb-1">{percent}% dari {formatCurrency(val)}</div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                            <div className="bg-green-500 h-1 rounded-full" style={{ width: `${Math.min(100, percent)}%` }}></div>
                        </div>
                    </div>
                );
            }
        },
        { 
            key: 'last_transaction', 
            label: 'Update Terakhir',
            render: (val) => <span className="text-xs text-gray-500">{val ? formatDate(val) : '-'}</span>
        }
    ];

    const formFields = [
        { section: 'Buka Rekening Tabungan' },
        { 
            name: 'jamaah_id', 
            label: 'Pilih Jamaah', 
            type: 'select', 
            options: (jamaah || []).map(j => ({ value: j.id, label: `${j.name} - ${j.phone}` })),
            required: true,
            width: 'full' 
        },
        { name: 'target_amount', label: 'Target Tabungan (Rp)', type: 'number', required: true, width: 'half' },
        { name: 'monthly_deposit_target', label: 'Rencana Setoran Bulanan', type: 'number', width: 'half' },
        { name: 'notes', label: 'Keterangan / Niat', type: 'textarea', width: 'full' },
        { 
            name: 'status', 
            label: 'Status Rekening', 
            type: 'select', 
            options: [{value: 'active', label: 'Aktif'}, {value: 'closed', label: 'Tutup'}, {value: 'dormant', label: 'Pasif'}], 
            defaultValue: 'active',
            width: 'full' 
        }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Tabungan Umrah"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchSavings}
                formFields={formFields}
                searchPlaceholder="Cari no rekening atau nama..."
            />
        </div>
    );
};

export default Savings;