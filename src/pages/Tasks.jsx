import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { Plus } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const Tasks = () => {
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('umh/v1/tasks');
    
    // FETCH DATA KARYAWAN (HR) UNTUK DROPDOWN
    const { data: employees, fetchData: fetchEmployees } = useCRUD('umh/v1/hr');
    
    useEffect(() => {
        fetchEmployees(); // Ambil data karyawan saat load
    }, [fetchEmployees]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { title: '', assigned_to: '', due_date: '', status: 'pending' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
        if (success) setIsModalOpen(false);
    };

    // Helper tampilkan nama karyawan
    const getAssigneeName = (empId) => {
        if (!employees || employees.length === 0) return '-';
        const emp = employees.find(e => String(e.id) === String(empId));
        return emp ? emp.name : 'Tidak diketahui';
    };

    const columns = [
        { header: 'Judul Tugas', accessor: 'title', sortable: true },
        { header: 'Ditugaskan Ke', accessor: 'assigned_to', render: r => <span className="text-blue-600 font-medium">{getAssigneeName(r.assigned_to)}</span> },
        { header: 'Tenggat', accessor: 'due_date', render: r => formatDate(r.due_date) },
        { header: 'Status', accessor: 'status', render: r => <span className="badge bg-gray-100">{r.status}</span> }
    ];

    return (
        <Layout title="Manajemen Tugas">
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal('create')} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Buat Tugas
                </button>
            </div>

            <CrudTable columns={columns} data={data} loading={loading} onEdit={i => handleOpenModal('edit', i)} onDelete={deleteItem} />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Tugas Baru' : 'Edit Tugas'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Judul Tugas</label><input className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
                    
                    {/* DROPDOWN KARYAWAN DIPERBAIKI */}
                    <div>
                        <label className="label">Pilih Karyawan</label>
                        <select className="input-field" value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})} required>
                            <option value="">-- Pilih --</option>
                            {employees && employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Tenggat Waktu</label><input type="date" className="input-field" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} /></div>
                        <div>
                            <label className="label">Status</label>
                            <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="pending">Pending</option>
                                <option value="in_progress">Dikerjakan</option>
                                <option value="completed">Selesai</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};
export default Tasks;