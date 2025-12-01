import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Roles = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/roles');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [modalMode, setModalMode] = useState('create'); // create | edit
    
    // Capabilities standar
    const availableCaps = [
        { id: 'read', label: 'Read (Baca Data)' },
        { id: 'edit_posts', label: 'Edit Data' },
        { id: 'upload_files', label: 'Upload File' },
        { id: 'manage_options', label: 'Kelola Pengaturan' },
        { id: 'manage_agents', label: 'Kelola Agen' },
        { id: 'manage_finance', label: 'Kelola Keuangan' },
        { id: 'manage_hr', label: 'Kelola SDM' },
    ];

    // State Form: Gunakan nama field sesuai Database (role_key, role_name)
    const [formData, setFormData] = useState({
        role_key: '',    // slug (unik)
        role_name: '',   // display name
        capabilities: {} 
    });

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCheckboxChange = (capId) => {
        setFormData(prev => ({
            ...prev,
            capabilities: {
                ...prev.capabilities,
                [capId]: !prev.capabilities[capId]
            }
        }));
    };

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);

        if (item) {
            // Mode Edit: Parse capabilities jika masih string JSON dari DB
            let caps = item.capabilities;
            if (typeof caps === 'string') {
                try { caps = JSON.parse(caps); } catch (e) { caps = {}; }
            }
            
            setFormData({
                role_key: item.role_key,
                role_name: item.role_name,
                capabilities: caps || {}
            });
        } else {
            // Mode Create
            setFormData({ role_key: '', role_name: '', capabilities: {} });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Auto-generate role_key dari role_name jika kosong (hanya saat create)
        if (modalMode === 'create' && !formData.role_key && formData.role_name) {
            formData.role_key = formData.role_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        }

        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData); // Gunakan ID untuk update

        if (success) {
            setIsModalOpen(false);
            fetchData();
        }
    };

    const handleDelete = async (item) => {
        // Proteksi role Administrator
        if (item.role_key === 'administrator' || item.role_key === 'owner') {
            toast.error("Role utama tidak dapat dihapus!");
            return;
        }
        await deleteItem(item.id); // Gunakan ID untuk hapus
    };

    // Definisi Kolom Tabel (Sesuai DB: role_name, role_key)
    const columns = [
        { header: 'Nama Peran', accessor: 'role_name', className: 'font-bold text-gray-800' },
        { header: 'Slug (ID)', accessor: 'role_key', render: r => <code className="bg-gray-100 px-2 py-1 rounded text-xs text-red-500">{r.role_key}</code> },
        { header: 'Akses Utama', accessor: 'capabilities', render: r => {
            // Parsing aman capabilities
            let caps = r.capabilities;
            if (typeof caps === 'string') {
                try { caps = JSON.parse(caps); } catch(e) { caps = {}; }
            }
            const activeCaps = Object.keys(caps || {}).filter(k => caps[k]).length;
            return <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">{activeCaps} akses aktif</span>;
        }},
    ];

    return (
        <Layout title="Manajemen Peran & Akses">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Peran Pengguna (Roles)</h2>
                    <p className="text-sm text-gray-500">Buat peran khusus untuk staf, agen, atau manajer.</p>
                </div>
                <button onClick={() => handleOpenModal('create')} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2">
                    <Shield size={18} /> Buat Peran Baru
                </button>
            </div>

            {loading ? <Spinner /> : (
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    onEdit={(item) => handleOpenModal('edit', item)} 
                    onDelete={handleDelete} 
                />
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Peran Baru" : "Edit Peran"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tampilan</label>
                            <input 
                                className="input-field" 
                                value={formData.role_name} 
                                onChange={e => setFormData({...formData, role_name: e.target.value})} 
                                required 
                                placeholder="Contoh: Staf Keuangan" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug / ID (Unik)</label>
                            <input 
                                className="input-field bg-gray-50" 
                                value={formData.role_key} 
                                onChange={e => setFormData({...formData, role_key: e.target.value})} 
                                disabled={modalMode === 'edit'} // Slug tidak boleh diedit
                                placeholder="finance_staff" 
                            />
                            {modalMode === 'edit' && <p className="text-[10px] text-gray-400 mt-1">Slug ID tidak dapat diubah.</p>}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <Lock size={16} className="text-blue-600"/> Hak Akses (Capabilities)
                        </label>
                        <div className="grid grid-cols-2 gap-3 h-48 overflow-y-auto custom-scrollbar pr-2">
                            {availableCaps.map(cap => (
                                <label key={cap.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors border border-transparent hover:border-gray-200">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        checked={!!formData.capabilities?.[cap.id]}
                                        onChange={() => handleCheckboxChange(cap.id)}
                                    />
                                    <span className="text-sm text-gray-700">{cap.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Peran</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Roles;