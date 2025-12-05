import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { CheckSquare, Clock, User, AlertCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/tasks');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    
    const initialForm = { 
        title: '', 
        description: '', 
        priority: 'medium', 
        status: 'pending',
        due_date: new Date().toISOString().split('T')[0]
    };
    const [form, setForm] = useState(initialForm);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') {
                await api.post('umh/v1/tasks', form);
                toast.success("Tugas dibuat");
            } else {
                const id = form.uuid || form.id;
                await api.put(`umh/v1/tasks/${id}`, form);
                toast.success("Tugas diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal: " + e.message); }
    };

    const handleStatusChange = async (item, newStatus) => {
        try {
            const id = item.uuid || item.id;
            await api.put(`umh/v1/tasks/${id}/status`, { status: newStatus });
            toast.success("Status diperbarui");
            fetchData();
        } catch (e) { toast.error("Gagal update status"); }
    };

    const columns = [
        { header: 'Judul Tugas', accessor: 'title', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.title}</div>
                <div className="text-xs text-gray-500 line-clamp-1">{r.description}</div>
            </div>
        )},
        { header: 'Prioritas', accessor: 'priority', render: r => (
            <span className={`text-[10px] uppercase px-2 py-1 rounded font-bold ${
                r.priority === 'high' ? 'bg-red-100 text-red-600' :
                r.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
            }`}>
                {r.priority}
            </span>
        )},
        { header: 'Deadline', accessor: 'due_date', render: r => (
            <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock size={12}/> {r.due_date}
            </div>
        )},
        { header: 'Status', accessor: 'status', render: r => (
            <select 
                className={`text-xs border rounded px-2 py-1 ${
                    r.status === 'completed' ? 'bg-green-50 border-green-200 text-green-700' : 
                    r.status === 'in_progress' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50'
                }`}
                value={r.status}
                onChange={(e) => handleStatusChange(r, e.target.value)}
            >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Selesai</option>
            </select>
        )}
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Tugas</h1>
                    <p className="text-gray-500 text-sm">Delegasikan pekerjaan ke tim Anda.</p>
                </div>
                <button onClick={() => { setMode('create'); setForm(initialForm); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Buat Tugas
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} onEdit={(item)=>{setForm(item); setMode('edit'); setIsModalOpen(true)}} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Buat Tugas Baru" : "Edit Tugas"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Judul Tugas</label>
                        <input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                    </div>
                    <div>
                        <label className="label">Deskripsi Detail</label>
                        <textarea className="input-field" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Prioritas</label>
                            <select className="input-field" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                                <option value="low">Rendah</option>
                                <option value="medium">Sedang</option>
                                <option value="high">Tinggi (Urgent)</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Tenggat Waktu</label>
                            <input type="date" className="input-field" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Tasks;