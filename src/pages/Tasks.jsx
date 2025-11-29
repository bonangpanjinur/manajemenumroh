import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import { useData } from '../contexts/DataContext';
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast'; // [NEW] Import Toast

const Tasks = () => {
    const { user } = useData();
    const { data, loading, createItem, updateItem, deleteItem } = useCRUD('tasks');
    
    // FETCH EMPLOYEES UNTUK DROPDOWN
    const { data: employees, fetchData: fetchEmployees } = useCRUD('hr');
    
    useEffect(() => {
        fetchEmployees();
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({});

    const handleOpenModal = (mode, item = null) => {
        setModalMode(mode);
        setCurrentItem(item);
        setFormData(item || { title: '', assigned_to: '', due_date: '', status: 'pending', priority: 'medium' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // [UX] Tambahkan loading toast atau feedback
        const success = modalMode === 'create' 
            ? await createItem(formData) 
            : await updateItem(currentItem.id, formData);
            
        if (success) {
            setIsModalOpen(false);
            // [UX] Tampilkan notifikasi sukses
            toast.success(modalMode === 'create' ? 'Tugas baru berhasil dibuat!' : 'Tugas berhasil diperbarui!');
        } else {
            // [UX] Notifikasi error jika gagal
            toast.error('Gagal menyimpan tugas. Silakan coba lagi.');
        }
    };

    // Helper untuk cari nama karyawan dari ID User/Employee
    const getAssigneeName = (userId) => {
        if (!employees || employees.length === 0) return <span className="text-gray-400 text-xs">Memuat...</span>;
        
        // Asumsi: di tabel HR kita simpan user_id, kita cocokkan dengan user_id atau id tabel karyawan
        const emp = employees.find(e => String(e.user_id) === String(userId) || String(e.id) === String(userId));
        
        return emp ? (
            <span className="font-medium text-blue-700">{emp.name}</span>
        ) : (
            <span className="text-gray-500 italic text-xs">ID: {userId} (Tidak ditemukan)</span>
        );
    };

    // Wrapper untuk delete dengan konfirmasi
    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
            const success = await deleteItem(id);
            if (success) toast.success('Tugas dihapus.');
        }
    };

    const columns = [
        { header: 'Judul Tugas', accessor: 'title', sortable: true },
        { 
            header: 'Ditugaskan Ke', 
            accessor: 'assigned_to',
            render: (row) => getAssigneeName(row.assigned_to)
        },
        { 
            header: 'Tenggat', 
            accessor: 'due_date', 
            render: (row) => (
                <div className={`text-sm ${new Date(row.due_date) < new Date() && row.status !== 'completed' ? 'text-red-600 font-bold flex items-center gap-1' : 'text-gray-600'}`}>
                    {new Date(row.due_date) < new Date() && row.status !== 'completed' && <AlertCircle size={12}/>}
                    {formatDate(row.due_date)}
                </div>
            ) 
        },
        { 
            header: 'Prioritas', 
            accessor: 'priority',
            render: (row) => {
                const colors = { high: 'text-red-600 bg-red-50 border-red-200', medium: 'text-yellow-600 bg-yellow-50 border-yellow-200', low: 'text-green-600 bg-green-50 border-green-200' };
                return <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${colors[row.priority] || 'text-gray-600'}`}>{row.priority}</span>
            }
        },
        { 
            header: 'Status', 
            accessor: 'status',
            render: (row) => {
                const statusStyles = {
                    'pending': 'text-gray-500 bg-gray-100',
                    'in_progress': 'text-blue-600 bg-blue-100',
                    'completed': 'text-green-600 bg-green-100'
                };
                return (
                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusStyles[row.status] || ''}`}>
                        {row.status === 'completed' ? <CheckCircle size={14}/> : <Clock size={14}/>} 
                        {row.status === 'in_progress' ? 'Sedang Dikerjakan' : row.status}
                    </span>
                )
            }
        }
    ];

    return (
        <Layout title="Manajemen Tugas Tim">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => handleOpenModal('create')}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-colors"
                >
                    <Plus size={18} /> Buat Tugas Baru
                </button>
            </div>

            <CrudTable
                columns={columns}
                data={data}
                loading={loading}
                onEdit={(item) => handleOpenModal('edit', item)}
                onDelete={handleDelete}
                userCapabilities={user?.role}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'create' ? 'Tugas Baru' : 'Edit Tugas'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Judul Tugas</label>
                        <input 
                            type="text" 
                            className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow" 
                            value={formData.title || ''} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                            required
                            placeholder="Contoh: Follow up jamaah keberangkatan Oktober"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ditugaskan Kepada (Tim)</label>
                        <select 
                            className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            value={formData.assigned_to || ''}
                            onChange={e => setFormData({...formData, assigned_to: e.target.value})}
                            required
                        >
                            <option value="">-- Pilih Karyawan --</option>
                            {employees && employees.map(emp => (
                                <option key={emp.id} value={emp.user_id || emp.id}>
                                    {emp.name} - {emp.position || 'Staff'}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <AlertCircle size={12}/> Pastikan karyawan sudah ditautkan dengan Akun User di menu HR agar notifikasi masuk.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tenggat Waktu</label>
                            <input 
                                type="date" 
                                className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                                value={formData.due_date || ''} 
                                onChange={e => setFormData({...formData, due_date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Prioritas</label>
                            <select 
                                className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                                value={formData.priority || 'medium'} 
                                onChange={e => setFormData({...formData, priority: e.target.value})}
                            >
                                <option value="low">Rendah</option>
                                <option value="medium">Sedang</option>
                                <option value="high">Tinggi (Urgent)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select 
                            className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                            value={formData.status || 'pending'} 
                            onChange={e => setFormData({...formData, status: e.target.value})}
                        >
                            <option value="pending">Pending (Belum Mulai)</option>
                            <option value="in_progress">Sedang Dikerjakan</option>
                            <option value="completed">Selesai</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm">
                            {modalMode === 'create' ? 'Buat Tugas' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Tasks;