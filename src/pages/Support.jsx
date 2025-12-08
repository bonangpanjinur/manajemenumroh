import React from 'react';
import CrudTable from '../components/CrudTable';
import { formatDate } from '../utils/formatters';

const Support = () => {
  const columns = [
    { key: 'subject', label: 'Subjek' },
    { key: 'category', label: 'Kategori' },
    { 
      key: 'priority', 
      label: 'Prioritas',
      render: (val) => {
        const colors = { Low: 'bg-gray-100', Medium: 'bg-blue-100 text-blue-800', High: 'bg-orange-100 text-orange-800', Urgent: 'bg-red-100 text-red-800' };
        return <span className={`px-2 py-1 rounded text-xs ${colors[val]}`}>{val}</span>;
      }
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => {
        const colors = { Open: 'text-green-600 font-bold', 'In Progress': 'text-blue-600', Resolved: 'text-gray-500 line-through' };
        return <span className={`text-xs ${colors[val]}`}>{val}</span>;
      }
    },
    { key: 'created_at', label: 'Dibuat', render: (val) => formatDate(val) }
  ];

  // Note: Support biasanya hanya view & reply bagi admin, create bagi user.
  // Di sini kita sediakan form dasar edit status.
  const formFields = [
    { name: 'subject', label: 'Subjek Masalah', type: 'text', disabled: true, width: 'full' },
    { 
      name: 'status', 
      label: 'Update Status', 
      type: 'select', 
      options: [{value: 'Open', label: 'Open'}, {value: 'In Progress', label: 'Sedang Diproses'}, {value: 'Resolved', label: 'Selesai'}, {value: 'Closed', label: 'Tutup'}],
      width: 'full'
    },
    // Fitur reply/chat akan lebih kompleks, sementara update status dulu
  ];

  return (
    <CrudTable
      title="Tiket Bantuan & Komplain"
      endpoint="/support/tickets"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Cari tiket..."
      // createButton={false} // Admin jarang buat tiket manual
    />
  );
};

export default Support;