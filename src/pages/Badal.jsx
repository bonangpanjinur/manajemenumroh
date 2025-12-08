import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const Badal = () => {
  const [mutawwifs, setMutawwifs] = useState([]);

  useEffect(() => {
    const fetchM = async () => {
      try {
        const res = await api.get('/mutawwif?status=active');
        if (Array.isArray(res)) setMutawwifs(res);
      } catch (e) { console.error(e); }
    };
    fetchM();
  }, []);

  const columns = [
    { key: 'badal_for_name', label: 'Badal Untuk (Nama)' },
    { key: 'badal_reason', label: 'Alasan', render: (val) => val === 'deceased' ? 'Almarhum/ah' : 'Sakit/Uzur' },
    { key: 'mutawwif_name', label: 'Pelaksana', render: (val) => val || <span className="text-gray-400 italic">Belum ditentukan</span> },
    { key: 'price', label: 'Harga', render: (val) => formatCurrency(val) },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => {
        const colors = {
          pending: 'bg-yellow-100 text-yellow-800',
          paid: 'bg-blue-100 text-blue-800',
          assigned: 'bg-purple-100 text-purple-800',
          completed: 'bg-green-100 text-green-800',
          certificate_sent: 'bg-teal-100 text-teal-800'
        };
        return <span className={`px-2 py-1 rounded text-xs ${colors[val] || 'bg-gray-100'}`}>{val.replace('_', ' ').toUpperCase()}</span>;
      }
    }
  ];

  const formFields = [
    { section: 'Info Badal' },
    { name: 'badal_for_name', label: 'Nama Yang Dibadalkan', type: 'text', required: true, width: 'half' },
    { 
      name: 'badal_for_gender', 
      label: 'Jenis Kelamin', 
      type: 'select', 
      options: [{value: 'L', label: 'Laki-laki'}, {value: 'P', label: 'Perempuan'}], 
      width: 'quarter' 
    },
    { 
      name: 'badal_reason', 
      label: 'Kondisi', 
      type: 'select', 
      options: [{value: 'deceased', label: 'Meninggal'}, {value: 'sick', label: 'Sakit Keras'}, {value: 'old_age', label: 'Lansia Renta'}], 
      width: 'quarter' 
    },
    
    { section: 'Biaya & Pelaksanaan' },
    { name: 'price', label: 'Harga Paket (Rp)', type: 'number', required: true, width: 'half' },
    { 
      name: 'assigned_mutawwif_id', 
      label: 'Tunjuk Pelaksana (Mutawwif)', 
      type: 'select',
      options: [{value: '', label: '- Pilih Nanti -'}, ...mutawwifs.map(m => ({ value: m.id, label: m.name }))],
      width: 'half'
    },
    
    { section: 'Status & Bukti' },
    { 
      name: 'status', 
      label: 'Status Proses', 
      type: 'select', 
      options: [
        {value: 'pending', label: 'Pending (Belum Bayar)'},
        {value: 'paid', label: 'Paid (Sudah Bayar)'},
        {value: 'assigned', label: 'Assigned (Sedang Dilaksanakan)'},
        {value: 'completed', label: 'Completed (Selesai)'},
        {value: 'certificate_sent', label: 'Certificate Sent'}
      ],
      width: 'full'
    },
    { name: 'video_proof_url', label: 'Link Video Bukti', type: 'url', width: 'half' },
    { name: 'certificate_url', label: 'Link Sertifikat', type: 'url', width: 'half' },
  ];

  return (
    <CrudTable
      title="Layanan Badal Umrah"
      endpoint="/badal"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Cari nama..."
    />
  );
};

export default Badal;