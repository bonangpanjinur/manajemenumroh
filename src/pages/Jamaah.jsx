import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatDate } from '../utils/formatters';
import { User, FileText, Phone, MapPin, Users, Heart, Briefcase } from 'lucide-react';

const Jamaah = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mahramOptions, setMahramOptions] = useState([]);

    const fetchJamaah = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/jamaah');
            const safeData = Array.isArray(response) ? response : [];
            setData(safeData);
            
            // Siapkan opsi untuk dropdown Mahram (Relasi antar jamaah)
            // Filter: Kita buat list nama & NIK untuk memudahkan pencarian keluarga
            setMahramOptions(safeData.map(j => ({ 
                value: j.id, 
                label: `${j.name} (${j.nik || 'No NIK'})` 
            })));
        } catch (error) {
            console.error("Error fetching jamaah:", error);
            setData([]);
            setMahramOptions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJamaah();
    }, [fetchJamaah]);

    // Logika Cerdas: Cek Status Paspor
    const getDocStatus = (expiryDate) => {
        if (!expiryDate) return { color: 'text-gray-400', icon: '❓', text: 'Belum Ada', bg: 'bg-gray-50' };
        
        const now = new Date();
        const expiry = new Date(expiryDate);
        const monthsLeft = (expiry - now) / (1000 * 60 * 60 * 24 * 30); // Hitung sisa bulan
        
        if (expiry < now) return { color: 'text-red-700', icon: '⛔', text: 'EXPIRED', bg: 'bg-red-50' };
        if (monthsLeft < 7) return { color: 'text-yellow-700', icon: '⚠️', text: 'Kritis (< 7 Bln)', bg: 'bg-yellow-50' };
        return { color: 'text-green-700', icon: '✅', text: 'Aman', bg: 'bg-green-50' };
    };

    const columns = [
        { 
            key: 'name', 
            label: 'Profil Jamaah',
            render: (val, row) => (
                <div className="flex items-center gap-4">
                    {/* Smart Avatar */}
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-sm border-2 border-white ${row.gender === 'P' ? 'bg-pink-500' : 'bg-blue-600'}`}>
                        {val ? val.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-base">{val}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-600">🆔 {row.nik || '-'}</span>
                            <span className="flex items-center gap-1">
                                {row.gender === 'L' ? '🚹 Laki-laki' : '🚺 Perempuan'}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: 'contact', 
            label: 'Kontak & Domisili',
            render: (_, row) => (
                <div className="text-sm space-y-1.5">
                    {row.phone && (
                        <a href={`https://wa.me/${row.phone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-green-600 hover:text-green-800 font-medium hover:underline w-fit transition-colors">
                            <div className="bg-green-100 p-1 rounded-full"><Phone size={12} /></div> 
                            {row.phone}
                        </a>
                    )}
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <MapPin size={14} className="text-gray-400" /> 
                        {row.city || 'Kota -'}, {row.province || ''}
                    </div>
                </div>
            )
        },
        { 
            key: 'passport_expiry', 
            label: 'Dokumen Paspor',
            render: (val, row) => {
                const status = getDocStatus(val);
                return (
                    <div className={`p-2 rounded-lg border ${status.bg} border-opacity-50`}>
                        <div className="font-mono font-bold text-gray-800 text-sm">{row.passport_number || '-'}</div>
                        <div className={`flex items-center gap-1.5 mt-1 text-xs font-medium ${status.color}`}>
                            <span>{status.icon}</span>
                            <span>{val ? formatDate(val) : status.text}</span>
                        </div>
                    </div>
                );
            }
        },
        { 
            key: 'mahram_name', 
            label: 'Relasi Keluarga',
            render: (val, row) => (
                <div className="text-xs">
                    {val ? (
                        <div className="flex flex-col gap-1">
                            <span className="text-gray-500">Mahram:</span>
                            <span className="bg-purple-50 text-purple-700 px-2 py-1.5 rounded-md border border-purple-100 flex items-center gap-1.5 w-fit font-medium">
                                <Heart size={12} className="text-purple-500 fill-purple-500" /> 
                                {val} 
                                <span className="text-purple-400">|</span> 
                                {row.mahram_relation}
                            </span>
                        </div>
                    ) : (
                        <span className="text-gray-400 italic flex items-center gap-1">
                            <User size={12} /> Mandiri / Single
                        </span>
                    )}
                </div>
            )
        },
        { 
            key: 'status', 
            label: 'Status', 
            render: (val) => {
                const map = { 
                    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'AKTIF' },
                    alumni: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'ALUMNI' },
                    prospect: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'PROSPEK' },
                    archived: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'ARSIP' }
                };
                const style = map[val] || map.archived;
                return (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-opacity-20 ${style.bg} ${style.text} border-current`}>
                        {style.label}
                    </span>
                );
            }
        }
    ];

    const formFields = [
        { section: 'Identitas Utama (Sesuai KTP)' },
        { name: 'name', label: 'Nama Lengkap', type: 'text', required: true, width: 'half', placeholder: 'CONTOH: BUDI SANTOSO' },
        { name: 'nik', label: 'Nomor Induk Kependudukan (NIK)', type: 'text', required: true, width: 'half', placeholder: '16 digit angka' },
        { name: 'gender', label: 'Jenis Kelamin', type: 'select', options: [{value: 'L', label: 'Laki-laki'}, {value: 'P', label: 'Perempuan'}], width: 'third' },
        { name: 'birth_place', label: 'Tempat Lahir', type: 'text', width: 'third' },
        { name: 'birth_date', label: 'Tanggal Lahir', type: 'date', width: 'third' },
        { name: 'father_name', label: 'Nama Ayah Kandung (Penting untuk Visa)', type: 'text', width: 'full', help: 'Wajib diisi untuk keperluan manifest Visa & Tiket.' },

        { section: 'Dokumen Perjalanan (Paspor)' },
        { name: 'passport_number', label: 'Nomor Paspor', type: 'text', width: 'third', placeholder: 'X1234567' },
        { name: 'passport_issued_date', label: 'Tanggal Terbit', type: 'date', width: 'third' },
        { name: 'passport_expiry', label: 'Tanggal Habis Berlaku', type: 'date', width: 'third' },
        { name: 'passport_issued_at', label: 'Kantor Imigrasi Penerbit', type: 'text', width: 'full', placeholder: 'Cth: Kanim Jakarta Selatan' },

        { section: 'Relasi Keluarga & Mahram' },
        { 
            name: 'mahram_id', 
            label: 'Hubungkan Mahram (Keluarga)', 
            type: 'select', 
            options: [{value: '', label: '- Tidak Ada / Berangkat Sendiri -'}, ...mahramOptions], 
            width: 'half',
            help: 'Pilih jamaah lain yang memiliki hubungan keluarga. Data mereka harus diinput terlebih dahulu.'
        },
        { 
            name: 'mahram_relation', 
            label: 'Hubungan Keluarga', 
            type: 'select', 
            options: [
                {value: 'Suami', label: 'Suami'}, 
                {value: 'Istri', label: 'Istri'}, 
                {value: 'Ayah', label: 'Ayah'}, 
                {value: 'Ibu', label: 'Ibu'}, 
                {value: 'Anak', label: 'Anak'}, 
                {value: 'Saudara', label: 'Saudara Kandung'},
                {value: 'Kakek/Nenek', label: 'Kakek/Nenek'},
                {value: 'Paman/Bibi', label: 'Paman/Bibi'}
            ], 
            width: 'half' 
        },

        { section: 'Kontak & Demografi' },
        { name: 'phone', label: 'No. WhatsApp Aktif', type: 'text', required: true, width: 'half', placeholder: '0812...' },
        { name: 'email', label: 'Alamat Email', type: 'email', width: 'half' },
        { name: 'job', label: 'Pekerjaan', type: 'text', width: 'third' },
        { name: 'education', label: 'Pendidikan', type: 'select', options: [{value: 'SD', label: 'SD'}, {value: 'SMP', label: 'SMP'}, {value: 'SMA', label: 'SMA'}, {value: 'S1', label: 'S1 Sarjana'}, {value: 'S2', label: 'S2 Magister'}, {value: 'S3', label: 'S3 Doktor'}, {value: 'Lainnya', label: 'Lainnya'}], width: 'third' },
        { name: 'clothing_size', label: 'Ukuran Perlengkapan (Baju)', type: 'select', options: [{value: 'XS', label: 'XS'}, {value: 'S', label: 'S'}, {value: 'M', label: 'M'}, {value: 'L', label: 'L'}, {value: 'XL', label: 'XL'}, {value: 'XXL', label: 'XXL'}, {value: '3XL', label: '3XL (Jumbo)'}], width: 'third' },
        
        { section: 'Alamat Domisili Lengkap' },
        { name: 'address', label: 'Jalan / Blok / No. Rumah', type: 'textarea', width: 'full' },
        { name: 'city', label: 'Kota / Kabupaten', type: 'text', width: 'half' },
        { name: 'province', label: 'Provinsi', type: 'text', width: 'half' },
        { name: 'postal_code', label: 'Kode Pos', type: 'text', width: 'half' },

        { section: 'Status Keanggotaan' },
        { 
            name: 'status', 
            label: 'Status Data', 
            type: 'select', 
            options: [
                {value: 'prospect', label: 'Prospek (Baru Tanya-tanya)'}, 
                {value: 'active', label: 'Aktif (Sedang Program/Cicil)'}, 
                {value: 'alumni', label: 'Alumni (Sudah Pernah Berangkat)'},
                {value: 'archived', label: 'Arsip / Tidak Aktif'}
            ], 
            defaultValue: 'prospect',
            width: 'full' 
        },
        { name: 'notes', label: 'Catatan Khusus (Penyakit/Request)', type: 'textarea', width: 'full' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Database Jemaah Haji & Umrah"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchJamaah}
                formFields={formFields}
                searchPlaceholder="Cari nama, NIK, paspor, atau kota..."
            />
        </div>
    );
};

export default Jamaah;