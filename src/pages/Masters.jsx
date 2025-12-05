import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plane, Building, MapPin, Plus, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

// Komponen Tab Button Sederhana
const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-all duration-200 ${
            active 
            ? 'border-blue-600 text-blue-600 bg-blue-50' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
        }`}
    >
        <Icon size={18} />
        {label}
    </button>
);

const Masters = () => {
    const [activeTab, setActiveTab] = useState('airlines');
    
    // Kita gunakan state endpoint dinamis agar useCRUD bisa dipakai ulang
    const getEndpoint = (tab) => {
        if (tab === 'airlines') return 'umh/v1/masters/airlines'; // Sesuaikan path API Anda
        if (tab === 'hotels') return 'umh/v1/masters/hotels';
        return 'umh/v1/masters/locations';
    };

    // Inisialisasi useCRUD
    // Catatan: Jika endpoint berubah, kita perlu trigger fetchData manual di useEffect bawah
    const { data, loading, fetchData, deleteItem } = useCRUD(getEndpoint(activeTab));

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [formData, setFormData] = useState({});

    // Fetch data ulang saat tab berubah
    useEffect(() => {
        fetchData();
        // Reset form saat ganti tab
        setFormData({});
    }, [activeTab]);

    // Konfigurasi Kolom Tabel Berdasarkan Tab
    const getColumns = () => {
        if (activeTab === 'airlines') {
            return [
                { header: 'Nama Maskapai', accessor: 'name', render: r => <span className="font-bold">{r.name}</span> },
                { header: 'Kode', accessor: 'code', render: r => <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{r.code}</span> },
                { header: 'Tipe', accessor: 'type' },
                { header: 'Status', accessor: 'status', render: r => <span className={`text-xs px-2 py-1 rounded ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span> },
            ];
        } else if (activeTab === 'hotels') {
            return [
                { header: 'Nama Hotel', accessor: 'name', render: r => <span className="font-bold">{r.name}</span> },
                { header: 'Kota', accessor: 'city' },
                { header: 'Rating', accessor: 'rating', render: r => <span className="text-yellow-500">{'★'.repeat(r.rating || 5)}</span> },
                { header: 'Jarak (m)', accessor: 'distance_to_haram' },
            ];
        } else {
            return [
                { header: 'Nama Lokasi', accessor: 'name', render: r => <span className="font-bold">{r.name}</span> },
                { header: 'Negara', accessor: 'country' },
                { header: 'Tipe', accessor: 'type', render: r => <span className="uppercase text-xs font-bold">{r.type}</span> },
            ];
        }
    };

    // Handle Submit Universal
    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = getEndpoint(activeTab);
        
        try {
            if (modalMode === 'create') {
                await api.post(endpoint, formData);
                toast.success("Data berhasil ditambahkan");
            } else {
                await api.put(`${endpoint}/${formData.id}`, formData);
                toast.success("Data berhasil diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Gagal menyimpan: " + (error.message || "Error server"));
        }
    };

    const handleEdit = (item) => {
        setFormData(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Yakin hapus data ini?")) {
            await deleteItem(id);
        }
    };

    // Render Form Fields Berdasarkan Tab
    const renderFormFields = () => {
        if (activeTab === 'airlines') {
            return (
                <>
                    <div>
                        <label className="label">Nama Maskapai</label>
                        <input className="input-field" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Kode (IATA)</label>
                            <input className="input-field" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Contoh: GA" />
                        </div>
                        <div>
                            <label className="label">Tipe</label>
                            <select className="input-field" value={formData.type || 'International'} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="Domestic">Domestik</option>
                                <option value="International">Internasional</option>
                            </select>
                        </div>
                    </div>
                </>
            );
        } else if (activeTab === 'hotels') {
            return (
                <>
                    <div>
                        <label className="label">Nama Hotel</label>
                        <input className="input-field" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Kota</label>
                            <select className="input-field" value={formData.city || 'Makkah'} onChange={e => setFormData({...formData, city: e.target.value})}>
                                <option value="Makkah">Makkah</option>
                                <option value="Madinah">Madinah</option>
                                <option value="Jeddah">Jeddah</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Rating Bintang</label>
                            <select className="input-field" value={formData.rating || '5'} onChange={e => setFormData({...formData, rating: e.target.value})}>
                                <option value="3">3 Bintang</option>
                                <option value="4">4 Bintang</option>
                                <option value="5">5 Bintang</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="label">Jarak ke Haram (meter)</label>
                        <input type="number" className="input-field" value={formData.distance_to_haram || 0} onChange={e => setFormData({...formData, distance_to_haram: e.target.value})} />
                    </div>
                </>
            );
        } else {
            return (
                <>
                    <div>
                        <label className="label">Nama Lokasi / Bandara</label>
                        <input className="input-field" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Tipe</label>
                            <select className="input-field" value={formData.type || 'city'} onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option value="city">Kota</option>
                                <option value="airport">Bandara</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Negara</label>
                            <input className="input-field" value={formData.country || 'Saudi Arabia'} onChange={e => setFormData({...formData, country: e.target.value})} />
                        </div>
                    </div>
                </>
            );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Manual (Tanpa Layout Wrapper) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Master</h1>
                    <p className="text-gray-500 text-sm">Kelola referensi Maskapai, Hotel, dan Lokasi.</p>
                </div>
                <button 
                    onClick={() => {
                        setModalMode('create');
                        setFormData({});
                        setIsModalOpen(true);
                    }} 
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Tambah {activeTab === 'airlines' ? 'Maskapai' : activeTab === 'hotels' ? 'Hotel' : 'Lokasi'}
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-t-xl border-b border-gray-200 px-4 flex overflow-x-auto shadow-sm">
                <TabButton 
                    active={activeTab === 'airlines'} 
                    onClick={() => setActiveTab('airlines')} 
                    icon={Plane} 
                    label="Maskapai" 
                />
                <TabButton 
                    active={activeTab === 'hotels'} 
                    onClick={() => setActiveTab('hotels')} 
                    icon={Building} 
                    label="Hotel" 
                />
                <TabButton 
                    active={activeTab === 'locations'} 
                    onClick={() => setActiveTab('locations')} 
                    icon={MapPin} 
                    label="Lokasi / Bandara" 
                />
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 border-t-0 p-1">
                <CrudTable 
                    columns={getColumns()} 
                    data={data} 
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={(item) => handleDelete(item.id)}
                />
            </div>

            {/* Modal Form Dinamis */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={`${modalMode === 'create' ? 'Tambah' : 'Edit'} ${activeTab === 'airlines' ? 'Maskapai' : activeTab === 'hotels' ? 'Hotel' : 'Lokasi'}`}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {renderFormFields()}
                    
                    <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Masters;