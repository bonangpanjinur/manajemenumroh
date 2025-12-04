import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Users, Clock, Trash, Edit } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const HR = () => {
    const [activeTab, setActiveTab] = useState('employees');
    
    return (
        <Layout title="Human Resources (SDM)">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
                <TabButton id="employees" label="Data Karyawan" icon={Users} active={activeTab} set={setActiveTab} />
                <TabButton id="attendance" label="Absensi Harian" icon={Clock} active={activeTab} set={setActiveTab} />
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-1">
                {activeTab === 'employees' ? <EmployeesTab /> : <AttendanceTab />}
            </div>
        </Layout>
    );
};

const TabButton = ({ id, label, icon: Icon, active, set }) => (
    <button onClick={() => set(id)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${active === id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
        <Icon size={16} /> {label}
    </button>
);

// --- TAB DATA KARYAWAN ---
const EmployeesTab = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/hr/employees');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [form, setForm] = useState({ name: '', position: '', department: '', salary: 0, join_date: '', status: 'active' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await api.post('umh/v1/hr/employees', form);
                toast.success("Karyawan ditambahkan");
            } else {
                await api.put(`umh/v1/hr/employees/${form.id}`, form);
                toast.success("Data diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch(e) { 
            toast.error("Gagal menyimpan data"); 
            console.error(e);
        }
    };

    const handleEdit = (item) => {
        setForm(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if(window.confirm("Hapus data karyawan ini?")) {
            const success = await deleteItem(id);
            if (success) toast.success("Data dihapus");
        }
    };

    const cols = [
        { header: 'Nama', accessor: 'name', render: r => <div className="font-bold text-gray-800">{r.name}</div> },
        { header: 'Posisi', accessor: 'position', render: r => <div className="text-sm">{r.position}<br/><span className="text-xs text-gray-500">{r.department}</span></div> },
        { header: 'Gaji Pokok', accessor: 'salary', render: r => formatCurrency(r.salary) },
        { header: 'Bergabung', accessor: 'join_date', render: r => formatDate(r.join_date) },
        { header: 'Status', accessor: 'status', render: r => (
            <span className={`px-2 py-1 rounded text-xs uppercase ${r.status==='active'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{r.status}</span> 
        )},
        { header: 'Aksi', accessor: 'id', render: r => (
            <div className="flex gap-2">
                <button onClick={() => handleEdit(r)} className="text-blue-500 hover:bg-blue-50 p-1 rounded" title="Edit"><Edit size={16}/></button>
                <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:bg-red-50 p-1 rounded" title="Hapus"><Trash size={16}/></button>
            </div>
        )}
    ];

    return (
        <>
            <div className="p-4 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Database Karyawan</h3>
                <button onClick={() => { setModalMode('create'); setForm({name:'', position:'', department:'', salary:0, join_date:'', status:'active'}); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2"><Plus size={16}/> Karyawan Baru</button>
            </div>
            <CrudTable columns={cols} data={data} loading={loading} />
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode==='create'?"Tambah Karyawan":"Edit Karyawan"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="label">Nama Lengkap</label><input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Jabatan</label><input className="input-field" value={form.position} onChange={e => setForm({...form, position: e.target.value})} /></div>
                        <div><label className="label">Departemen</label><input className="input-field" value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
                    </div>
                    <div><label className="label">Gaji Pokok</label><input type="number" className="input-field" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Tanggal Masuk</label><input type="date" className="input-field" value={form.join_date} onChange={e => setForm({...form, join_date: e.target.value})} /></div>
                        <div>
                            <label className="label">Status</label>
                            <select className="input-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                                <option value="active">Active</option>
                                <option value="resigned">Resigned</option>
                                <option value="terminated">Terminated</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t mt-4 gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan Data</button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

// --- TAB ABSENSI ---
const AttendanceTab = () => {
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [empId, setEmpId] = useState('');

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await api.get('umh/v1/hr/attendance', { params: { date: dateFilter } });
            setAttendanceList(res.data || res || []);
        } catch (e) { 
            console.error(e);
            toast.error("Gagal memuat data absensi");
        }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAttendance(); }, [dateFilter]);

    const handleAttendance = async (type) => {
        if(!empId) return toast.error("Masukkan ID Karyawan");
        try {
            await api.post('umh/v1/hr/attendance', {
                employee_id: empId,
                type: type
            });
            toast.success(`Berhasil ${type === 'check_in' ? 'Masuk' : 'Pulang'}`);
            setEmpId('');
            fetchAttendance();
        } catch (e) { 
            toast.error(e.message || "Gagal absensi"); 
        }
    };

    const attCols = [
        { header: 'Karyawan', accessor: 'employee_name', render: r => <div><div className="font-bold text-gray-800">{r.employee_name}</div><div className="text-xs text-gray-500">{r.position}</div></div> },
        { header: 'Masuk', accessor: 'check_in_time', render: r => <span className="text-green-600 font-mono font-bold">{r.check_in_time}</span> },
        { header: 'Pulang', accessor: 'check_out_time', render: r => r.check_out_time ? <span className="text-blue-600 font-mono font-bold">{r.check_out_time}</span> : <span className="text-gray-400 italic">--:--</span> },
        { header: 'Status', accessor: 'status', render: r => <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs uppercase">{r.status}</span> },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-6 p-4">
            {/* Kiri: Input Absensi */}
            <div className="w-full md:w-1/3 bg-blue-50 p-6 rounded-xl border border-blue-100 h-fit">
                <h3 className="text-lg font-bold text-blue-800 mb-2">Input Kehadiran</h3>
                <p className="text-sm text-blue-600 mb-4">Masukkan ID Karyawan untuk mencatat jam masuk/pulang.</p>
                <div className="mb-4">
                    <input 
                        type="number" 
                        className="input-field text-center text-xl font-mono" 
                        placeholder="ID Karyawan"
                        value={empId}
                        onChange={e => setEmpId(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleAttendance('check_in')} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-sm transition-all">Check IN</button>
                    <button onClick={() => handleAttendance('check_out')} className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-sm transition-all">Check OUT</button>
                </div>
                <div className="mt-4 text-xs text-center text-blue-400">
                    * ID Karyawan bisa dilihat di tab Data Karyawan
                </div>
            </div>

            {/* Kanan: Tabel Riwayat */}
            <div className="w-full md:w-2/3">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700">Riwayat Harian</h3>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">Tanggal:</label>
                        <input type="date" className="input-field w-auto py-1 text-sm" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                    </div>
                </div>
                <div className="bg-white border rounded-lg overflow-hidden">
                    <CrudTable 
                        columns={attCols} 
                        data={attendanceList} 
                        loading={loading} 
                        emptyMessage="Belum ada data absensi pada tanggal ini."
                    />
                </div>
            </div>
        </div>
    );
};

export default HR;