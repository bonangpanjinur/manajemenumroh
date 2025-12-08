import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';

const Jamaah = () => {
    // 1. Safe Initialization
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // 2. Safe Fetching
    const fetchJamaah = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/jamaah');
            // Pastikan selalu array
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching jamaah:", error);
            setData([]); // Fallback array kosong
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJamaah();
    }, [fetchJamaah]);

    const columns = [
        { 
            key: 'name', 
            label: 'Nama Lengkap',
            render: (val, row) => (
                <div>
                    <div className="font-bold text-gray-900">{val}</div>
                    <div className="text-xs text-gray-500">NIK: {row.nik || '-'}</div>
                </div>
            )
        },
        { 
            key: 'passport_number', 
            label: 'Paspor',
            render: (val) => val ? <span className="font-mono text-blue-600">{val}</span> : <span className="text-red-400 text-xs italic">Belum ada</span>
        },
        { 
            key: 'phone', 
            label: 'Kontak',
            render: (val) => val ? (
                <a href={`https://wa.me/${val.replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="text-green-600 hover:underline flex items-center gap-1">
                    📱 {val}
                </a>
            ) : '-'
        },
        { key: 'city', label: 'Domisili' },
        { 
            key: 'status', 
            label: 'Status', 
            render: (val) => val === 'active' 
                ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Aktif</span> 
                : <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">Arsip</span>
        }
    ];

    // Form tanpa dropdown eksternal pun tetap perlu dijaga
    const formFields = [
        { section: 'Identitas Pribadi' },
        { name: 'name', label: 'Nama Lengkap (Sesuai KTP)', type: 'text', required: true, width: 'full' },
        { name: 'nik', label: 'NIK / No. KTP', type: 'text', required: true, width: 'half' },
        { name: 'gender', label: 'Jenis Kelamin', type: 'select', options: [{value: 'L', label: 'Laki-laki'}, {value: 'P', label: 'Perempuan'}], width: 'half' },
        
        { section: 'Dokumen Perjalanan' },
        { name: 'passport_number', label: 'Nomor Paspor', type: 'text', width: 'half' },
        { name: 'passport_expiry', label: 'Masa Berlaku Paspor', type: 'date', width: 'half' },
        
        { section: 'Kontak & Alamat' },
        { name: 'phone', label: 'Nomor WhatsApp', type: 'text', required: true, width: 'half', placeholder: '0812...' },
        { name: 'email', label: 'Email (Opsional)', type: 'email', width: 'half' },
        { name: 'address', label: 'Alamat Lengkap', type: 'textarea', width: 'full' },
        { name: 'city', label: 'Kota / Kabupaten', type: 'text', width: 'half' },
        
        { section: 'Lainnya' },
        { name: 'notes', label: 'Catatan Kesehatan / Khusus', type: 'textarea', width: 'full' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Database Jamaah"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchJamaah}
                formFields={formFields}
                searchPlaceholder="Cari nama, paspor, atau kota..."
            />
        </div>
    );
};

export default Jamaah;