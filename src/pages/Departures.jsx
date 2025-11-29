import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus, Calendar, DollarSign } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

const Departures = () => {
    const { data, loading, fetchData, createItem, updateItem, deleteItem } = useCRUD('umh/v1/departures');
    const { data: packages } = useCRUD('umh/v1/packages');

    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({ package_id: '', departure_date: '', quota: 45, price_override: 0 });

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        // Reset form atau isi data edit
        if (item) {
            setFormData({
                ...item,
                departure_date: item.departure_date.split('T')[0] // Fix date format input
            });
        } else {
            setFormData({ package_id: '', departure_date: '', quota: 45, price_override: 0 });
        }
        setIsModalOpen(true);
    };

    // Saat paket dipilih, ambil harga dasar dari paket sebagai default price_override
    const handlePackageChange = (e) => {
        const pkgId = e.target.value;
        const selectedPkg = packages.find(p => String(p.id) === String(pkgId));
        setFormData(prev => ({
            ...prev,
            package_id: pkgId,
            price_override: selectedPkg ? selectedPkg.price : 0
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' ? await createItem(formData) : await updateItem(currentItem.id, formData);
        if (success) { setIsModalOpen(false); fetchData(); }
    };

    const columns = [
        { header: 'Tanggal Keberangkatan', accessor: 'departure_date', render: r => <div className="font-medium flex items-center gap-2"><Calendar size={16} className="text-blue-500"/> {formatDate(r.departure_date)}</div> },
        { header: 'Paket', accessor: 'package_name', className: 'font-bold' },
        { header: 'Harga Jual', accessor: 'price_override', render: r => (
            <div className="flex items-center gap-1 text-green-700 font-semibold">
                {formatCurrency(r.price_override || r.base_price)}
            </div>
        )},
        { header: 'Kuota', accessor: 'quota', render: r => <span className="badge bg-blue-50 text-blue-700">{r.quota} Seat</span> },
        { header: 'Status', accessor: 'status', render: r => <span className={`badge uppercase text-xs ${r.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span> }
    ];

    return (
        <Layout title="Jadwal Keberangkatan">
            <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-500 text-sm">Atur tanggal dan harga spesifik untuk setiap keberangkatan.</p>
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Tambah Jadwal
                </button>
            </div>

            <CrudTable columns={columns} data={data} loading={loading} onEdit={(item) => handleOpenModal('edit', item)} onDelete={deleteItem} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? "Jadwal Baru" : "Edit Jadwal"}>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                        <label className="label text-blue-800">1. Pilih Paket Perjalanan</label>
                        <select className="input-field" value={formData.package_id} onChange={handlePackageChange} required disabled={modalMode === 'edit'}>
                            <option value="">-- Pilih Paket --</option>
                            {packages?.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <p className="text-xs text-blue-600 mt-1">Pilih paket master terlebih dahulu.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">2. Tanggal Berangkat</label>
                            <input type="date" className="input-field" value={formData.departure_date} onChange={e => setFormData({...formData, departure_date: e.target.value})} required />
                        </div>
                        <div>
                             <label className="label">3. Kuota Seat</label>
                             <input type="number" className="input-field" value={formData.quota} onChange={e => setFormData({...formData, quota: e.target.value})} />
                        </div>
                    </div>
                    
                    <div>
                        <label className="label font-bold text-gray-800 flex items-center gap-2">
                            <DollarSign size={16} /> 4. Harga Jual (Tanggal Ini)
                        </label>
                        <input type="number" className="input-field font-semibold text-lg" value={formData.price_override} onChange={e => setFormData({...formData, price_override: e.target.value})} />
                        <p className="text-xs text-gray-500 mt-1">Anda bisa mengubah harga ini berbeda dari harga dasar paket (misal: High Season).</p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Jadwal</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Departures;