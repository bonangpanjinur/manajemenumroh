import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, UserCheck, Phone, CreditCard } from 'lucide-react';

const Agents = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/agents');
    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    
    // Form disesuaikan untuk kebutuhan bisnis (Komisi & Bank)
    const initialForm = { 
        name: '', email: '', phone: '', 
        agency_name: '', // Nama Travel/Biro jika agen korporat
        level: 'silver', // silver, gold, platinum
        commission_rate: 0, // dalam Rupiah atau Persen
        bank_name: '', bank_number: '', bank_holder: '',
        status: 'active'
    };
    const [formData, setFormData] = useState(initialForm);

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode); 
        setCurrentItem(item);
        setFormData(item || initialForm);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Agen', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.name}</div>
                <div className="text-xs text-gray-500">{r.agency_name || 'Perorangan'}</div>
            </div>
        )},
        { header: 'Kontak', accessor: 'phone', render: r => (
            <div className="text-sm">
                <div className="flex items-center gap-1"><Phone size={12}/> {r.phone}</div>
                <div className="text-gray-500 text-xs">{r.email}</div>
            </div>
        )},
        { header: 'Level', accessor: 'level', render: r => (
            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase 
                ${r.level === 'platinum' ? 'bg-purple-100 text-purple-700' : 
                  r.level === 'gold' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                {r.level}
            </span>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`text-xs font-medium ${r.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                {r.status === 'active' ? 'Aktif' : 'Non-Aktif'}
            </span>
        )}
    ];

    return (
        <Layout title="Manajemen Agen & Mitra">
            <div className="mb-4 flex justify-end">
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex gap-2">
                    <Plus size={18}/> Tambah Agen Baru
                </button>
            </div>
            
            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Registrasi Agen" : "Edit Data Agen"} size="max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Data Personal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="label">Nama Lengkap</label><input className="input-field" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} required /></div>
                        <div><label className="label">Nama Travel/Agency (Opsional)</label><input className="input-field" value={formData.agency_name} onChange={e=>setFormData({...formData, agency_name: e.target.value})} /></div>
                        <div><label className="label">No. WhatsApp</label><input className="input-field" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} required /></div>
                        <div><label className="label">Email</label><input type="email" className="input-field" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} /></div>
                    </div>

                    {/* Data Kemitraan */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><UserCheck size={16}/> Status Kemitraan</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <label className="label">Level Agen</label>
                                <select className="input-field" value={formData.level} onChange={e=>setFormData({...formData, level: e.target.value})}>
                                    <option value="silver">Silver (Standard)</option>
                                    <option value="gold">Gold</option>
                                    <option value="platinum">Platinum</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Fee / Komisi (Rp)</label>
                                <input type="number" className="input-field" value={formData.commission_rate} onChange={e=>setFormData({...formData, commission_rate: e.target.value})} placeholder="Contoh: 500000" />
                            </div>
                            <div>
                                <label className="label">Status Akun</label>
                                <select className="input-field" value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})}>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Non-Aktif</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Data Bank */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2"><CreditCard size={16}/> Rekening Pencairan Komisi</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="label">Nama Bank</label><input className="input-field" value={formData.bank_name} onChange={e=>setFormData({...formData, bank_name: e.target.value})} placeholder="BCA, Mandiri, dll" /></div>
                            <div><label className="label">Nomor Rekening</label><input className="input-field" value={formData.bank_number} onChange={e=>setFormData({...formData, bank_number: e.target.value})} /></div>
                            <div><label className="label">Atas Nama</label><input className="input-field" value={formData.bank_holder} onChange={e=>setFormData({...formData, bank_holder: e.target.value})} /></div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={()=>setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Data Agen</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Agents;