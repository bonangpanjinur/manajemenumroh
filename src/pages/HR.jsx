import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { useData } from '../contexts/DataContext';
import { Plus, Users, Briefcase, DollarSign, UserCheck, CalendarCheck, Save } from 'lucide-react'; // Tambahkan icon yang kurang
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../utils/formatters';

const HR = () => {
    const { user } = useData();
    const { 
        data, 
        loading, 
        pagination, 
        fetchData, 
        createItem, 
        updateItem, 
        deleteItem,
        changePage,
        changeLimit
    } = useCRUD('umh/v1/hr');
    
    useEffect(() => { fetchData(); }, [fetchData]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Absensi State
    const [isAbsensiOpen, setIsAbsensiOpen] = useState(false);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState([]);

    const stats = useMemo(() => {
        if (!data) return { total: 0, active: 0, expense: 0 };
        return {
            total: pagination?.total_items || data.length,
            active: data.filter(d => d.status === 'active').length,
            expense: data.reduce((acc, curr) => acc + (parseFloat(curr.salary) || 0), 0)
        };
    }, [data, pagination]);

    const handleSearch = (q) => {
        setSearchQuery(q);
        fetchData({ page: 1, search: q });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = isEdit 
            ? await updateItem(formData.id, formData) 
            : await createItem(formData);
            
        if (success) {
            setIsModalOpen(false);
            fetchData();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin hapus data karyawan ini? Tindakan ini tidak bisa dibatalkan.')) {
            await deleteItem(id);
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setFormData(item);
            setIsEdit(true);
        } else {
            // FIX: Gunakan 'join_date'
            setFormData({ status: 'active', join_date: new Date().toISOString().split('T')[0] });
            setIsEdit(false);
        }
        setIsModalOpen(true);
    };

    // -- HANDLERS ABSENSI --
    const openAbsensi = () => {
        setIsAbsensiOpen(true);
        const initial = data
            .filter(emp => emp.status === 'active')
            .map(emp => ({
                employee_id: emp.id,
                name: emp.name,
                status: 'present'
            }));
        setAttendanceData(initial);
    };

    const handleAttendanceChange = (empId, status) => {
        setAttendanceData(prev => prev.map(item => 
            item.employee_id === empId ? { ...item, status } : item
        ));
    };

    const submitAttendance = async () => {
        try {
            await api.post('umh/v1/hr/attendance', {
                date: attendanceDate,
                entries: attendanceData
            });
            toast.success('Absensi berhasil disimpan');
            setIsAbsensiOpen(false);
        } catch (error) {
            toast.error('Gagal menyimpan absensi');
        }
    };

    const columns = [
        { 
            header: 'Nama Karyawan', 
            accessor: 'name', 
            render: (r) => (
                <div>
                    <div className="font-bold text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.email}</div>
                </div>
            )
        },
        { 
            header: 'Posisi & Kontak', 
            accessor: 'position', 
            render: (r) => (
                <div>
                    <div className="text-sm font-medium">{r.position || '-'}</div>
                    <div className="text-xs text-gray-500">{r.phone || '-'}</div>
                </div>
            )
        },
        { header: 'Gaji Pokok', accessor: 'salary', className: 'text-right', render: r => formatCurrency(r.salary) },
        // FIX: Gunakan 'join_date'
        { header: 'Bergabung', accessor: 'join_date', render: r => formatDate(r.join_date) },
        { 
            header: 'Status', 
            accessor: 'status', 
            render: r => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {r.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </span>
            ) 
        }
    ];

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-full ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <h3 className="text-xl font-bold text-gray-800">{value}</h3>
            </div>
        </div>
    );

    return (
        <Layout title="Manajemen SDM (HR)">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard icon={Users} label="Total Karyawan" value={stats.total} color="bg-blue-500" />
                <StatCard icon={UserCheck} label="Karyawan Aktif" value={stats.active} color="bg-green-500" />
                <StatCard icon={DollarSign} label="Est. Gaji Bulanan" value={formatCurrency(stats.expense)} color="bg-purple-500" />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="w-full md:w-1/3">
                    <SearchInput placeholder="Cari nama atau posisi..." onSearch={handleSearch} />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
                        <Plus size={18}/> Tambah Karyawan
                    </button>
                    <button onClick={openAbsensi} className="btn-secondary flex items-center gap-2">
                        <CalendarCheck size={18}/> Isi Absensi
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={openModal}
                    onDelete={(item) => handleDelete(item.id)}
                />
                <Pagination pagination={pagination} onPageChange={changePage} onLimitChange={changeLimit} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? "Edit Data Karyawan" : "Tambah Karyawan Baru"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="label">Nama Lengkap</label>
                            <input className="input-field" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Contoh: Ahmad Fauzi" required />
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input type="email" className="input-field" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@perusahaan.com"/>
                        </div>
                        <div>
                            <label className="label">No. Telepon / WA</label>
                            <input className="input-field" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0812..."/>
                        </div>
                        <div>
                            <label className="label">Posisi / Jabatan</label>
                            <input className="input-field" value={formData.position || ''} onChange={e => setFormData({...formData, position: e.target.value})} placeholder="Contoh: Staff Keuangan"/>
                        </div>
                        <div>
                            <label className="label">Tanggal Bergabung</label>
                            {/* FIX: Gunakan 'join_date' */}
                            <input type="date" className="input-field" value={formData.join_date || ''} onChange={e => setFormData({...formData, join_date: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">Gaji Pokok (Rp)</label>
                            <input type="number" className="input-field" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="0"/>
                        </div>
                        <div>
                            <label className="label">Status Kepegawaian</label>
                            <select className="input-field" value={formData.status || 'active'} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="active">Aktif</option>
                                <option value="inactive">Tidak Aktif / Resign</option>
                                <option value="probation">Masa Percobaan</option>
                                <option value="leave">Cuti</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary w-32">Simpan</button>
                    </div>
                </form>
            </Modal>

            {/* Modal Absensi */}
            <Modal isOpen={isAbsensiOpen} onClose={() => setIsAbsensiOpen(false)} title="Absensi Karyawan">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4 bg-blue-50 p-3 rounded">
                        <label className="font-bold text-sm">Tanggal:</label>
                        <input type="date" className="bg-white border rounded px-2 py-1 text-sm" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} />
                    </div>
                    <div className="max-h-96 overflow-y-auto border rounded">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 uppercase font-bold">
                                <tr>
                                    <th className="px-4 py-3">Nama Karyawan</th>
                                    <th className="px-4 py-3 text-center">Hadir</th>
                                    <th className="px-4 py-3 text-center">Izin/Sakit</th>
                                    <th className="px-4 py-3 text-center">Alpha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.map(item => (
                                    <tr key={item.employee_id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{item.name}</td>
                                        <td className="px-4 py-3 text-center">
                                            <input type="radio" name={`status_${item.employee_id}`} checked={item.status === 'present'} onChange={() => handleAttendanceChange(item.employee_id, 'present')} className="accent-green-600 w-4 h-4" />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input type="radio" name={`status_${item.employee_id}`} checked={item.status === 'sick'} onChange={() => handleAttendanceChange(item.employee_id, 'sick')} className="accent-yellow-500 w-4 h-4" />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <input type="radio" name={`status_${item.employee_id}`} checked={item.status === 'alpha'} onChange={() => handleAttendanceChange(item.employee_id, 'alpha')} className="accent-red-600 w-4 h-4" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end pt-4 gap-2">
                        <button onClick={() => setIsAbsensiOpen(false)} className="btn-secondary">Batal</button>
                        <button onClick={submitAttendance} className="btn-primary flex items-center gap-2">
                            <Save size={18}/> Simpan Absensi
                        </button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};

export default HR;