import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const Finance = () => {
    // 1. Safe Initialization
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 2. Fetch Logic
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance/transactions');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const columns = [
        { 
            key: 'transaction_date', 
            label: 'Tanggal', 
            render: (val) => <div className="text-gray-600 font-medium text-sm">{formatDate(val)}</div>
        },
        { 
            key: 'description', 
            label: 'Keterangan',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-800">{val}</div>
                    <div className="text-xs text-gray-500">{row.category || 'Umum'}</div>
                </div>
            )
        },
        { 
            key: 'type', 
            label: 'Tipe',
            render: (val) => val === 'income' 
                ? <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">Pemasukan</span> 
                : <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">Pengeluaran</span>
        },
        { 
            key: 'amount', 
            label: 'Nominal', 
            render: (val, row) => (
                <span className={`font-mono font-bold ${row.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                    {row.type === 'income' ? '+' : '-'} {formatCurrency(val)}
                </span>
            )
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => {
                const colors = { verified: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', rejected: 'bg-red-100 text-red-800' };
                return <span className={`px-2 py-1 rounded text-xs ${colors[val] || 'bg-gray-100'}`}>{val ? val.toUpperCase() : '-'}</span>;
            }
        }
    ];

    const formFields = [
        { section: 'Detail Transaksi' },
        { 
            name: 'type', 
            label: 'Jenis Transaksi', 
            type: 'select', 
            options: [{value: 'income', label: 'Pemasukan (Income)'}, {value: 'expense', label: 'Pengeluaran (Expense)'}], 
            defaultValue: 'income',
            width: 'half' 
        },
        { name: 'transaction_date', label: 'Tanggal Transaksi', type: 'date', required: true, width: 'half' },
        { name: 'amount', label: 'Nominal (Rp)', type: 'number', required: true, width: 'half' },
        { 
            name: 'category', 
            label: 'Kategori', 
            type: 'select', 
            options: [
                {value: 'Pembayaran Jamaah', label: 'Pembayaran Jamaah'}, 
                {value: 'Operasional', label: 'Biaya Operasional'},
                {value: 'Gaji', label: 'Gaji Karyawan'},
                {value: 'Marketing', label: 'Biaya Iklan/Marketing'},
                {value: 'Lainnya', label: 'Lainnya'}
            ], 
            width: 'half' 
        },
        { name: 'description', label: 'Keterangan Lengkap', type: 'textarea', required: true, width: 'full' },
        
        { section: 'Verifikasi' },
        { 
            name: 'status', 
            label: 'Status', 
            type: 'select', 
            options: [{value: 'pending', label: 'Pending'}, {value: 'verified', label: 'Terverifikasi'}, {value: 'rejected', label: 'Ditolak'}], 
            defaultValue: 'verified',
            width: 'full' 
        }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Laporan Keuangan (Finance)"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchTransactions}
                formFields={formFields}
                searchPlaceholder="Cari transaksi..."
            />
        </div>
    );
};

export default Finance;