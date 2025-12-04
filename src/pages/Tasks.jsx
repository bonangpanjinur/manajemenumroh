import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, CheckCircle, Clock, AlertCircle, User, Calendar } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Tasks = () => {
    const { data: tasks, loading, fetchData, deleteItem } = useCRUD('umh/v1/tasks');
    const [employees, setEmployees] = useState([]);
    
    // Load Employees untuk Dropdown Assignee
    useEffect(() => {
        api.get('umh/v1/hr/employees').then(res => setEmployees(res.data || [])).catch(console.error);
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/tasks', form);
            toast.success("Tugas dibuat");
            setIsModalOpen(false);
            fetchData();
            setForm({ title: '', description: '', assigned_to: '', due_date: '', priority: 'medium' });
        } catch(e) { toast.error("Gagal simpan"); }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.put(`umh/v1/tasks/${id}`, { status: newStatus });
            fetchData();
            toast.success("Status diperbarui");
        } catch(e) { toast.error("Gagal update"); }
    };

    const handleDelete = async (id) => {
        if(window.confirm("Hapus tugas ini?")) {
            await deleteItem(id);
            toast.success("Tugas dihapus");
        }
    };

    // Kanban Board Columns
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    return (
        <Layout title="Manajemen Tugas (Task Board)">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Papan Tugas</h2>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-100">
                    <Plus size={18}/> Buat Tugas Baru
                </button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Memuat tugas...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
                    <TaskColumn 
                        title="Perlu Dikerjakan" 
                        tasks={pendingTasks} 
                        color="bg-gray-100" 
                        icon={AlertCircle} 
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        nextStatus="in_progress"
                    />
                    <TaskColumn 
                        title="Sedang Proses" 
                        tasks={inProgressTasks} 
                        color="bg-blue-50" 
                        icon={Clock} 
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        nextStatus="completed"
                    />
                    <TaskColumn 
                        title="Selesai" 
                        tasks={completedTasks} 
                        color="bg-green-50" 
                        icon={CheckCircle} 
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        nextStatus="pending" // Loop back or archive
                    />
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Tugas Baru">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Judul Tugas</label><input className="input-field" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Misal: Follow up Visa Grup A" /></div>
                    <div>
                        <label className="label">Ditugaskan Ke</label>
                        <select className="input-field" value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} required>
                            <option value="">-- Pilih Staff --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Tenggat Waktu</label><input type="date" className="input-field" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required /></div>
                        <div>
                            <label className="label">Prioritas</label>
                            <select className="input-field" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                                <option value="low">Rendah</option>
                                <option value="medium">Sedang</option>
                                <option value="high">Tinggi</option>
                            </select>
                        </div>
                    </div>
                    <div><label className="label">Deskripsi</label><textarea className="input-field h-24" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea></div>
                    <div className="flex justify-end pt-4"><button className="btn-primary">Buat Tugas</button></div>
                </form>
            </Modal>
        </Layout>
    );
};

const TaskColumn = ({ title, tasks, color, icon: Icon, onStatusChange, onDelete, nextStatus }) => (
    <div className={`p-4 rounded-xl ${color} min-h-[500px]`}>
        <div className="flex items-center gap-2 mb-4 font-bold text-gray-700">
            <Icon size={18}/> {title} <span className="bg-white px-2 rounded-full text-xs py-0.5 border shadow-sm">{tasks.length}</span>
        </div>
        <div className="space-y-3">
            {tasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>{task.priority}</span>
                        <button onClick={() => onDelete(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                    </div>
                    <h4 className="font-bold text-gray-800 text-sm mb-1">{task.title}</h4>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 border-t pt-2 mt-2">
                        <div className="flex items-center gap-1"><User size={12}/> {task.employee_name || 'Unassigned'}</div>
                        <div className="flex items-center gap-1"><Calendar size={12}/> {formatDate(task.due_date)}</div>
                    </div>

                    {nextStatus && (
                        <button 
                            onClick={() => onStatusChange(task.id, nextStatus)}
                            className="mt-3 w-full py-1.5 text-xs font-medium text-center bg-gray-50 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                        >
                            Pindahkan ke {nextStatus === 'in_progress' ? 'Proses' : nextStatus === 'completed' ? 'Selesai' : 'Pending'} &rarr;
                        </button>
                    )}
                </div>
            ))}
            {tasks.length === 0 && <div className="text-center text-xs text-gray-400 italic py-8">Kosong</div>}
        </div>
    </div>
);

export default Tasks;