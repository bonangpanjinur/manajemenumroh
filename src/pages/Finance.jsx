import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TrendingUp, TrendingDown, FileText, CheckCircle } from 'lucide-react';

const Finance = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFinance = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/finance');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching finance:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFinance();
    }, [fetchFinance]);

    const columns = [
        { 
            key: 'transaction_date', 
            label: 'Tanggal', 
            render: (val) => <span className="font-mono text-sm text-gray-600">{formatDate(val)}</span>
        },
        { 
            key: 'description', 
            label: 'Keterangan Transaksi',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-800">{val}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <FileText size={10} /> {row.category || 'Umum'} | {row.payment_method}
                    </div>
                </div>
            )
        },
        { 
            key: 'amount', 
            label: 'Nominal',
            render: (val, row) => (
                <div className={`flex items-center gap-2 font-bold ${row.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {row.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {formatCurrency(val)}
                </div>
            )
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => {
                const map = { verified: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', rejected: 'bg-red-100 text-red-800' };
                return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${map[val] || 'bg-gray-100'}`}>{val}</span>;
            }
        }
    ];

    const formFields = [
        { section: 'Jenis Transaksi' },
        { 
            name: 'type', 
            label: 'Tipe', 
            type: 'select', 
            options: [{value: 'income', label: 'Pemasukan (Income)'}, {value: 'expense', label: 'Pengeluaran (Expense)'}], 
            defaultValue: 'income',
            width: 'half' 
        },
        { name: 'transaction_date', label: 'Tanggal', type: 'date', required: true, width: 'half' },

        { section: 'Detail Keuangan' },
        { name: 'amount', label: 'Nominal (Rp)', type: 'number', required: true, width: 'half' },
        { 
            name: 'category', 
            label: 'Kategori', 
            type: 'select', 
            options: [
                {value: 'Pembayaran Jamaah', label: 'Pembayaran Jamaah'}, 
                {value: 'Operasional', label: 'Biaya Operasional'},
                {value: 'Marketing', label: 'Biaya Marketing/Iklan'},
                {value: 'Gaji', label: 'Gaji Karyawan'},
                {value: 'Perlengkapan', label: 'Belanja Logistik'},
                {value: 'Refund', label: 'Refund / Pengembalian'},
                {value: 'Lainnya', label: 'Lainnya'}
            ],
            width: 'half' 
        },
        { name: 'description', label: 'Keterangan Lengkap', type: 'textarea', required: true, width: 'full' },

        { section: 'Metode & Bukti' },
        { 
            name: 'payment_method', 
            label: 'Metode Pembayaran', 
            type: 'select', 
            options: [{value: 'Transfer Bank', label: 'Transfer Bank'}, {value: 'Tunai', label: 'Tunai / Cash'}, {value: 'QRIS', label: 'QRIS'}, {value: 'Cek/Giro', label: 'Cek / Giro'}], 
            width: 'half' 
        },
        { name: 'reference_number', label: 'No. Referensi / Bukti', type: 'text', width: 'half' },
        { name: 'status', label: 'Status Verifikasi', type: 'select', options: [{value: 'verified', label: 'Verified (Sah)'}, {value: 'pending', label: 'Pending (Cek Dulu)'}], defaultValue: 'verified', width: 'full' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Buku Kas & Keuangan"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchFinance}
                formFields={formFields}
                searchPlaceholder="Cari transaksi..."
            />
        </div>
    );
};

export default Finance;