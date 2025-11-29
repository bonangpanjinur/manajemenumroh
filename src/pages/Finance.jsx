import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Printer, Upload, CheckSquare, Square, Filter, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Finance = () => {
    // 1. Data Utama Finance
    const { 
        data, 
        loading, 
        pagination,
        fetchData, 
        deleteItem,
        changePage,
        changeLimit
    } = useCRUD('umh/v1/finance');

    // 2. Data Relasi untuk Dropdown
    const { data: jamaahList, fetchData: fetchJamaah } = useCRUD('umh/v1/jamaah');
    const { data: employeeList, fetchData: fetchEmployees } = useCRUD('umh/v1/hr');
    const { data: agentList, fetchData: fetchAgents } = useCRUD('umh/v1/agents');
    const { data: campaignList, fetchData: fetchCampaigns } = useCRUD('umh/v1/marketing');

    // State
    const [selectedIds, setSelectedIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [filters, setFilters] = useState({ type: '', category: '', startDate: '', endDate: '' });

    // Initial Load
    useEffect(() => {
        fetchData();
        fetchJamaah();
        fetchEmployees();
        fetchAgents();
        fetchCampaigns();
    }, []);

    // Initial Form State
    const initialForm = { 
        type: 'income', 
        date: new Date().toISOString().split('T')[0], 
        amount: 0, 
        category: 'pembayaran_paket', 
        jamaah_id: '', 
        employee_id: '',
        agent_id: '',
        campaign_id: '',
        description: '' 
    };
    const [formData, setFormData] = useState(initialForm);

    // Handle Filter Change
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        // Build query string for filter
        // Note: useCRUD fetchData supports custom url params if we implemented it, 
        // but for simplicity here we might just reload or pass params.
        // Assuming fetchData accepts (page, limit, search, customParams)
        // Let's just trigger refresh for now (backend need to support filter params)
        fetchData(1, pagination.limit, '', newFilters);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const loadingId = toast.loading('Menyimpan transaksi...');
        
        try {
            // Bersihkan data relasi yang tidak relevan dengan kategori
            const payload = { ...formData };
            if (payload.category !== 'pembayaran_paket') delete payload.jamaah_id;
            if (payload.category !== 'gaji') delete payload.employee_id;
            if (payload.category !== 'komisi_agen') delete payload.agent_id;
            if (payload.category !== 'marketing') delete payload.campaign_id;

            // 1. Simpan Data Transaksi
            const res = await api.post('umh/v1/finance', payload);
            const newId = res.id;

            // 2. Upload Bukti jika ada
            if (file && newId) {
                const uploadRes = await api.upload(file, 'proof_payment');
                if (uploadRes.url) {
                    await api.post(`umh/v1/finance/${newId}`, { proof_file: uploadRes.url });
                }
            }

            toast.success('Transaksi berhasil disimpan!', { id: loadingId });
            setIsModalOpen(false);
            setFormData(initialForm);
            setFile(null);
            fetchData();
        } catch (err) {
            toast.error('Gagal menyimpan: ' + err.message, { id: loadingId });
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleBulkPrint = () => {
        if (selectedIds.length === 0) return toast.error('Pilih minimal satu transaksi');
        const url = `${window.umhData.root}umh/v1/print/receipt?ids=${selectedIds.join(',')}&_wpnonce=${window.umhData.nonce}`;
        window.open(url, '_blank');
    };

    const handleSinglePrint = (id) => {
        const url = `${window.umhData.root}umh/v1/print/receipt?ids=${id}&_wpnonce=${window.umhData.nonce}`;
        window.open(url, '_blank');
    };

    const columns = [
        { 
            header: <div className="flex justify-center"><CheckSquare size={16}/></div>,
            accessor: 'id',
            render: (row) => (
                <div className="flex justify-center cursor-pointer" onClick={() => toggleSelect(row.id)}>
                    {selectedIds.includes(row.id) 
                        ? <CheckSquare size={18} className="text-blue-600" /> 
                        : <Square size={18} className="text-gray-300" />}
                </div>
            )
        },
        { header: 'Tanggal', accessor: 'date', render: r => formatDate(r.date) },
        { header: 'Kategori', accessor: 'category', render: r => <span className="capitalize">{r.category?.replace(/_/g, ' ')}</span> },
        { 
            header: 'Relasi', 
            accessor: 'relation', 
            render: r => {
                if (r.jamaah_name) return <div className="text-xs font-medium text-blue-600">Jemaah: {r.jamaah_name}</div>;
                if (r.employee_name) return <div className="text-xs font-medium text-purple-600">Staff: {r.employee_name}</div>;
                if (r.agent_name) return <div className="text-xs font-medium text-orange-600">Agen: {r.agent_name}</div>;
                if (r.campaign_name) return <div className="text-xs font-medium text-pink-600">Iklan: {r.campaign_name}</div>;
                return <span className="text-gray-400">-</span>;
            } 
        },
        { header: 'Nominal', accessor: 'amount', className: 'text-right', render: r => (
            <span className={`font-bold ${r.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {r.type === 'income' ? '+' : '-'} {formatCurrency(r.amount)}
            </span>
        )},
        { header: 'Bukti', accessor: 'proof_file', render: r => r.proof_file ? <a href={r.proof_file} target="_blank" className="text-blue-500 underline text-xs flex items-center gap-1"><Upload size={10}/> Lihat</a> : '-' },
        { 
            header: 'Aksi', accessor: 'actions', 
            render: r => r.type === 'income' && (
                <button onClick={() => handleSinglePrint(r.id)} className="text-gray-600 hover:text-blue-600" title="Cetak Kwitansi">
                    <Printer size={16}/>
                </button>
            )
        }
    ];

    return (
        <Layout title="Keuangan & Kasir">
            {/* Toolbar Filter */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 items-center w-full md:w-auto overflow-x-auto">
                    <div className="flex items-center gap-2 border px-3 py-2 rounded-md bg-gray-50">
                        <Filter size={16} className="text-gray-500"/>
                        <select className="bg-transparent text-sm outline-none" onChange={e => handleFilterChange('type', e.target.value)}>
                            <option value="">Semua Tipe</option>
                            <option value="income">Pemasukan</option>
                            <option value="expense">Pengeluaran</option>
                        </select>
                    </div>
                    
                    {selectedIds.length > 0 && (
                        <button onClick={handleBulkPrint} className="bg-gray-800 text-white px-3 py-2 rounded text-sm flex items-center gap-2 hover:bg-gray-900 transition shadow-sm">
                            <Printer size={14}/> Cetak ({selectedIds.length})
                        </button>
                    )}
                </div>

                <button onClick={() => { setFormData(initialForm); setIsModalOpen(true); }} className="btn-primary flex gap-2">
                    <Plus size={20}/> Transaksi Baru
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onDelete={deleteItem} 
                />
                <Pagination 
                    pagination={pagination}
                    onPageChange={changePage}
                    onLimitChange={changeLimit}
                />
            </div>

            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Catat Transaksi">
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Jenis Transaksi</label>
                            <select className="input-field font-medium" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="income">Pemasukan (In)</option>
                                <option value="expense">Pengeluaran (Out)</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Tanggal</label>
                            <input type="date" className="input-field" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                        </div>
                    </div>
                    
                    <div>
                        <label className="label">Kategori</label>
                        <select className="input-field" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option value="pembayaran_paket">Pembayaran Paket Jemaah</option>
                            <option value="operasional">Biaya Operasional</option>
                            <option value="gaji">Gaji Karyawan</option>
                            <option value="marketing">Biaya Marketing / Iklan</option>
                            <option value="komisi_agen">Komisi Agen</option>
                            <option value="lainnya">Lainnya</option>
                        </select>
                    </div>

                    {/* Dynamic Relation Fields */}
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 animate-fade-in">
                        {formData.category === 'pembayaran_paket' && (
                            <div>
                                <label className="label text-blue-700">Pilih Jemaah</label>
                                <select className="input-field" value={formData.jamaah_id} onChange={e => setFormData({...formData, jamaah_id: e.target.value})} required>
                                    <option value="">-- Cari Jemaah --</option>
                                    {jamaahList?.map(j => <option key={j.id} value={j.id}>{j.full_name}</option>)}
                                </select>
                            </div>
                        )}

                        {formData.category === 'gaji' && (
                            <div>
                                <label className="label text-purple-700">Pilih Karyawan</label>
                                <select className="input-field" value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} required>
                                    <option value="">-- Cari Karyawan --</option>
                                    {employeeList?.map(e => <option key={e.id} value={e.id}>{e.name} - {e.position}</option>)}
                                </select>
                            </div>
                        )}

                        {formData.category === 'komisi_agen' && (
                            <div>
                                <label className="label text-orange-700">Pilih Agen</label>
                                <select className="input-field" value={formData.agent_id} onChange={e => setFormData({...formData, agent_id: e.target.value})} required>
                                    <option value="">-- Cari Agen --</option>
                                    {agentList?.map(a => <option key={a.id} value={a.id}>{a.name} ({a.city})</option>)}
                                </select>
                            </div>
                        )}

                        {formData.category === 'marketing' && (
                            <div>
                                <label className="label text-pink-700">Pilih Kampanye Iklan</label>
                                <select className="input-field" value={formData.campaign_id} onChange={e => setFormData({...formData, campaign_id: e.target.value})} required>
                                    <option value="">-- Cari Kampanye --</option>
                                    {campaignList?.map(c => <option key={c.id} value={c.id}>{c.title} ({c.platform})</option>)}
                                </select>
                            </div>
                        )}
                        
                        {['operasional', 'lainnya'].includes(formData.category) && (
                            <p className="text-xs text-gray-500 italic">Kategori ini tidak memerlukan relasi data khusus.</p>
                        )}
                    </div>

                    <div>
                        <label className="label">Nominal (Rp)</label>
                        <input type="number" className="input-field font-bold text-lg" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
                    </div>

                    <div>
                        <label className="label">Keterangan</label>
                        <textarea className="input-field" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Catatan tambahan..."></textarea>
                    </div>
                    
                    <div className="border-t pt-3">
                        <label className="label flex items-center gap-2 text-gray-700"><Upload size={16}/> Upload Bukti Transfer (Opsional)</label>
                        <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" onChange={e => setFile(e.target.files[0])} accept="image/*,application/pdf" />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary w-32">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Finance;