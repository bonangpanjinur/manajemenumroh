import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import useCRUD from '../hooks/useCRUD';
import { Plus, Users, UserCheck, CreditCard, MapPin } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const Agents = () => {
    // Destructure lengkap termasuk pagination
    const { 
        data, 
        loading, 
        pagination,
        fetchData, 
        createItem, 
        updateItem, 
        deleteItem,
        changePage,
        changeLimit
    } = useCRUD('umh/v1/agents');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Filter Master Agent dari data yang ada
    const masterAgents = data ? data.filter(a => a.type === 'master') : [];
    
    // Initial Form State
    const initialForm = { 
        name: '', 
        phone: '', 
        email: '',
        city: '', 
        address: '',
        type: 'master', 
        parent_id: '', 
        commission_nominal: 0,
        bank_name: '',
        bank_account: ''
    };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSearch = (q) => {
        setSearchQuery(q);
        fetchData(1, pagination.limit, q);
    };

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || initialForm);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData, parent_id: formData.type === 'master' ? null : formData.parent_id };
        const success = modalMode === 'create' ? await createItem(payload) : await updateItem(currentItem.id, payload);
        if (success) setIsModalOpen(false);
    };

    const columns = [
        { header: 'Nama Agen', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.name}</div>
                <div className="text-xs text-gray-500">{r.code || '-'}</div>
            </div>
        )},
        { header: 'Tipe', accessor: 'type', render: r => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${r.type === 'master' ? 'bg-purple-100 text-purple-800' : 'bg-blue-50 text-blue-600'}`}>
                {r.type === 'master' ? 'Master Agen' : 'Sub Agen'}
            </span>
        )},
        { header: 'Kontak', accessor: 'phone', render: r => (
            <div>
                <div className="text-sm">{r.phone}</div>
                <div className="text-xs text-gray-500">{r.email}</div>
            </div>
        )},
        { header: 'Domisili', accessor: 'city' },
        { header: 'Komisi', accessor: 'commission_nominal', render: r => (
            <span className="font-medium text-green-600">{formatCurrency(r.commission_nominal)}</span>
        )}
    ];

    return (
        <Layout title="Agen & Kemitraan">
            {/* Toolbar Area */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                    <SearchInput 
                        placeholder="Cari nama, kode, atau kota..." 
                        onSearch={handleSearch} 
                    />
                </div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Tambah Agen Baru
                </button>
            </div>
            
            {/* Table Area */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={item => handleOpenModal('edit', item)} 
                    onDelete={deleteItem} 
                />
                <Pagination 
                    pagination={pagination}
                    onPageChange={changePage}
                    onLimitChange={changeLimit}
                />
            </div>
            
            {/* Modal Form */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Tambah Agen Baru" : "Edit Data Agen"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Data Diri */}
                    <div className="bg-gray-50 p-2 rounded border-b mb-2">
                        <h4 className="font-bold text-sm text-gray-700">Identitas & Kontak</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="label">Nama Lengkap</label>
                            <input className="input-field" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Nama Agen / Travel" />
                        </div>
                        <div>
                            <label className="label">No. HP / WA</label>
                            <input className="input-field" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} required placeholder="08..." />
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input type="email" className="input-field" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@contoh.com" />
                        </div>
                    </div>
                    
                    {/* Alamat */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Kota Domisili</label>
                            <input className="input-field" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Nama Kota" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label">Alamat Lengkap</label>
                            <textarea className="input-field" rows="2" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Alamat lengkap kantor/rumah..."></textarea>
                        </div>
                    </div>
                    
                    {/* Kemitraan */}
                    <div className="bg-gray-50 p-2 rounded border-b mt-4 mb-2">
                        <h4 className="font-bold text-sm text-gray-700">Status Kemitraan</h4>
                    </div>

                    <div>
                        <label className="label">Tipe Kemitraan</label>
                        <div className="flex gap-4 mb-2">
                            <label className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                                <input type="radio" name="type" value="master" checked={formData.type === 'master'} onChange={e => setFormData({...formData, type: e.target.value})} />
                                <span className="text-sm font-medium">Master Agen (Pusat)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                                <input type="radio" name="type" value="sub" checked={formData.type === 'sub'} onChange={e => setFormData({...formData, type: e.target.value})} />
                                <span className="text-sm font-medium">Sub Agen (Bawahan)</span>
                            </label>
                        </div>
                    </div>

                    {formData.type === 'sub' && (
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 animate-fade-in">
                            <label className="label text-yellow-800">Induk Agen (Upline)</label>
                            <select className="input-field" value={formData.parent_id || ''} onChange={e => setFormData({...formData, parent_id: e.target.value})} required>
                                <option value="">-- Pilih Master Agen --</option>
                                {masterAgents.map(a => (
                                    <option key={a.id} value={a.id}>{a.name} - {a.city}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Komisi & Bank */}
                    <div className="bg-gray-50 p-2 rounded border-b mt-4 mb-2">
                        <h4 className="font-bold text-sm text-gray-700">Keuangan</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label">Komisi per Jemaah (Rp)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500 text-sm font-bold">Rp</span>
                                <input 
                                    type="number" 
                                    className="input-field pl-10 font-bold text-gray-800" 
                                    value={formData.commission_nominal || 0} 
                                    onChange={e => setFormData({...formData, commission_nominal: e.target.value})} 
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="hidden md:block"></div> {/* Spacer */}
                        
                        <div>
                            <label className="label">Nama Bank</label>
                            <input className="input-field" value={formData.bank_name || ''} onChange={e => setFormData({...formData, bank_name: e.target.value})} placeholder="BCA / Mandiri / BSI" />
                        </div>
                        <div>
                            <label className="label">No. Rekening</label>
                            <input className="input-field font-mono" value={formData.bank_account || ''} onChange={e => setFormData({...formData, bank_account: e.target.value})} placeholder="1234xxxxxx" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary w-32">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Agents;