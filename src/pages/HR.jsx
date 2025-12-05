import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Users, Briefcase, Calendar, Plus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const HR = () => {
    const [activeTab, setActiveTab] = useState('employees'); // 'employees' or 'attendance'
    
    // Switch endpoint
    const getEndpoint = () => activeTab === 'employees' ? 'umh/v1/hr/employees' : 'umh/v1/hr/attendance';
    const { data, loading, fetchData, deleteItem } = useCRUD(getEndpoint());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [form, setForm] = useState({});

    useEffect(() => { 
        setForm({});
        fetchData(); 
    }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = getEndpoint();
            if (mode === 'create') await api.post(endpoint, form);
            else await api.put(`${endpoint}/${form.id}`, form);
            
            toast.success("Data berhasil disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch (e) { toast.error("Gagal simpan"); }
    };

    const getColumns = () => {
        if (activeTab === 'employees') {
            return [
                { header: 'Nama Karyawan', accessor: 'name', render: r => (
                    <div>
                        <div className="font-bold text-gray-900">{r.name}</div>
                        <div className="text-xs text-gray-500">{r.email}</div>
                    </div>
                )},
                { header: 'Jabatan', accessor: 'position', render: r => <span className="text-sm font-medium">{r.position}</span> },
                { header: 'Divisi', accessor: 'division', render: r => <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{r.division}</span> },
                { header: 'Status', accessor: 'status', render: r => <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${r.status==='active'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{r.status}</span> },
            ];
        } else {
            return [
                { header: 'Tanggal', accessor: 'date', render: r => <span className="font-mono text-gray-600">{r.date}</span> },
                { header: 'Nama', accessor: 'employee_name' },
                { header: 'Jam Masuk', accessor: 'check_in_time', render: r => <span className="text-green-600 font-bold">{r.check_in_time || '-'}</span> },
                { header: 'Jam Pulang', accessor: 'check_out_time', render: r => <span className="text-red-600 font-bold">{r.check_out_time || '-'}</span> },
                { header: 'Status', accessor: 'status', render: r => <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{r.status}</span> },
            ];
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">SDM & Kepegawaian</h1>
                        <p className="text-gray-500 text-sm">Data karyawan, absensi, dan struktur organisasi.</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-6 border-b border-gray-200">
                <button onClick={() => setActiveTab('employees')} className={`pb-3 px-2 flex items-center gap-2 font-medium border-b-2 transition-colors ${activeTab==='employees' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <Briefcase size={18}/> Data Karyawan
                </button>
                <button onClick={() => setActiveTab('attendance')} className={`pb-3 px-2 flex items-center gap-2 font-medium border-b-2 transition-colors ${activeTab==='attendance' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    <Calendar size={18}/> Rekap Absensi
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 flex justify-between items-center bg-gray-50 rounded-t-xl border-b">
                    <h3 className="font-bold text-gray-700">
                        {activeTab === 'employees' ? 'Direktori Pegawai' : 'Log Kehadiran'}
                    </h3>
                    <button 
                        onClick={() => { setForm({}); setMode('create'); setIsModalOpen(true); }}
                        className="btn-primary flex items-center gap-2 text-sm"
                    >
                        <Plus size={16}/> {activeTab === 'employees' ? 'Tambah Karyawan' : 'Input Absensi Manual'}
                    </button>
                </div>
                <CrudTable 
                    columns={getColumns()} 
                    data={data} 
                    loading={loading}
                    onEdit={(item) => { setForm(item); setMode('edit'); setIsModalOpen(true); }}
                    onDelete={(item) => deleteItem(item.id)}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode==='create' ? "Tambah Data" : "Edit Data"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'employees' ? (
                        <>
                            <div>
                                <label className="label">Nama Lengkap</label>
                                <input className="input-field" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Email</label>
                                    <input type="email" className="input-field" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                                </div>
                                <div>
                                    <label className="label">No. HP</label>
                                    <input className="input-field" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Jabatan</label>
                                    <input className="input-field" value={form.position || ''} onChange={e => setForm({...form, position: e.target.value})} />
                                </div>
                                <div>
                                    <label className="label">Divisi</label>
                                    <select className="input-field" value={form.division || 'Operasional'} onChange={e => setForm({...form, division: e.target.value})}>
                                        <option value="Operasional">Operasional</option>
                                        <option value="Keuangan">Keuangan</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="IT">IT / Support</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="label">Gaji Pokok</label>
                                <input type="number" className="input-field" value={form.salary || 0} onChange={e => setForm({...form, salary: e.target.value})} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="label">ID Karyawan</label>
                                <input type="number" className="input-field" value={form.employee_id || ''} onChange={e => setForm({...form, employee_id: e.target.value})} required />
                            </div>
                            <div>
                                <label className="label">Tanggal</label>
                                <input type="date" className="input-field" value={form.date || ''} onChange={e => setForm({...form, date: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Jam Masuk</label>
                                    <input type="time" className="input-field" value={form.check_in_time || ''} onChange={e => setForm({...form, check_in_time: e.target.value})} />
                                </div>
                                <div>
                                    <label className="label">Jam Pulang</label>
                                    <input type="time" className="input-field" value={form.check_out_time || ''} onChange={e => setForm({...form, check_out_time: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Status Kehadiran</label>
                                <select className="input-field" value={form.status || 'present'} onChange={e => setForm({...form, status: e.target.value})}>
                                    <option value="present">Hadir</option>
                                    <option value="sick">Sakit</option>
                                    <option value="leave">Cuti</option>
                                    <option value="alpha">Alpha</option>
                                </select>
                            </div>
                        </>
                    )}
                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default HR;