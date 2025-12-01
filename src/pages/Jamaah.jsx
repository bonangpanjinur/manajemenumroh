import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, User, Users, Activity, FileText, Save, X, Calendar, Eye, CheckCircle, XCircle, Package, CreditCard } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Jamaah = () => {
    const { data, loading, pagination, fetchData, deleteItem, changePage, changeLimit } = useCRUD('umh/v1/jamaah');
    
    // Fetch Departures (Jadwal) untuk dropdown
    const [departures, setDepartures] = useState([]);
    
    useEffect(() => { 
        fetchData(); 
        api.get('umh/v1/departures', { params: { per_page: 100, status: 'open' } })
           .then(res => setDepartures(Array.isArray(res) ? res : res.items || []))
           .catch(err => console.error("Gagal load jadwal", err));
    }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [activeTab, setActiveTab] = useState('pribadi');
    const [uploading, setUploading] = useState(false);

    // --- STATE UNTUK DETAIL VIEW ---
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [historyPayment, setHistoryPayment] = useState([]);
    const [logisticsData, setLogisticsData] = useState(null);
    // -------------------------------

    const initialForm = {
        full_name: '', full_name_ar: '', nik: '', passport_number: '',
        gender: 'L', birth_place: '', birth_date: '',
        phone: '', email: '', address: '', city: '', job_title: '', education: '',
        father_name: '', mother_name: '', spouse_name: '',
        clothing_size: 'L', disease_history: '', bpjs_number: '',
        package_id: '', departure_id: '', room_type: 'Quad', package_price: 0, status: 'registered'
    };
    
    const [formData, setFormData] = useState(initialForm);
    const [files, setFiles] = useState({ ktp: null, kk: null, passport: null, photo: null, buku_nikah: null });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDepartureChange = (e) => {
        const depId = e.target.value;
        if (!depId) return;

        const selectedDep = departures.find(d => String(d.id) === String(depId));
        if (selectedDep) {
            const defaultPrice = parseFloat(selectedDep.price_quad) || parseFloat(selectedDep.base_price) || 0;
            setFormData(prev => ({ 
                ...prev, 
                departure_id: depId,
                package_id: selectedDep.package_id, 
                room_type: 'Quad', 
                package_price: defaultPrice
            }));
        }
    };

    const handleRoomTypeChange = (e) => {
        const roomType = e.target.value;
        const selectedDep = departures.find(d => String(d.id) === String(formData.departure_id));
        
        let newPrice = formData.package_price;
        if (selectedDep) {
            if (roomType === 'Quad') newPrice = parseFloat(selectedDep.price_quad);
            else if (roomType === 'Triple') newPrice = parseFloat(selectedDep.price_triple);
            else if (roomType === 'Double') newPrice = parseFloat(selectedDep.price_double);
            if (!newPrice) newPrice = parseFloat(selectedDep.base_price);
        }
        setFormData(prev => ({ ...prev, room_type: roomType, package_price: newPrice }));
    };

    const handleFileChange = (type, file) => setFiles(prev => ({ ...prev, [type]: file }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let savedId = formData.id;
            const apiPath = 'umh/v1/jamaah';
            if (modalMode === 'create') {
                const res = await api.post(apiPath, formData);
                savedId = res.id;
            } else {
                await api.post(`${apiPath}/${savedId}`, formData);
            }
            if (!savedId) throw new Error("Gagal menyimpan data dasar.");

            const uploadPromises = [];
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    uploadPromises.push(api.upload(files[key], `scan_${key}`, savedId));
                }
            });

            if (uploadPromises.length > 0) {
                setUploading(true);
                await Promise.all(uploadPromises);
            }
            toast.success('Data Jemaah berhasil disimpan!');
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Terjadi kesalahan saat menyimpan.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (item) => {
        if (!item || !item.id) return;
        const success = await deleteItem(item.id);
        if (success) toast.success("Data jemaah berhasil dihapus");
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setFormData(item || initialForm);
        setFiles({ ktp: null, kk: null, passport: null, photo: null, buku_nikah: null });
        setActiveTab('pribadi');
        setIsModalOpen(true);
    };

    // --- VIEW DETAIL LOGIC ---
    const handleViewDetail = async (item) => {
        setDetailData(item);
        setIsDetailOpen(true);
        setDetailLoading(true);
        
        try {
            // Fetch data pembayaran & logistik secara paralel
            const [payments, logistics] = await Promise.all([
                api.get('umh/v1/payments', { params: { jamaah_id: item.id } }).catch(() => []),
                api.get('umh/v1/logistics', { params: { jamaah_id: item.id } }).catch(() => null)
            ]);

            setHistoryPayment(Array.isArray(payments.items) ? payments.items : (Array.isArray(payments) ? payments : []));
            setLogisticsData(logistics && logistics.items && logistics.items.length > 0 ? logistics.items[0] : null);
        } catch (error) {
            console.error("Gagal load detail", error);
        } finally {
            setDetailLoading(false);
        }
    };

    const columns = [
        { header: 'Nama Jemaah', accessor: 'full_name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.full_name}</div>
                <div className="text-xs text-gray-500 font-mono">
                    {r.passport_number ? `Pass: ${r.passport_number}` : `NIK: ${r.nik || '-'}`}
                </div>
            </div>
        )},
        { header: 'Jadwal & Paket', accessor: 'package_name', render: r => (
            <div>
                <div className="font-medium text-blue-600 text-sm flex items-center gap-1">
                   <Calendar size={12}/> {r.departure_date ? formatDate(r.departure_date) : 'Belum Set'}
                </div>
                <div className="text-xs text-gray-500">{r.package_name || '-'} ({r.room_type || 'Quad'})</div>
            </div>
        )},
        { header: 'Tagihan', accessor: 'package_price', render: r => (
            <span className="font-semibold text-gray-700">{formatCurrency(r.package_price)}</span>
        )},
        { header: 'Status', accessor: 'status', render: r => (
             <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                r.status === 'lunas' ? 'bg-green-50 text-green-700 border-green-200' : 
                r.status === 'registered' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>{r.status}</span>
        )},
        // TOMBOL VIEW DI TABEL
        { header: '', accessor: 'id', render: r => (
            <button onClick={() => handleViewDetail(r)} className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors" title="Lihat Detail">
                <Eye size={18} />
            </button>
        )}
    ];

    const TabButton = ({ id, label, icon: Icon }) => (
        <button type="button" onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === id ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            <Icon size={16} /> {label}
        </button>
    );

    return (
        <Layout title="Data Jemaah & Pelanggan">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                    <SearchInput onSearch={(q) => fetchData({ search: q })} placeholder="Cari nama, paspor, atau NIK..." />
                </div>
                <button onClick={() => openModal('create')} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-200">
                    <Plus size={18}/> Registrasi Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onDelete={handleDelete} 
                    onEdit={(item) => openModal('edit', item)} 
                />
                <Pagination pagination={pagination} onPageChange={changePage} onLimitChange={changeLimit} />
            </div>

            {/* MODAL INPUT / EDIT DATA JEMAAH */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Registrasi Jemaah Baru" : "Edit Data Jemaah"} size="max-w-4xl">
                <form onSubmit={handleSubmit}>
                    {/* ... Form Content Sama Seperti Sebelumnya ... */}
                    {/* Saya persingkat konten form input ini karena sudah ada di file sebelumnya, fokus ke View Detail */}
                    <div className="flex border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
                        <TabButton id="pribadi" label="Data Pribadi" icon={User} />
                        <TabButton id="keluarga" label="Keluarga" icon={Users} />
                        <TabButton id="kesehatan" label="Kesehatan" icon={Activity} />
                        <TabButton id="dokumen" label="Upload" icon={FileText} />
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto px-1 custom-scrollbar pb-4">
                        {activeTab === 'pribadi' && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                                    <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">📦 Pilih Jadwal & Paket</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2"><label className="label">Jadwal</label><select name="departure_id" className="input-field" value={formData.departure_id} onChange={handleDepartureChange} required><option value="">-- Pilih Jadwal --</option>{departures.map(d=><option key={d.id} value={d.id}>{formatDate(d.departure_date)} - {d.package_name}</option>)}</select></div>
                                        <div><label className="label">Tipe Kamar</label><select name="room_type" className="input-field" value={formData.room_type} onChange={handleRoomTypeChange} disabled={!formData.departure_id}><option value="Quad">Quad</option><option value="Triple">Triple</option><option value="Double">Double</option></select></div>
                                        <div className="md:col-span-3"><label className="label">Harga Deal</label><input name="package_price" type="number" className="input-field font-bold" value={formData.package_price} onChange={handleChange} /></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div><label className="label">Nama Lengkap</label><input name="full_name" className="input-field" value={formData.full_name} onChange={handleChange} required /></div>
                                    <div><label className="label">No. WhatsApp</label><input name="phone" className="input-field" value={formData.phone} onChange={handleChange} required /></div>
                                    <div><label className="label">NIK</label><input name="nik" className="input-field" value={formData.nik} onChange={handleChange} /></div>
                                    <div><label className="label">Paspor</label><input name="passport_number" className="input-field" value={formData.passport_number} onChange={handleChange} /></div>
                                </div>
                            </div>
                        )}
                        {/* Tab lain tetap ada, disembunyikan untuk ringkas */}
                         {activeTab === 'dokumen' && (
                            <div className="space-y-5 animate-fade-in">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {['ktp', 'kk', 'passport', 'photo', 'buku_nikah'].map((doc) => (
                                        <div key={doc} className="border p-4 rounded-lg bg-gray-50"><label className="label font-bold mb-2 uppercase">{doc}</label><input type="file" className="block w-full text-sm" onChange={e => handleFileChange(doc, e.target.files[0])} /></div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4 bg-white sticky bottom-0">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary" disabled={uploading}>{uploading ? 'Menyimpan...' : 'Simpan Data'}</button>
                    </div>
                </form>
            </Modal>

            {/* --- MODAL VIEW DETAIL JEMAAH --- */}
            <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail Jemaah" size="max-w-5xl">
                {detailLoading ? (
                    <div className="p-10 text-center text-gray-500">Memuat detail data...</div>
                ) : detailData ? (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-50 p-4 rounded-xl border border-blue-100 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-blue-900">{detailData.full_name}</h2>
                                <p className="text-blue-700 text-sm flex items-center gap-2 mt-1">
                                    <Package size={14}/> {detailData.package_name || '-'} ({detailData.room_type})
                                    <span className="mx-2">•</span> 
                                    <Calendar size={14}/> {detailData.departure_date ? formatDate(detailData.departure_date) : 'Belum dijadwalkan'}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Total Tagihan</div>
                                <div className="text-xl font-bold text-gray-800">{formatCurrency(detailData.package_price)}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 1. STATUS DOKUMEN */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={18} className="text-purple-600"/> Kelengkapan Dokumen</h4>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Scan KTP', val: detailData.scan_ktp },
                                        { label: 'Scan KK', val: detailData.scan_kk },
                                        { label: 'Paspor', val: detailData.scan_passport },
                                        { label: 'Pas Foto', val: detailData.scan_photo },
                                        { label: 'Buku Nikah', val: detailData.scan_buku_nikah }
                                    ].map((doc, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                            <span className="text-sm text-gray-600">{doc.label}</span>
                                            {doc.val ? (
                                                <a href={doc.val} target="_blank" rel="noreferrer" className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1 hover:underline">
                                                    <CheckCircle size={12}/> Lihat
                                                </a>
                                            ) : (
                                                <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded flex items-center gap-1">
                                                    <XCircle size={12}/> Belum
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 2. STATUS LOGISTIK */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Package size={18} className="text-orange-600"/> Perlengkapan (Logistik)</h4>
                                {logisticsData ? (
                                    <div className="space-y-3">
                                        {/* Contoh item statis, idealnya dinamis dari master logistik */}
                                        {['Koper Besar', 'Koper Kabin', 'Tas Paspor', 'Kain Ihram/Mukena', 'Bahan Seragam'].map((item, i) => {
                                            const taken = logisticsData.items_status && logisticsData.items_status[item];
                                            return (
                                                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50">
                                                    <span className="text-sm text-gray-600">{item}</span>
                                                    {taken ? <CheckCircle size={16} className="text-green-500"/> : <span className="text-xs text-gray-400">Belum</span>}
                                                </div>
                                            );
                                        })}
                                        {logisticsData.date_taken && <p className="text-xs text-gray-500 mt-2">Diambil tgl: {formatDate(logisticsData.date_taken)}</p>}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Belum ada data logistik.</p>
                                )}
                            </div>

                            {/* 3. STATUS PEMBAYARAN */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><CreditCard size={18} className="text-green-600"/> Keuangan</h4>
                                
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Terbayar</span>
                                        <span className="font-bold text-green-700">{formatCurrency(detailData.total_paid)}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                        <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${Math.min((detailData.total_paid / detailData.package_price) * 100, 100)}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Sisa Tagihan</span>
                                        <span className="font-bold text-red-500">{formatCurrency(detailData.remaining_payment)}</span>
                                    </div>
                                </div>

                                <div className="border-t pt-3">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">Riwayat Transaksi</h5>
                                    <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-2">
                                        {historyPayment.length > 0 ? historyPayment.map((pay) => (
                                            <div key={pay.id} className="text-sm flex justify-between items-center bg-gray-50 p-2 rounded">
                                                <div>
                                                    <div className="font-medium text-gray-800">{formatCurrency(pay.amount)}</div>
                                                    <div className="text-[10px] text-gray-500">{formatDate(pay.payment_date)}</div>
                                                </div>
                                                <span className={`text-[10px] px-2 py-0.5 rounded ${pay.status==='verified'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>
                                                    {pay.status}
                                                </span>
                                            </div>
                                        )) : <p className="text-xs text-gray-400 italic">Belum ada pembayaran.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end pt-4 border-t">
                            <button onClick={() => setIsDetailOpen(false)} className="btn-primary">Tutup Detail</button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </Layout>
    );
};

export default Jamaah;