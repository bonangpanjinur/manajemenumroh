import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Shield, Lock, Edit, Trash, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const Roles = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/roles');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // create | edit
    
    const initialForm = { id: null, role_name: '', role_key: '', capabilities: [] };
    const [form, setForm] = useState(initialForm);

    // --- DEFINISI HAK AKSES (PERMISSION) ---
    // Dikelompokkan agar tampilan modal rapi
    const capabilityGroups = {
        'Core & Dashboard': [
            { key: 'view_dashboard', label: 'Lihat Dashboard' },
            { key: 'manage_settings', label: 'Akses Pengaturan (Settings)' },
        ],
        'Transaksi & Booking': [
            { key: 'view_bookings', label: 'Lihat Booking' },
            { key: 'manage_bookings', label: 'Kelola Booking (Create/Edit)' },
            { key: 'delete_bookings', label: 'Hapus Booking' },
        ],
        'Keuangan': [
            { key: 'view_finance', label: 'Lihat Laporan Keuangan' },
            { key: 'manage_finance', label: 'Validasi & Input Transaksi' },
        ],
        'Jemaah (CRM)': [
            { key: 'view_jamaah', label: 'Lihat Data Jemaah' },
            { key: 'manage_jamaah', label: 'Input/Edit Jemaah' },
        ],
        'Produk & Paket': [
            { key: 'manage_packages', label: 'Kelola Paket & Jadwal' },
            { key: 'manage_logistics', label: 'Kelola Logistik' },
        ],
        'HR & Users': [
            { key: 'manage_hr', label: 'Kelola Karyawan & Absensi' },
            { key: 'manage_users', label: 'Kelola User Login' },
            { key: 'manage_roles', label: 'Kelola Role' },
        ]
    };

    // Helper untuk checkbox
    const toggleCap = (capKey) => {
        setForm(prev => {
            const caps = prev.capabilities.includes(capKey) 
                ? prev.capabilities.filter(c => c !== capKey) 
                : [...prev.capabilities, capKey];
            return { ...prev, capabilities: caps };
        });
    };

    // Helper Select All per Group
    const toggleGroup = (groupName) => {
        const groupCaps = capabilityGroups[groupName].map(c => c.key);
        const allSelected = groupCaps.every(c => form.capabilities.includes(c));
        
        setForm(prev => {
            let newCaps = [...prev.capabilities];
            if (allSelected) {
                // Unselect all
                newCaps = newCaps.filter(c => !groupCaps.includes(c));
            } else {
                // Select all (hindari duplikat)
                const toAdd = groupCaps.filter(c => !newCaps.includes(c));
                newCaps = [...newCaps, ...toAdd];
            }
            return { ...prev, capabilities: newCaps };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validasi Role Key (hanya huruf kecil dan underscore)
        const autoKey = form.role_name.toLowerCase().replace(/\s+/g, '_');
        const payload = { ...form, role_key: form.role_key || autoKey };

        try {
            if (modalMode === 'create') {
                await api.post('umh/v1/roles', payload);
                toast.success("Role baru berhasil dibuat");
            } else {
                // Asumsi API support PUT update capabilities
                // Note: Jika API backend belum support PUT /roles/:id, ini perlu disesuaikan
                // Untuk sekarang kita asumsikan create dulu karena edit role kompleks di backend
                toast.error("Mode Edit sedang dalam pengembangan di Backend. Silakan buat role baru.");
                // Jika sudah ada backend: await api.put(`umh/v1/roles/${form.id}`, payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch(e) { 
            toast.error("Gagal simpan: " + e.message); 
        }
    };

    const openCreate = () => {
        setModalMode('create');
        setForm(initialForm);
        setIsModalOpen(true);
    };

    const openEdit = (item) => {
        setModalMode('edit');
        setForm({
            id: item.id,
            role_name: item.role_name,
            role_key: item.role_key,
            capabilities: Array.isArray(item.capabilities) ? item.capabilities : []
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        if (['administrator', 'subscriber'].includes(item.role_key)) {
            return toast.error("Role sistem (Administrator/Subscriber) tidak boleh dihapus!");
        }
        if (window.confirm(`Yakin hapus role "${item.role_name}"? User dengan role ini akan kehilangan akses.`)) {
            await deleteItem(item.id);
            toast.success("Role dihapus");
        }
    };

    const columns = [
        { header: 'Nama Role', accessor: 'role_name', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.role_name}</div>
                <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1 rounded inline-block mt-1">{r.role_key}</div>
            </div>
        )},
        { header: 'Hak Akses', accessor: 'capabilities', render: r => (
            <div className="flex flex-wrap gap-1 max-w-lg">
                {Array.isArray(r.capabilities) && r.capabilities.slice(0, 5).map(c => (
                    <span key={c} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">{c}</span>
                ))}
                {Array.isArray(r.capabilities) && r.capabilities.length > 5 && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">+{r.capabilities.length - 5} lainnya</span>
                )}
            </div>
        )},
        { header: 'Aksi', accessor: 'id', render: r => (
            <div className="flex gap-2">
                <button onClick={() => openEdit(r)} className="text-blue-600 hover:bg-blue-50 p-1 rounded transition"><Edit size={16}/></button>
                {r.role_key !== 'administrator' && (
                    <button onClick={() => handleDelete(r)} className="text-red-600 hover:bg-red-50 p-1 rounded transition"><Trash size={16}/></button>
                )}
            </div>
        )}
    ];

    return (
        <Layout title="Manajemen Role & Hak Akses">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2"><Shield size={20}/> Role Pengguna</h2>
                    <p className="text-sm text-gray-500">Atur siapa yang bisa mengakses fitur apa.</p>
                </div>
                <button onClick={openCreate} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-200">
                    <Plus size={18}/> Buat Role Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} />
            </div>

            {/* MODAL KONFIGURASI ROLE */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Buat Role Baru" : "Edit Hak Akses"} size="max-w-4xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header Input */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="label">Nama Role (Jabatan)</label>
                        <input 
                            className="input-field font-bold text-lg" 
                            value={form.role_name} 
                            onChange={e => setForm({...form, role_name: e.target.value})} 
                            placeholder="Contoh: Staff Keuangan" 
                            required 
                            disabled={modalMode === 'edit' && form.role_key === 'administrator'} // Admin name locked
                        />
                        <p className="text-xs text-blue-600 mt-1">
                            {modalMode === 'create' ? `Slug otomatis: ${form.role_name.toLowerCase().replace(/\s+/g, '_')}` : `Slug: ${form.role_key}`}
                        </p>
                    </div>
                    
                    {/* Matrix Permission */}
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                        {Object.entries(capabilityGroups).map(([groupName, caps]) => (
                            <div key={groupName} className="border rounded-lg overflow-hidden">
                                <div className="bg-gray-100 px-4 py-2 font-bold text-sm text-gray-700 flex justify-between items-center">
                                    <span>{groupName}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => toggleGroup(groupName)}
                                        className="text-xs text-blue-600 hover:underline"
                                    >
                                        Pilih Semua
                                    </button>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white">
                                    {caps.map((cap) => (
                                        <label key={cap.key} className={`flex items-center gap-3 p-2 rounded cursor-pointer transition border ${form.capabilities.includes(cap.key) ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${form.capabilities.includes(cap.key) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                                {form.capabilities.includes(cap.key) && <CheckSquare size={14} className="text-white" />}
                                            </div>
                                            {/* Hidden checkbox for logic */}
                                            <input 
                                                type="checkbox" 
                                                className="hidden"
                                                checked={form.capabilities.includes(cap.key)}
                                                onChange={() => toggleCap(cap.key)}
                                            />
                                            <div>
                                                <div className="text-sm font-medium text-gray-800">{cap.label}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">{cap.key}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary flex items-center gap-2">
                            <Lock size={16}/> {modalMode === 'create' ? 'Simpan Role' : 'Update Akses'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Roles;