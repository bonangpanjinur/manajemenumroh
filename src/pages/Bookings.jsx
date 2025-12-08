import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatDate, formatCurrency } from '../utils/formatters';

const Bookings = () => {
  const [departures, setDepartures] = useState([]);
  const [agents, setAgents] = useState([]);

  // Fetch Data Referensi untuk Dropdown
  useEffect(() => {
    const fetchRefs = async () => {
      try {
        // Asumsi endpoint ini ada untuk mengambil list ringkas
        const depData = await api.get('/departures?status=open');
        const agtData = await api.get('/agents?status=active');
        
        if (depData) setDepartures(depData);
        if (agtData) setAgents(agtData);
      } catch (e) {
        console.error("Gagal mengambil data referensi", e);
      }
    };
    fetchRefs();
  }, []);

  const columns = [
    { key: 'booking_code', label: 'Kode Booking', render: (val) => <span className="font-mono font-bold">{val}</span> },
    { key: 'contact_name', label: 'Nama Kontak' },
    { 
      key: 'departure_date', 
      label: 'Keberangkatan', 
      render: (_, row) => (
        <div className="flex flex-col">
           <span className="text-xs font-semibold">{row.departure_name || `Jadwal #${row.departure_id}`}</span>
           <span className="text-xs text-gray-500">{formatDate(row.departure_date)}</span>
        </div>
      )
    },
    { 
      key: 'total_pax', 
      label: 'Pax',
      render: (val) => <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{val} Orang</span>
    },
    { 
      key: 'total_price', 
      label: 'Total Tagihan', 
      render: (val) => formatCurrency(val) 
    },
    { 
      key: 'payment_status', 
      label: 'Status Bayar',
      render: (val) => {
        const colors = {
          unpaid: 'bg-red-100 text-red-800',
          dp: 'bg-yellow-100 text-yellow-800',
          partial: 'bg-orange-100 text-orange-800',
          paid: 'bg-green-100 text-green-800',
          refunded: 'bg-gray-200 text-gray-600',
          overdue: 'bg-red-900 text-white'
        };
        const labels = {
          unpaid: 'Belum Bayar',
          dp: 'Sudah DP',
          partial: 'Cicilan',
          paid: 'Lunas',
          refunded: 'Refund',
          overdue: 'Jatuh Tempo'
        };
        return <span className={`px-2 py-1 rounded text-xs ${colors[val] || 'bg-gray-100'}`}>{labels[val] || val.toUpperCase()}</span>;
      }
    },
    { 
      key: 'status', 
      label: 'Status Booking',
      render: (val) => {
        const colors = {
          draft: 'bg-gray-100 text-gray-600',
          pending: 'bg-blue-100 text-blue-800',
          confirmed: 'bg-green-100 text-green-800',
          completed: 'bg-purple-100 text-purple-800',
          cancelled: 'bg-red-100 text-red-800'
        };
        return <span className={`px-2 py-1 rounded text-xs ${colors[val]}`}>{val.toUpperCase()}</span>;
      }
    },
    { 
      key: 'is_from_savings', 
      label: 'Sumber',
      render: (val) => val == 1 ? <span className="text-xs bg-teal-100 text-teal-800 px-1 rounded">Tabungan</span> : '-'
    }
  ];

  const formFields = [
    { section: 'Informasi Keberangkatan & Agen' },
    { 
      name: 'departure_id', 
      label: 'Pilih Jadwal Keberangkatan', 
      type: 'select', 
      options: departures.map(d => ({ value: d.id, label: `${d.package_name || 'Paket'} - ${formatDate(d.departure_date)} (Sisa: ${d.available_seats})` })),
      required: true, 
      width: 'half' 
    },
    { 
      name: 'agent_id', 
      label: 'Agen / Referal (Opsional)', 
      type: 'select', 
      options: [{value: '', label: '- Tanpa Agen -'}, ...agents.map(a => ({ value: a.id, label: `${a.name} (${a.code})` }))],
      width: 'half' 
    },

    { section: 'Data Pemesan (Contact Person)' },
    { name: 'contact_name', label: 'Nama Lengkap', type: 'text', required: true, width: 'half' },
    { name: 'contact_phone', label: 'No. Handphone/WA', type: 'tel', required: true, width: 'half' },
    { name: 'contact_email', label: 'Alamat Email', type: 'email', width: 'half' },
    { name: 'user_id', label: 'ID User (Jika Terdaftar)', type: 'number', width: 'half', placeholder: 'Kosongkan jika tamu' },
    
    { section: 'Detail Pemesanan' },
    { name: 'total_pax', label: 'Jumlah Jamaah (Pax)', type: 'number', required: true, defaultValue: 1, width: 'third' },
    { name: 'currency', label: 'Mata Uang', type: 'select', options: [{value: 'IDR', label: 'IDR'}, {value: 'USD', label: 'USD'}], defaultValue: 'IDR', width: 'third' },
    { name: 'total_price', label: 'Total Harga Paket', type: 'number', required: true, width: 'third' },
    { name: 'discount_amount', label: 'Diskon (Jika ada)', type: 'number', defaultValue: 0, width: 'half' },
    { name: 'coupon_id', label: 'ID Kupon', type: 'number', width: 'half' },

    { section: 'Status & Pembayaran' },
    { 
      name: 'status', 
      label: 'Status Booking', 
      type: 'select', 
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending Confirmation' },
        { value: 'confirmed', label: 'Confirmed (Seat Secured)' },
        { value: 'completed', label: 'Completed (Selesai)' },
        { value: 'cancelled', label: 'Cancelled' }
      ],
      defaultValue: 'pending',
      width: 'half'
    },
    { 
      name: 'payment_status', 
      label: 'Status Pembayaran', 
      type: 'select', 
      options: [
        { value: 'unpaid', label: 'Belum Bayar' },
        { value: 'dp', label: 'Sudah DP' },
        { value: 'partial', label: 'Cicilan Berjalan' },
        { value: 'paid', label: 'Lunas' },
        { value: 'refunded', label: 'Refunded' }
      ],
      defaultValue: 'unpaid',
      width: 'half'
    },
    
    { section: 'Lain-lain' },
    { name: 'notes', label: 'Catatan Internal (Staff Only)', type: 'textarea', width: 'full' },
  ];

  return (
    <CrudTable
      title="Data Transaksi Booking"
      endpoint="/bookings"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Cari kode booking, nama kontak..."
      allowDelete={true} // Hati-hati delete booking
    />
  );
};

export default Bookings;