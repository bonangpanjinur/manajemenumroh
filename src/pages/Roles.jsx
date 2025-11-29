import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import useCRUD from '../hooks/useCRUD';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { Shield, Lock } from 'lucide-react';

const Roles = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/roles');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // Capabilities standar WordPress & Plugin untuk referensi
    const availableCaps = [
        { id: 'read', label: 'Read (Baca Data)' },
        { id: 'edit_posts', label: 'Edit Data' },
        { id: 'upload_files', label: 'Upload File' },
        { id: 'manage_options', label: 'Kelola Pengaturan' },
        { id: 'manage_agents', label: 'Kelola Agen' },
        { id: 'manage_finance', label: 'Kelola Keuangan' },
    ];

    const [formData, setFormData] = useState({
        name: '', // slug, e.g., 'finance_staff'
        display_name: '', // e.g., 'Staf Keuangan'
        capabilities: {} // e.g., { read: true, manage_finance: true }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Auto-generate slug jika kosong saat create
        if (!editId && !formData.name && formData.display_name) {
            formData.name = formData.display_name.toLowerCase().replace(/ /g, '_');
        }

        const success = editId ? await updateItem(editId, formData) : await createItem(formData);
        if (success) {
            setIsModalOpen(false);
            setFormData({ name: '', display_name: '', capabilities: {} });
        }
    };

    const columns = [
        { header: 'Nama Peran', accessor: 'display_name', className: 'font-bold text-gray-800' },
        { header: 'Slug (ID)', accessor: 'name', render: r => <code className="bg-gray-100 px-2 py-1 rounded text-xs text-red-500">{r.name}</code> },
        { header: 'Akses Utama', accessor: 'capabilities', render: r => {
            const activeCaps = Object.keys(r.capabilities || {}).filter(k => r.capabilities[k]).length;
            return <span className="text-xs text-gray-500">{activeCaps} hak akses aktif</span>;
        }},
    ];

    return (
        <Layout title="Manajemen Peran & Akses">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Peran Pengguna (Roles)</h2>
                    <p className="text-sm text-gray-500">Buat peran khusus untuk staf, agen, atau manajer.</p>
                </div>
                <button onClick={() => { setEditId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2">
                    <Shield size={18} /> Buat Peran Baru
                </button>
            </div>

            {loading ? <Spinner /> : (
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    onEdit={(item)=>{setFormData(item); setEditId(item.name); setIsModalOpen(true)}} 
                    onDelete={(item) => deleteItem(item.name)} // Menggunakan slug sebagai ID
                />
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Peran" : "Peran Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tampilan</label>
                            <input className="w-full px-3 py-2 border rounded-md" value={formData.display_name} onChange={e => setFormData({...formData, display_name: e.target.value})} required placeholder="Contoh: Staf Keuangan" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug / ID (Unik)</label>
                            <input className="w-full px-3 py-2 border rounded-md bg-gray-50" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={!!editId} placeholder="finance_staff" />
                            {editId && <p className="text-xs text-gray-400 mt-1">Slug tidak dapat diubah setelah dibuat.</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Lock size={14}/> Hak Akses (Capabilities)</label>
                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200 h-48 overflow-y-auto custom-scrollbar">
                            {availableCaps.map(cap => (
                                <label key={cap.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                                    <input 
                                        type="checkbox" 
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                        checked={!!formData.capabilities?.[cap.id]}
                                        onChange={() => handleCheckboxChange(cap.id)}
                                    />
                                    <span className="text-sm text-gray-700">{cap.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">Simpan Peran</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Roles;