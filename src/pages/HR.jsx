import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Users, Clock, DollarSign, Briefcase, Plus, Settings, Save, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const HR = () => {
    const [activeTab, setActiveTab] = useState('employees');
    
    // --- STATE TAB 1: KARYAWAN ---
    const { data: employees, loading, fetchData, deleteItem } = useCRUD('umh/v1/hr-employees');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [empForm, setEmpForm] = useState({});
    const [mode, setMode] = useState('create');

    // --- STATE TAB 2: ABSENSI ---
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceList, setAttendanceList] = useState([]);
    const [loadingAtt, setLoadingAtt] = useState(false);

    // --- STATE TAB 3: PENGGAJIAN ---
    const [payrollData, setPayrollData] = useState([]);
    const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
    const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());

    // --- STATE TAB 4: PENGATURAN ---
    const [settings, setSettings] = useState({
        allowance_transport: 0,
        allowance_meal: 0,
        deduction_alpha: 0,
        deduction_late: 0
    });

    // --- EFFECT HANDLERS ---
    useEffect(() => {
        if (activeTab === 'attendance') fetchAttendance();
        if (activeTab === 'payroll') fetchPayroll();
        if (activeTab === 'settings') fetchSettings();
    }, [activeTab, attendanceDate, payrollMonth]);

    // --- API CALLS ---
    const fetchAttendance = async () => {
        setLoadingAtt(true);
        try {
            const res = await api.get(`umh/v1/hr/attendance?date=${attendanceDate}`);
            if (res.data.success) setAttendanceList(res.data.data);
        } catch(e) { toast.error("Gagal load absensi"); }
        finally { setLoadingAtt(false); }
    };

    const saveAttendance = async () => {
        try {
            await api.post('umh/v1/hr/attendance', { date: attendanceDate, records: attendanceList });
            toast.success("Absensi berhasil disimpan!");
        } catch(e) { toast.error("Gagal simpan"); }
    };

    const fetchPayroll = async () => {
        try {
            const res = await api.get(`umh/v1/hr/payroll?month=${payrollMonth}&year=${payrollYear}`);
            if (res.data.success) setPayrollData(res.data.data);
        } catch(e) { console.error(e); }
    };

    const fetchSettings = async () => {
        try {
            const res = await api.get('umh/v1/hr/settings');
            if (res.data.success) setSettings(res.data.data);
        } catch(e) { console.error(e); }
    };

    const saveSettings = async (e) => {
        e.preventDefault();
        try {
            await api.post('umh/v1/hr/settings', settings);
            toast.success("Pengaturan diperbarui");
        } catch(e) { toast.error("Gagal simpan"); }
    };

    // --- HELPER ---
    const updateAttendanceStatus = (empId, status) => {
        const updated = attendanceList.map(item => 
            item.employee_id === empId ? { ...item, status } : item
        );
        setAttendanceList(updated);
    };

    const formatMoney = (n) => new Intl.NumberFormat('id-ID').format(n);

    // --- RENDER ---
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Human Resources</h1>
                {activeTab === 'employees' && (
                    <button onClick={() => { setEmpForm({}); setMode('create'); setIsModalOpen(true); }} className="btn-primary flex gap-2"><Plus size={18}/> Karyawan Baru</button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex border-b bg-white rounded-t-xl px-2 shadow-sm overflow-x-auto">
                {[
                    {id:'employees', icon:Users, label:'Data Karyawan'},
                    {id:'attendance', icon:Clock, label:'Absensi Harian'},
                    {id:'payroll', icon:DollarSign, label:'Penggajian'},
                    {id:'settings', icon:Settings, label:'Pengaturan Gaji'}
                ].map(t => (
                    <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`px-6 py-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab===t.id?'border-blue-600 text-blue-600':'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        <t.icon size={16}/> {t.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-b-xl shadow border border-gray-200 border-t-0 p-6 min-h-[400px]">
                
                {/* TAB 1: KARYAWAN */}
                {activeTab === 'employees' && (
                    <CrudTable 
                        columns={[
                            { header: 'Nama', accessor: 'name', render: r=><div><div className="font-bold">{r.name}</div><div className="text-xs text-gray-500">{r.email}</div></div> },
                            { header: 'Posisi', accessor: 'position' },
                            { header: 'Gaji Pokok', accessor: 'salary', render: r=>`Rp ${formatMoney(r.salary)}` },
                            { header: 'Status', accessor: 'status', render: r=><span className="uppercase text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">{r.status}</span> }
                        ]} 
                        data={employees} loading={loading} onEdit={(r)=>{setEmpForm(r); setMode('edit'); setIsModalOpen(true)}} onDelete={deleteItem} 
                    />
                )}

                {/* TAB 2: ABSENSI */}
                {activeTab === 'attendance' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                            <div className="flex items-center gap-2">
                                <Calendar className="text-gray-500"/>
                                <input type="date" className="input-field py-1" value={attendanceDate} onChange={e=>setAttendanceDate(e.target.value)}/>
                            </div>
                            <button onClick={saveAttendance} className="btn-primary flex gap-2"><Save size={16}/> Simpan Absensi</button>
                        </div>

                        {loadingAtt ? <div className="text-center p-4">Loading...</div> : (
                            <table className="w-full text-sm text-left border rounded-lg overflow-hidden">
                                <thead className="bg-gray-100 text-gray-700 font-bold">
                                    <tr>
                                        <th className="p-3">Nama Karyawan</th>
                                        <th className="p-3 text-center">Hadir</th>
                                        <th className="p-3 text-center">Sakit</th>
                                        <th className="p-3 text-center">Izin</th>
                                        <th className="p-3 text-center">Alpha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {attendanceList.map(emp => (
                                        <tr key={emp.employee_id} className="hover:bg-gray-50">
                                            <td className="p-3 font-medium">{emp.name}<div className="text-xs text-gray-500">{emp.position}</div></td>
                                            {['present','sick','permission','alpha'].map(status => (
                                                <td key={status} className="p-3 text-center">
                                                    <input 
                                                        type="radio" 
                                                        name={`att_${emp.employee_id}`}
                                                        checked={emp.status === status}
                                                        onChange={()=>updateAttendanceStatus(emp.employee_id, status)}
                                                        className="w-4 h-4 text-blue-600"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* TAB 3: PAYROLL */}
                {activeTab === 'payroll' && (
                    <div className="space-y-4">
                         <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-700">Periode:</span>
                                <select value={payrollMonth} onChange={e=>setPayrollMonth(e.target.value)} className="input-field py-1 w-32">
                                    {[...Array(12)].map((_,i)=><option key={i} value={i+1}>{new Date(0,i).toLocaleString('id-ID',{month:'long'})}</option>)}
                                </select>
                                <input type="number" value={payrollYear} onChange={e=>setPayrollYear(e.target.value)} className="input-field py-1 w-24"/>
                            </div>
                            <div className="text-sm text-gray-500 italic">Otomatis dihitung dari absensi</div>
                        </div>
                        <table className="w-full text-sm text-left border rounded-lg">
                            <thead className="bg-blue-50 text-blue-800 font-bold">
                                <tr>
                                    <th className="p-3">Karyawan</th>
                                    <th className="p-3">Kehadiran</th>
                                    <th className="p-3 text-right">Gaji Pokok</th>
                                    <th className="p-3 text-right">Tunjangan (+)</th>
                                    <th className="p-3 text-right text-red-600">Potongan (-)</th>
                                    <th className="p-3 text-right">Total Terima</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {payrollData.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="p-3 font-bold">{row.name}</td>
                                        <td className="p-3 text-xs space-y-1">
                                            <div className="text-green-600">Hadir: {row.stats.present}</div>
                                            <div className="text-red-500">Alpha: {row.stats.alpha}</div>
                                        </td>
                                        <td className="p-3 text-right">{formatMoney(row.basic_salary)}</td>
                                        <td className="p-3 text-right text-green-600">{formatMoney(row.allowances)}</td>
                                        <td className="p-3 text-right text-red-500">{formatMoney(row.deductions)}</td>
                                        <td className="p-3 text-right font-bold text-lg bg-gray-50">{formatMoney(row.total_salary)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TAB 4: SETTINGS */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl">
                        <h3 className="font-bold text-gray-700 mb-4">Konfigurasi Komponen Gaji</h3>
                        <form onSubmit={saveSettings} className="space-y-6">
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-4">
                                <h4 className="font-bold text-green-800 text-sm">Penambah (Tunjangan)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Transport Harian (Rp)</label>
                                        <input type="number" className="input-field" value={settings.allowance_transport} onChange={e=>setSettings({...settings, allowance_transport:e.target.value})}/>
                                    </div>
                                    <div>
                                        <label className="label">Uang Makan Harian (Rp)</label>
                                        <input type="number" className="input-field" value={settings.allowance_meal} onChange={e=>setSettings({...settings, allowance_meal:e.target.value})}/>
                                    </div>
                                </div>
                                <p className="text-xs text-green-600">*Dikali jumlah kehadiran (Hadir).</p>
                            </div>

                            <div className="bg-red-50 p-4 rounded-lg border border-red-200 space-y-4">
                                <h4 className="font-bold text-red-800 text-sm">Pengurang (Potongan)</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Denda Alpha (Rp)</label>
                                        <input type="number" className="input-field" value={settings.deduction_alpha} onChange={e=>setSettings({...settings, deduction_alpha:e.target.value})}/>
                                    </div>
                                    <div>
                                        <label className="label">Denda Terlambat (Rp)</label>
                                        <input type="number" className="input-field" value={settings.deduction_late} onChange={e=>setSettings({...settings, deduction_late:e.target.value})}/>
                                    </div>
                                </div>
                                <p className="text-xs text-red-600">*Dikali jumlah ketidakhadiran (Alpha).</p>
                            </div>

                            <button className="btn-primary w-full">Simpan Konfigurasi</button>
                        </form>
                    </div>
                )}
            </div>

            {/* Modal Karyawan (Simplifikasi dari sebelumnya) */}
            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title="Form Karyawan">
                {/* ... (Isi form karyawan sama seperti sebelumnya) ... */}
                 <form onSubmit={async (e)=>{
                    e.preventDefault();
                    try {
                        await api.post('umh/v1/hr-employees', empForm);
                        setIsModalOpen(false); fetchData(); toast.success("Tersimpan");
                    } catch(err){ toast.error("Gagal"); }
                }} className="space-y-4">
                    <div><label className="label">Nama</label><input className="input-field" value={empForm.name||''} onChange={e=>setEmpForm({...empForm,name:e.target.value})} required/></div>
                    <div><label className="label">Posisi</label><input className="input-field" value={empForm.position||''} onChange={e=>setEmpForm({...empForm,position:e.target.value})}/></div>
                    <div><label className="label">Gaji Pokok</label><input className="input-field" type="number" value={empForm.salary||''} onChange={e=>setEmpForm({...empForm,salary:e.target.value})}/></div>
                    <button className="btn-primary w-full mt-4">Simpan</button>
                </form>
            </Modal>
        </div>
    );
};

export default HR;