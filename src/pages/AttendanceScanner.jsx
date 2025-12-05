import React, { useState } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Users, Plus, QrCode, Printer, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const HR = () => {
    const { data, loading, fetchData, deleteItem } = useCRUD('umh/v1/hr/employees');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [mode, setMode] = useState('create');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const initialForm = { 
        name: '', 
        email: '', 
        phone: '', 
        position: '', 
        division: 'Operasional',
        salary: 0,
        status: 'active'
    };
    const [form, setForm] = useState(initialForm);

    // Format Rupiah
    const formatMoney = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(n || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'create') {
                await api.post('umh/v1/hr/employees', form);
                toast.success("Karyawan berhasil ditambahkan");
            } else {
                const id = form.uuid || form.id;
                await api.put(`umh/v1/hr/employees/${id}`, form);
                toast.success("Data karyawan diperbarui");
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Gagal: " + err.message);
        }
    };

    const handleEdit = (item) => {
        setMode('edit');
        setForm(item);
        setIsModalOpen(true);
    };

    const handleShowQr = (item) => {
        setSelectedEmployee(item);
        setIsQrModalOpen(true);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('id-card-print-area');
        const originalContent = document.body.innerHTML;
        
        // Teknik simple print area khusus
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContent;
        window.location.reload(); // Reload agar event listener React kembali normal
    };

    const columns = [
        { header: 'Nama Karyawan', accessor: 'name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.name}</div>
                <div className="text-xs text-gray-500">{r.position}</div>
            </div>
        )},
        { header: 'Divisi', accessor: 'division', render: r => (
            <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                {r.division}
            </span>
        )},
        { header: 'Kontak', accessor: 'phone', render: r => (
            <div className="text-sm text-gray-600">
                <div>{r.phone}</div>
                <div className="text-xs text-gray-400">{r.email}</div>
            </div>
        )},
        { header: 'ID Card', accessor: 'uuid', render: r => (
            <button 
                onClick={() => handleShowQr(r)}
                className="flex items-center gap-1 bg-gray-800 text-white px-3 py-1.5 rounded text-xs hover:bg-black transition-colors"
            >
                <QrCode size={14} /> Lihat QR
            </button>
        )}
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Karyawan (HR)</h1>
                    <p className="text-gray-500 text-sm">Kelola data staff dan cetak kartu absensi.</p>
                </div>
                <button 
                    onClick={() => { setMode('create'); setForm(initialForm); setIsModalOpen(true); }} 
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18}/> Tambah Karyawan
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <CrudTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    onEdit={handleEdit}
                    onDelete={deleteItem}
                />
            </div>

            {/* Modal Form Input Karyawan */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={mode === 'create' ? "Tambah Karyawan" : "Edit Karyawan"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label">Nama Lengkap</label>
                        <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Posisi / Jabatan</label>
                            <input className="input-field" value={form.position} onChange={e => setForm({...form, position: e.target.value})} placeholder="Staff Admin" />
                        </div>
                        <div>
                            <label className="label">Divisi</label>
                            <select className="input-field" value={form.division} onChange={e => setForm({...form, division: e.target.value})}>
                                <option value="Operasional">Operasional</option>
                                <option value="Keuangan">Keuangan</option>
                                <option value="Marketing">Marketing</option>
                                <option value="IT">IT & Support</option>
                                <option value="HRGA">HR & GA</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Email</label>
                            <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="label">No. Telepon</label>
                            <input className="input-field" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="label">Gaji Pokok</label>
                        <input type="number" className="input-field" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Simpan</button>
                    </div>
                </form>
            </Modal>

            {/* Modal ID Card & QR Code */}
            {isQrModalOpen && selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-700">ID Card Karyawan</h3>
                            <button onClick={() => setIsQrModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        
                        {/* Area yang akan dicetak */}
                        <div id="id-card-print-area" className="p-6 flex flex-col items-center justify-center bg-white">
                            <div className="w-full border-2 border-gray-800 rounded-xl overflow-hidden relative" style={{ height: '450px', width: '300px' }}>
                                {/* Header Card */}
                                <div className="bg-gray-800 h-24 w-full flex items-center justify-center">
                                    <h2 className="text-white font-bold text-xl tracking-wider">STAFF ID</h2>
                                </div>
                                
                                {/* Photo Placeholder */}
                                <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
                                    <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-md flex items-center justify-center text-gray-400">
                                        <Users size={40} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="mt-16 text-center px-4">
                                    <h3 className="text-xl font-bold text-gray-900 uppercase">{selectedEmployee.name}</h3>
                                    <p className="text-blue-600 font-medium">{selectedEmployee.position}</p>
                                    <p className="text-xs text-gray-400 mt-1">{selectedEmployee.division}</p>

                                    {/* QR Code Generator (Tanpa Library Berat) */}
                                    <div className="my-6 flex justify-center">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedEmployee.uuid}`} 
                                            alt="QR Code Absensi"
                                            className="w-32 h-32 border p-1 rounded"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400">Scan QR ini untuk Absensi Masuk/Pulang</p>
                                </div>

                                {/* Footer */}
                                <div className="absolute bottom-0 w-full bg-gray-100 py-2 text-center border-t">
                                    <p className="text-[10px] font-mono text-gray-500">{selectedEmployee.uuid.slice(0, 8).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t flex justify-center gap-3">
                            <button onClick={() => setIsQrModalOpen(false)} className="btn-secondary">Tutup</button>
                            <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
                                <Printer size={16} /> Cetak ID Card
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HR;