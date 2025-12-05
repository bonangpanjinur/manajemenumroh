import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { CheckSquare, Plus, Clock } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Tasks = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/tasks');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', priority: 'medium', due_date: '', description: '' });
    const [mode, setMode] = useState('create');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/tasks', form);
            else await api.put(`umh/v1/tasks/${form.id}`, form);
            toast.success("Task berhasil disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal simpan task"); }
    };

    const columns = [
        { header: 'Judul Tugas', accessor: 'title', render: r => <span className="font-medium text-gray-900">{r.title}</span> },
        { header: 'Prioritas', accessor: 'priority', render: r => (
            <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                r.priority === 'high' ? 'bg-red-100 text-red-700' : 
                r.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
            }`}>{r.priority}</span>
        )},
        { header: 'Jatuh Tempo', accessor: 'due_date', render: r => <span className="flex items-center gap-1 text-gray-500 text-sm"><Clock size={14}/> {r.due_date}</span> },
        { header: 'Status', accessor: 'status', render: r => <span className="bg-gray-100 px-2 py-1 rounded text-xs">{r.status}</span> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <CheckSquare size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Manajemen Tugas</h1>
                        <p className="text-gray-500 text-sm">Daftar pekerjaan tim dan deadline.</p>
                    </div>
                </div>
                <button 
                    onClick={() => { setMode('create'); setForm({ title: '', priority: 'medium', due_date: '', description: '' }); setIsModalOpen(true); }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} /> Buat Tugas Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading}
                    onEdit={(item) => { setMode('edit'); setForm(item); setIsModalOpen(true); }}
                    onDelete={(item) => deleteItem(item.id)}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Buat Tugas" : "Edit Tugas"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Judul Tugas</label>
                        <input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Prioritas</label>
                            <select className="input-field" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="label">Jatuh Tempo</label>
                            <input type="date" className="input-field" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="label">Deskripsi</label>
                        <textarea className="input-field h-24" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
                    </div>
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Tasks;