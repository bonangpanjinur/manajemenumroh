import React from 'react';
import CrudTable from '../components/CrudTable';
import { formatCurrency } from '../utils/formatters';

const Savings = () => {
  const columns = [
    { key: 'id', label: 'ID Rekening', render: (val) => `#${val}` },
    { key: 'jamaah_name', label: 'Nama Jamaah' },
    { 
      key: 'target_amount', 
      label: 'Target', 
      render: (val) => formatCurrency(val) 
    },
    { 
      key: 'current_balance', 
      label: 'Saldo Terkini', 
      render: (val) => <span className="font-bold text-green-600">{formatCurrency(val)}</span> 
    },
    { 
      key: 'current_balance', 
      label: 'Progress', 
      render: (val, row) => {
        const pct = Math.min(100, Math.round((val / row.target_amount) * 100));
        return (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
            <span className="text-xs text-gray-500">{pct}%</span>
          </div>
        )
      }
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs ${val === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
          {val.toUpperCase()}
        </span>
      )
    },
  ];

  const formFields = [
    { name: 'user_id', label: 'Pilih User/Jamaah (ID)', type: 'number', required: true, width: 'full' }, // Idealnya select search user
    { name: 'target_amount', label: 'Target Dana (Rp)', type: 'number', required: true, width: 'half' },
    { 
      name: 'tenure_years', 
      label: 'Tenor (Tahun)', 
      type: 'select', 
      options: [
        { value: '1', label: '1 Tahun' },
        { value: '2', label: '2 Tahun' },
        { value: '3', label: '3 Tahun' }
      ],
      required: true,
      width: 'half'
    },
    { name: 'package_id', label: 'ID Paket (Opsional)', type: 'number', width: 'full' },
  ];

  return (
    <CrudTable
      title="Rekening Tabungan Umrah"
      endpoint="/savings"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Cari rekening..."
    />
  );
};

export default Savings;