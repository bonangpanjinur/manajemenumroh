import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Calendar, Users, PlaneTakeoff, FileText, CheckCircle } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const Departures = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/departures');
    const [packages, setPackages] = useState([]);
    
    // State untuk Manifest (Daftar Jemaah dalam Grup)
    const [isManifestOpen, setIsManifestOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [manifestData, setManifestData] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);

    const initialForm = { package_id: '', departure_date: '', return_date: '', quota: 45, status: 'planned', guide_name: '' };
    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { 
        fetchData();
        api.get('umh/v1/packages').then(setPackages).catch(() => []);
    }, [fetchData]);

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

    // Fungsi Mockup untuk melihat Manifest (Idealnya endpoint khusus)
    const handleViewManifest = async (group) => {
        setSelectedGroup(group);
        setIsManifestOpen(true);
        // Simulasi ambil data jemaah yang link ke departure_id ini
        try {
            const res = await api.get(`umh/v1/jamaah?departure_id=${group.id}`);
            setManifestData(Array.isArray(res) ? res : res.items || []);
        } catch (e) {
            setManifestData([]);
        }
    };

    const columns = [
        { header: 'Grup Keberangkatan', accessor: 'id', render: r => (
            <div>
                <div className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <PlaneTakeoff size={18} className="text-blue-600"/> {formatDate(r.departure_date)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Paket: {r.package_name || '-'}</div>
            </div>
        )},
        { header: 'Pembimbing (Mutawwif)', accessor: 'guide_name', render: r => r.guide_name || <span className="text-gray-400 italic">Belum ditentukan</span> },
        { header: 'Kuota / Seat', accessor: 'quota', render: r => (
            <div className="w-full max-w-[120px]">
                <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold">{r.filled_seats || 0} Terisi</span>
                    <span className="text-gray-500">dari {r.quota}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(((r.filled_seats||0)/r.quota)*100, 100)}%` }}></div>
                </div>
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                r.status === 'completed' ? 'bg-gray-100 text-gray-600' : 
                r.status === 'departed' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'
            }`}>
                {r.status}
            </span>
        )},
        { header: 'Aksi', accessor: 'id', render: r => (
            <button onClick={() => handleViewManifest(r)} className="text-xs btn-secondary flex items-center gap-1 py-1 px-2">
                <Users size={12}/> Manifest
            </button>
        )}
    ];

    return (
        <Layout title="Jadwal Keberangkatan">
            <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-xl border border-gray-200 shadow-sm gap-4">
                <div>
                    <h2 className="font-bold text-gray-800 text-lg">Manajemen Grup & Seat</h2>
                    <p className="text-sm text-gray-500">Atur tanggal keberangkatan dan monitoring kuota kursi.</p>
                </div>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-200">
                    <Plus size={18} /> Buat Jadwal Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />
            </div>

            {/* Modal Create/Edit */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Jadwal Keberangkatan Baru" : "Edit Jadwal"} size="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="label">Pilih Paket Perjalanan</label>
                            <select className="input-field" value={formData.package_id} onChange={e => setFormData({...formData, package_id: e.target.value})} required>
                                <option value="">-- Pilih Paket --</option>
                                {packages.map(p => <option key={p.id} value={p.id}>{p.name} ({p.duration_days} Hari)</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label">Tanggal Berangkat</label>
                            <input type="date" className="input-field" value={formData.departure_date} onChange={e => setFormData({...formData, departure_date: e.target.value})} required />
                        </div>
                        <div>
                            <label className="label">Tanggal Pulang</label>
                            <input type="date" className="input-field" value={formData.return_date} onChange={e => setFormData({...formData, return_date: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">Kuota Kursi (Seat)</label>
                            <input type="number" className="input-field" value={formData.quota} onChange={e => setFormData({...formData, quota: e.target.value})} required />
                        </div>
                        <div>
                            <label className="label">Pembimbing (Mutawwif)</label>
                            <input type="text" className="input-field" value={formData.guide_name} onChange={e => setFormData({...formData, guide_name: e.target.value})} placeholder="Nama Mutawwif..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className="label">Status Grup</label>
                            <div className="flex gap-4">
                                {['planned', 'manifesting', 'departed', 'completed'].map(s => (
                                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="status" value={s} checked={formData.status === s} onChange={e => setFormData({...formData, status: e.target.value})} className="text-blue-600 focus:ring-blue-500"/>
                                        <span className="capitalize text-sm">{s}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary w-32">Simpan</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Manifest (View Only) */}
            <Modal isOpen={isManifestOpen} onClose={() => setIsManifestOpen(false)} title={`Manifest: ${selectedGroup?.departure_date}`} size="max-w-4xl">
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                        <span className="font-bold text-gray-700">Total Jemaah: {manifestData.length}</span>
                        <button className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                            <FileText size={14}/> Download PDF Manifest
                        </button>
                    </div>
                    {manifestData.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3">Nama Jemaah</th>
                                        <th className="px-4 py-3">Paspor</th>
                                        <th className="px-4 py-3">Gender</th>
                                        <th className="px-4 py-3">Kamar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {manifestData.map((m, idx) => (
                                        <tr key={idx} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{m.full_name}</td>
                                            <td className="px-4 py-3">{m.passport_number || '-'}</td>
                                            <td className="px-4 py-3">{m.gender}</td>
                                            <td className="px-4 py-3 text-gray-500 italic">Auto-assign</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">Belum ada jemaah yang dimasukkan ke grup ini.</div>
                    )}
                </div>
            </Modal>
        </Layout>
    );
};
export default Departures;