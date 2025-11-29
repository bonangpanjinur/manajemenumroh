import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import api from '../utils/api';
import { Plus, MapPin, Briefcase, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

// Komponen ini menangani berbagai "Master Data Kecil" dalam satu halaman
const Masters = () => {
    const [activeTab, setActiveTab] = useState('locations'); // locations, jobs, banks
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', type: '', code: '' });
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);

    // Fetch data based on active tab
    const fetchData = async () => {
        setLoading(true);
        try {
            // Kita asumsikan backend punya endpoint filter ?type=locations atau endpoint terpisah
            // Di sini kita pakai endpoint umum /masters dengan query param type
            const endpoint = `umh/v1/masters?type=${activeTab}`;
            const res = await api.get(endpoint);
            setData(Array.isArray(res) ? res : []);
        } catch (error) {
            console.error(error);
            // toast.error("Gagal memuat data master");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Reset form when tab changes
        setFormData({ name: '', type: activeTab, code: '' });
    }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, type: activeTab }; // Ensure type is correct
            if (modalMode === 'create') {
                await api.post('umh/v1/masters', payload);
                toast.success('Data berhasil ditambahkan');
            } else {
                await api.post(`umh/v1/masters/${currentItem.id}`, payload); // Asumsi backend pakai POST untuk update juga atau method PUT
                toast.success('Data berhasil diupdate');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error(error.message || 'Gagal menyimpan');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus data ini?')) return;
        try {
            await api.delete(`umh/v1/masters/${id}`);
            toast.success('Data dihapus');
            fetchData();
        } catch (error) {
            toast.error('Gagal menghapus');
        }
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { name: '', type: activeTab, code: '' });
        setIsModalOpen(true);
    };

    const columns = [
        { header: 'Nama / Label', accessor: 'name', className: 'font-bold' },
        { header: 'Kode / Keterangan', accessor: 'code', render: r => r.code || '-' },
    ];

    // Tab Button Helper
    const TabBtn = ({ id, label, icon: Icon }) => (
        <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === id ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <Icon size={16}/> {label}
        </button>
    );

    return (
        <Layout title="Master Data & Referensi">
            <div className="bg-white p-2 rounded-t-lg border-b border-gray-200 flex gap-2 mb-4 overflow-x-auto">
                <TabBtn id="locations" label="Lokasi & Kota" icon={MapPin} />
                <TabBtn id="jobs" label="Pekerjaan" icon={Briefcase} />
                <TabBtn id="banks" label="Bank & Akun" icon={Tag} />
            </div>

            <div className="mb-4 flex justify-between items-center">
                <p className="text-sm text-gray-500 capitalize">Mengelola data master {activeTab}</p>
                <button onClick={() => openModal('create')} className="btn-primary flex gap-2"><Plus size={18}/> Tambah Data</button>
            </div>

            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => openModal('edit', i)} onDelete={handleDelete} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${modalMode === 'create' ? 'Tambah' : 'Edit'} ${activeTab === 'locations' ? 'Lokasi' : 'Data'}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama {activeTab === 'locations' ? 'Kota/Negara' : 'Item'}</label>
                        <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div>
                        <label className="label">{activeTab === 'locations' ? 'Kode Negara / Provinsi' : 'Kode / Keterangan Tambahan'}</label>
                        <input className="input-field" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder={activeTab === 'banks' ? 'No. Rekening' : 'Opsional'} />
                    </div>
                    {/* Hidden Type Field */}
                    <input type="hidden" value={activeTab} />
                    
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Masters;