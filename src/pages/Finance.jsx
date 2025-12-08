import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const Finance = () => {
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });

  // Hitung ringkasan sederhana (ideally dari API stats)
  const calculateSummary = (data) => {
    if (!Array.isArray(data)) return;
    const inc = data.filter(d => d.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const exp = data.filter(d => d.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    setSummary({ income: inc, expense: exp, balance: inc - exp });
  };

  const columns = [
    { 
      key: 'transaction_date', 
      label: 'Tanggal', 
      render: (val) => <span className="text-gray-600 font-mono text-xs">{formatDate(val)}</span> 
    },
    { 
      key: 'type', 
      label: 'Tipe',
      render: (val) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${val === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {val === 'income' ? 'PEMASUKAN' : 'PENGELUARAN'}
        </span>
      )
    },
    { 
      key: 'amount', 
      label: 'Nominal', 
      render: (val, row) => (
        <span className={`font-mono font-bold ${row.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {row.type === 'expense' ? '-' : '+'} {formatCurrency(val)}
        </span>
      )
    },
    { 
      key: 'category', 
      label: 'Kategori & Sumber',
      render: (val, row) => (
        <div>
          <div className="font-medium text-gray-800">{val}</div>
          {/* Badge Sumber Dana Otomatis */}
          <div className="flex gap-1 mt-1">
            {row.related_savings_id && <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded border border-blue-100">Tabungan #{row.related_savings_id}</span>}
            {row.related_badal_id && <span className="text-[10px] bg-purple-50 text-purple-600 px-1 rounded border border-purple-100">Badal #{row.related_badal_id}</span>}
            {row.booking_id && <span className="text-[10px] bg-orange-50 text-orange-600 px-1 rounded border border-orange-100">Booking #{row.booking_id}</span>}
          </div>
        </div>
      )
    },
    { key: 'description', label: 'Keterangan', render: (val) => <span className="text-xs text-gray-500 italic">{val}</span> },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => val === 'verified' ? <span className="text-green-500 text-xs">✔ Verified</span> : <span className="text-yellow-500 text-xs">⏳ {val}</span>
    }
  ];

  const formFields = [
    { section: 'Detail Transaksi' },
    { 
      name: 'type', 
      label: 'Jenis Transaksi', 
      type: 'select', 
      options: [{value: 'income', label: 'Pemasukan (Income)'}, {value: 'expense', label: 'Pengeluaran (Expense)'}], 
      required: true, 
      width: 'half' 
    },
    { 
      name: 'category', 
      label: 'Kategori', 
      type: 'select', 
      options: [
        {value: 'Pembayaran Booking', label: 'Pembayaran Booking'},
        {value: 'Tabungan Umroh', label: 'Setoran Tabungan'},
        {value: 'Badal Umrah', label: 'Jasa Badal'},
        {value: 'Operasional Kantor', label: 'Operasional Kantor'},
        {value: 'Gaji Karyawan', label: 'Gaji Karyawan'},
        {value: 'Marketing', label: 'Biaya Marketing'},
        {value: 'Refund', label: 'Refund / Pengembalian'},
        {value: 'Lainnya', label: 'Lainnya'}
      ],
      required: true,
      width: 'half'
    },
    { name: 'amount', label: 'Nominal (Rp)', type: 'number', required: true, width: 'full' },
    
    { section: 'Info Tambahan' },
    { name: 'transaction_date', label: 'Tanggal Transaksi', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0], width: 'half' },
    { name: 'payment_method', label: 'Metode Bayar', type: 'select', options: [{value: 'transfer', label: 'Transfer Bank'}, {value: 'cash', label: 'Tunai'}, {value: 'va', label: 'Virtual Account'}], width: 'half' },
    { name: 'description', label: 'Keterangan Detail', type: 'textarea', width: 'full' },
    
    { section: 'Link Referensi (Opsional - ID Saja)' },
    { name: 'booking_id', label: 'ID Booking', type: 'number', width: 'third' },
    { name: 'related_savings_id', label: 'ID Tabungan', type: 'number', width: 'third' },
    { name: 'related_badal_id', label: 'ID Badal', type: 'number', width: 'third' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow-sm border-l-4 border-green-500">
          <p className="text-xs text-gray-500 uppercase">Total Pemasukan</p>
          <p className="text-xl font-bold text-green-700">{formatCurrency(summary.income)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow-sm border-l-4 border-red-500">
          <p className="text-xs text-gray-500 uppercase">Total Pengeluaran</p>
          <p className="text-xl font-bold text-red-700">{formatCurrency(summary.expense)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-500">
          <p className="text-xs text-gray-500 uppercase">Saldo Arus Kas</p>
          <p className="text-xl font-bold text-blue-700">{formatCurrency(summary.balance)}</p>
        </div>
      </div>

      <CrudTable
        title="Laporan Keuangan & Arus Kas"
        endpoint="/finance"
        columns={columns}
        formFields={formFields}
        searchPlaceholder="Cari transaksi..."
        onDataLoaded={calculateSummary} // Callback custom untuk hitung summary
      />
    </div>
  );
};

export default Finance;