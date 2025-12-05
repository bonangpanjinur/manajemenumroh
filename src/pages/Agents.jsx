import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Users, Building, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const Agents = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/agents');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/agents', form);
            else await api.put(`umh/v1/agents/${form.id}`, form);
            
            toast.success("Data Agen Berhasil Disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Gagal menyimpan data");
        }
    };

    const handleEdit = (item) => {
        setForm(item);
        setMode('edit');
        setIsModalOpen(true);
    };

    const columns = [
        { header: 'Nama Agen', accessor: 'name', render: (row) => (
            <div>
                <div className="font-bold text-gray-900">{row.name}</div>
                <div className="text-xs text-gray-500">{row.agency_name || 'Perorangan'}</div>
            </div>
        )},
        { header: 'Kontak', accessor: 'contact', render: (row) => (
            <div className="text-sm">
                <div>{row.phone}</div>
                <div className="text-gray-500">{row.email}</div>
            </div>
        )},
        { header: 'Bank', accessor: 'bank', render: r => (
            <div className="text-xs text-gray-600">
                {r.bank_name ? `${r.bank_name} - ${r.bank_account_number}` : '-'}
            </div>
        )},
        { header: 'Tipe', accessor: 'type', render: (row) => (
            <span className={`px-2 py-1 rounded text-xs font-bold ${
                row.type === 'master' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
                {row.type ? row.type.toUpperCase() : '-'}
            </span>
        )},
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Manajemen Agen</h1>
                        <p className="text-gray-500 text-sm">Kelola data agen, kemitraan, dan komisi.</p>
                    </div>
                </div>
                <button onClick={() => { setForm({ type: 'master' }); setMode('create'); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Tambah Agen
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={handleEdit} onDelete={(item) => deleteItem(item.id)} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Tambah Agen Baru" : "Edit Data Agen"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Data Pribadi */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Nama Lengkap</label>
                            <input className="input-field" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required />
                        </div>
                        <div>
                            <label className="label">Nama Travel / Agensi</label>
                            <input className="input-field" value={form.agency_name || ''} onChange={e => setForm({...form, agency_name: e.target.value})} placeholder="Opsional" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Email</label>
                            <input className="input-field" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">No. Telepon</label>
                            <input className="input-field" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Kota Domisili</label>
                            <input className="input-field" value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">Tipe Kemitraan</label>
                            <select className="input-field" value={form.type || 'master'} onChange={e => setForm({...form, type: e.target.value})}>
                                <option value="master">Master Agen</option>
                                <option value="agent">Agen Biasa</option>
                                <option value="freelance">Freelance</option>
                            </select>
                        </div>
                    </div>

                    {/* Data Bank */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2"><CreditCard size={14}/> Rekening Komisi</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <input className="input-field text-sm" placeholder="Nama Bank" value={form.bank_name || ''} onChange={e => setForm({...form, bank_name: e.target.value})} />
                            </div>
                            <div className="col-span-2">
                                <input className="input-field text-sm" placeholder="No. Rekening" value={form.bank_account_number || ''} onChange={e => setForm({...form, bank_account_number: e.target.value})} />
                            </div>
                            <div className="col-span-3">
                                <input className="input-field text-sm" placeholder="Atas Nama" value={form.bank_account_holder || ''} onChange={e => setForm({...form, bank_account_holder: e.target.value})} />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4 mt-2 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Agents;