import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api'; // Penting untuk upload
import { Plus, Upload, CreditCard, Phone, Package, ExternalLink, User } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Jamaah = () => {
    // 1. Data Utama Jemaah
    const { 
        data, 
        loading, 
        pagination,
        fetchData, 
        deleteItem,
        changePage,
        changeLimit 
    } = useCRUD('umh/v1/jamaah');

    // 2. Data Master Paket untuk Dropdown
    const { data: packages } = useCRUD('umh/v1/packages');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [formData, setFormData] = useState({});
    
    // State khusus Upload
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState({ ktp: null, kk: null, passport: null });

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle Pencarian
    const handleSearch = (q) => {
        fetchData(1, pagination.limit, q);
    };

    // Handle File Input
    const handleFileChange = (type, file) => {
        setFiles(prev => ({ ...prev, [type]: file }));
    };

    // Handle Perubahan Paket (Auto-fill harga)
    const handlePackageChange = (e) => {
        const pkgId = e.target.value;
        const selectedPkg = packages?.find(p => String(p.id) === String(pkgId));
        setFormData(prev => ({
            ...prev,
            package_id: pkgId,
            package_price: selectedPkg ? selectedPkg.price : 0
        }));
    };

    // Submit Data + Upload
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            let savedId = formData.id;
            let apiPath = 'umh/v1/jamaah';
            
            // 1. Simpan Data Teks
            if (modalMode === 'create') {
                const res = await api.post(apiPath, formData);
                savedId = res.id;
            } else {
                await api.post(`${apiPath}/${savedId}`, formData);
            }

            if (!savedId) throw new Error("Gagal menyimpan data dasar.");

            // 2. Upload Dokumen (Jika ada file dipilih)
            const uploadPromises = [];
            if (files.ktp) uploadPromises.push(api.upload(files.ktp, 'scan_ktp', savedId));
            if (files.kk) uploadPromises.push(api.upload(files.kk, 'scan_kk', savedId));
            if (files.passport) uploadPromises.push(api.upload(files.passport, 'scan_passport', savedId));

            if (uploadPromises.length > 0) {
                setUploading(true);
                await Promise.all(uploadPromises);
                toast.success('Data dan dokumen berhasil disimpan!');
            } else {
                toast.success('Data berhasil disimpan!');
            }

            // Reset & Refresh
            setIsModalOpen(false);
            setFiles({ ktp: null, kk: null, passport: null });
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Terjadi kesalahan.');
        } finally {
            setUploading(false);
        }
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        if (item) {
            setFormData(item);
        } else {
            setFormData({ 
                full_name: '', nik: '', phone: '', 
                package_id: '', package_price: 0, status: 'registered',
                gender: 'L', city: ''
            });
        }
        setFiles({ ktp: null, kk: null, passport: null });
        setIsModalOpen(true);
    };

    const columns = [
        { header: 'Jemaah', accessor: 'full_name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.full_name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone size={10}/> {r.phone || '-'}
                </div>
                <div className="text-xs text-blue-600 mt-1">{r.package_name || 'Belum pilih paket'}</div>
            </div>
        )},
        { 
            header: 'Pembayaran (Progress)', 
            accessor: 'payment_percentage', 
            width: '200px',
            render: r => (
                <div className="w-full max-w-[180px]">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-700">{formatCurrency(r.total_paid)}</span>
                        <span className="text-gray-500">{r.payment_percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                                (r.payment_percentage || 0) >= 100 ? 'bg-green-500' : 
                                (r.payment_percentage || 0) > 0 ? 'bg-blue-500' : 'bg-gray-300'
                            }`} 
                            style={{ width: `${r.payment_percentage || 0}%` }}
                        ></div>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                        Tagihan: {formatCurrency(r.package_price)}
                    </div>
                </div>
            )
        },
        { header: 'Perlengkapan', accessor: 'logistics_status', render: r => (
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1 w-fit ${
                r.logistics_status === 'taken' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-orange-50 text-orange-700 border-orange-200'
            }`}>
                <Package size={10} />
                {r.logistics_status === 'taken' ? 'Lengkap' : 'Belum'}
            </span>
        )},
        { header: 'Status', accessor: 'status', render: r => (
             <span className={`px-2 py-1 rounded text-[10px] font-semibold uppercase ${
                r.status === 'registered' ? 'bg-blue-100 text-blue-700' : 
                r.status === 'lunas' ? 'bg-green-100 text-green-700' : 
                r.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}>
                {r.status}
            </span>
        )},
        { header: 'Dokumen', accessor: 'id', render: r => (
            <div className="flex gap-1">
                <DocumentBadge label="KTP" url={r.scan_ktp} />
                <DocumentBadge label="Paspor" url={r.scan_passport} />
            </div>
        )}
    ];

    return (
        <Layout title="Manajemen Jemaah">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                    <SearchInput 
                        placeholder="Cari nama, NIK, atau HP..." 
                        onSearch={handleSearch} 
                    />
                </div>
                <button onClick={() => openModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah Jemaah
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onDelete={deleteItem} 
                    onEdit={(item) => openModal('edit', item)} 
                />
                <Pagination 
                    pagination={pagination}
                    onPageChange={changePage}
                    onLimitChange={changeLimit}
                />
            </div>
            
            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Registrasi Jemaah Baru" : "Edit Data Jemaah"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Identitas */}
                    <div className="bg-gray-50 p-2 rounded border-b mb-2">
                        <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2"><User size={14}/> Identitas Diri</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="label">Nama Lengkap (Sesuai KTP/Paspor)</label>
                            <input className="input-field" value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} required placeholder="Nama Lengkap" />
                        </div>
                        <div><label className="label">NIK (KTP)</label><input className="input-field" value={formData.nik || ''} onChange={e => setFormData({...formData, nik: e.target.value})} /></div>
                        <div><label className="label">No. HP / WA</label><input className="input-field" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
                        <div>
                            <label className="label">Jenis Kelamin</label>
                            <select className="input-field" value={formData.gender || 'L'} onChange={e => setFormData({...formData, gender: e.target.value})}>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>
                        <div><label className="label">Kota Domisili</label><input className="input-field" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} /></div>
                    </div>

                    {/* Paket & Harga */}
                    <div className="bg-blue-50 p-3 rounded border border-blue-100 mt-4 mb-2">
                        <h4 className="font-bold text-sm text-blue-800 flex items-center gap-2"><CreditCard size={14}/> Paket & Harga</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="label">Pilih Paket</label>
                            <select className="input-field" value={formData.package_id || ''} onChange={handlePackageChange}>
                                <option value="">-- Pilih Paket Umrah/Haji --</option>
                                {packages && packages.map(pkg => (
                                    <option key={pkg.id} value={pkg.id}>{pkg.name} - {formatCurrency(pkg.price)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="label">Harga Deal (Rp)</label>
                            <input type="number" className="input-field font-semibold" value={formData.package_price || 0} onChange={e => setFormData({...formData, package_price: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">Status Keberangkatan</label>
                            <select className="input-field" value={formData.status || 'registered'} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="registered">Terdaftar</option>
                                <option value="documents_collected">Dokumen Lengkap</option>
                                <option value="visa_issued">Visa Terbit</option>
                                <option value="ready">Siap Berangkat</option>
                                <option value="completed">Selesai/Pulang</option>
                                <option value="cancelled">Batal</option>
                            </select>
                        </div>
                    </div>

                    {/* Upload Dokumen */}
                    <div className="bg-gray-100 p-3 rounded border border-gray-200 mt-4">
                        <h4 className="font-bold text-sm text-gray-700 flex items-center gap-2 mb-2"><Upload size={14}/> Upload Dokumen</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">KTP</span>
                                <input type="file" className="text-xs w-full" onChange={e => handleFileChange('ktp', e.target.files[0])} />
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">KK</span>
                                <input type="file" className="text-xs w-full" onChange={e => handleFileChange('kk', e.target.files[0])} />
                            </div>
                            <div>
                                <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Paspor</span>
                                <input type="file" className="text-xs w-full" onChange={e => handleFileChange('passport', e.target.files[0])} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary w-32" disabled={uploading}>
                            {uploading ? 'Mengupload...' : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

// Komponen Kecil untuk Badge Dokumen
const DocumentBadge = ({ label, url }) => {
    if (!url) return null;
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-white border border-gray-200 text-blue-600 text-[10px] hover:bg-blue-50 font-medium flex items-center gap-1 shadow-sm" title="Lihat Dokumen">
            <ExternalLink size={8} /> {label}
        </a>
    );
};

export default Jamaah;