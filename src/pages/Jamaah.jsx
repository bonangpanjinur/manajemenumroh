import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatDate } from '../utils/formatters';
import { MapPin, Phone, AlertTriangle, CheckCircle } from 'lucide-react';

const Jamaah = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchJamaah = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/jamaah');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching jamaah:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJamaah();
    }, [fetchJamaah]);

    const getPassportStatus = (expiry) => {
        if (!expiry) return { color: 'text-gray-400', text: 'Belum Ada' };
        const months = (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24 * 30);
        if (months < 0) return { color: 'text-red-600', text: 'Expired' };
        if (months < 7) return { color: 'text-yellow-600', text: 'Kritis (< 7 Bln)' };
        return { color: 'text-green-600', text: 'Aman' };
    };

    const columns = [
        { 
            key: 'name', 
            label: 'Nama Jamaah',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${row.gender === 'P' ? 'bg-pink-500' : 'bg-blue-600'}`}>
                        {val ? val.charAt(0) : '?'}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{val}</div>
                        <div className="text-xs text-gray-500">NIK: {row.nik || '-'}</div>
                    </div>
                </div>
            )
        },
        { 
            key: 'passport_expiry', 
            label: 'Status Paspor',
            render: (val, row) => {
                const status = getPassportStatus(val);
                return (
                    <div className="text-xs">
                        <div className="font-mono text-gray-700">{row.passport_number || '-'}</div>
                        <div className={`flex items-center gap-1 font-bold ${status.color}`}>
                            {val ? formatDate(val) : ''} ({status.text})
                        </div>
                    </div>
                )
            }
        },
        { 
            key: 'phone', 
            label: 'Kontak', 
            render: (val, row) => (
                <div className="text-sm">
                    <a href={`https://wa.me/${val}`} target="_blank" className="flex items-center gap-1 text-green-600 hover:underline">
                        <Phone size={12} /> {val}
                    </a>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <MapPin size={12} /> {row.city || 'Kota -'}
                    </div>
                </div>
            )
        },
        { key: 'status', label: 'Status', render: (val) => <span className="bg-gray-100 px-2 py-1 rounded text-xs uppercase font-bold text-gray-600">{val}</span> }
    ];

    const formFields = [
        { section: 'Identitas Diri' },
        { name: 'name', label: 'Nama Lengkap (Sesuai KTP)', type: 'text', required: true, width: 'half' },
        { name: 'nik', label: 'NIK (KTP)', type: 'text', required: true, width: 'half' },
        { name: 'gender', label: 'Jenis Kelamin', type: 'select', options: [{value: 'L', label: 'Laki-laki'}, {value: 'P', label: 'Perempuan'}], width: 'third' },
        { name: 'birth_date', label: 'Tanggal Lahir', type: 'date', width: 'third' },
        { name: 'birth_place', label: 'Tempat Lahir', type: 'text', width: 'third' },

        { section: 'Dokumen Perjalanan' },
        { name: 'passport_number', label: 'Nomor Paspor', type: 'text', width: 'half' },
        { name: 'passport_expiry', label: 'Masa Berlaku Paspor', type: 'date', width: 'half', help: 'Pastikan minimal 7 bulan sebelum keberangkatan.' },
        { name: 'father_name', label: 'Nama Ayah Kandung (Untuk Visa)', type: 'text', width: 'full' },

        { section: 'Kontak & Alamat' },
        { name: 'phone', label: 'No. WhatsApp', type: 'text', required: true, width: 'half' },
        { name: 'email', label: 'Email', type: 'email', width: 'half' },
        { name: 'address', label: 'Alamat Lengkap', type: 'textarea', width: 'full' },
        { name: 'city', label: 'Kota / Kabupaten', type: 'text', width: 'half' },
        { name: 'province', label: 'Provinsi', type: 'text', width: 'half' },

        { section: 'Lainnya' },
        { name: 'clothing_size', label: 'Ukuran Baju (Logistik)', type: 'select', options: ['S', 'M', 'L', 'XL', 'XXL', '3XL'].map(s => ({value: s, label: s})), width: 'third' },
        { name: 'disease_history', label: 'Riwayat Penyakit', type: 'text', width: 'two-thirds' },
        { name: 'notes', label: 'Catatan Khusus', type: 'textarea', width: 'full' }
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
                searchPlaceholder="Cari nama, nik, atau paspor..."
            />
        </div>
    );
};

export default Jamaah;