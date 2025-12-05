import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Users, Clock, DollarSign, Briefcase, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const HR = () => {
    const [activeTab, setActiveTab] = useState('employees');
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/hr-employees'); // Pastikan route ini sesuai registered route
    const [payrollData, setPayrollData] = useState([]);
    
    // State Modal Employee
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', position: '', salary: 0, status: 'active' });
    const [mode, setMode] = useState('create');

    useEffect(() => {
        if (activeTab === 'payroll') fetchPayroll();
    }, [activeTab]);

    const fetchPayroll = async () => {
        try {
            const res = await api.get('umh/v1/hr/payroll');
            if (res.data.success) setPayrollData(res.data.data);
        } catch (e) { console.error(e); }
    };

    const handleSaveEmployee = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') await api.post('umh/v1/hr-employees', form); // Sesuaikan endpoint
            else await api.put(`umh/v1/hr-employees/${form.id}`, form);
            setIsModalOpen(false);
            fetchData();
            toast.success("Data Karyawan Disimpan");
        } catch (e) { toast.error("Gagal simpan"); }
    };

    const empColumns = [
        { header: 'Nama Karyawan', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-800">{r.name}</div>
                <div className="text-xs text-gray-500">{r.email}</div>
            </div>
        )},
        { header: 'Posisi', accessor: 'position', render: r => (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1 w-fit">
                <Briefcase size={10}/> {r.position}
            </span>
        )},
        { header: 'Gaji Pokok', accessor: 'salary', render: r => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(r.salary) },
        { header: 'Status', accessor: 'status', render: r => <span className={`uppercase text-[10px] font-bold px-2 py-1 rounded ${r.status==='active'?'bg-green-100 text-green-600':'bg-red-100'}`}>{r.status}</span> }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Human Resources (HRD)</h1>
                {activeTab === 'employees' && (
                    <button onClick={() => { setForm({}); setMode('create'); setIsModalOpen(true); }} className="btn-primary flex gap-2"><Plus size={18}/> Karyawan Baru</button>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b space-x-6">
                <button onClick={() => setActiveTab('employees')} className={`pb-3 text-sm font-medium flex items-center gap-2 ${activeTab==='employees' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                    <Users size={16}/> Data Karyawan
                </button>
                <button onClick={() => setActiveTab('attendance')} className={`pb-3 text-sm font-medium flex items-center gap-2 ${activeTab==='attendance' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                    <Clock size={16}/> Absensi
                </button>
                <button onClick={() => setActiveTab('payroll')} className={`pb-3 text-sm font-medium flex items-center gap-2 ${activeTab==='payroll' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>
                    <DollarSign size={16}/> Penggajian
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'employees' && (
                <div className="bg-white rounded-xl shadow border border-gray-200">
                    <CrudTable columns={empColumns} data={data} loading={loading} onEdit={(item)=>{setForm(item); setMode('edit'); setIsModalOpen(true)}} onDelete={deleteItem} />
                </div>
            )}

            {activeTab === 'payroll' && (
                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700 font-bold border-b">
                            <tr>
                                <th className="p-4">Nama</th>
                                <th className="p-4">Jabatan</th>
                                <th className="p-4">Gapok</th>
                                <th className="p-4">Kehadiran</th>
                                <th className="p-4">Tunjangan</th>
                                <th className="p-4 text-right">Total Gaji</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrollData.map((row, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-bold">{row.name}</td>
                                    <td className="p-4">{row.position}</td>
                                    <td className="p-4">{new Intl.NumberFormat('id-ID').format(row.basic_salary)}</td>
                                    <td className="p-4">{row.attendance_days} Hari</td>
                                    <td className="p-4">{new Intl.NumberFormat('id-ID').format(row.allowance)}</td>
                                    <td className="p-4 text-right font-bold text-green-600">{new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(row.total_salary)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Employee */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode==='create'?"Tambah Karyawan":"Edit Karyawan"}>
                <form onSubmit={handleSaveEmployee} className="space-y-4">
                    <div><label className="label">Nama Lengkap</label><input className="input-field" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
                    <div><label className="label">Email</label><input className="input-field" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="label">Posisi / Jabatan</label><input className="input-field" value={form.position} onChange={e=>setForm({...form, position:e.target.value})}/></div>
                        <div><label className="label">Gaji Pokok</label><input className="input-field" type="number" value={form.salary} onChange={e=>setForm({...form, salary:e.target.value})}/></div>
                    </div>
                    <div>
                        <label className="label">Status</label>
                        <select className="input-field" value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
                            <option value="active">Aktif</option>
                            <option value="resigned">Resign</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-4"><button className="btn-primary">Simpan</button></div>
                </form>
            </Modal>
        </div>
    );
};

export default HR;