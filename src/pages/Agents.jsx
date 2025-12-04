import React, { useState } from 'react';
import Layout from '../components/Layout';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { Plus, Users, UserCheck } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Agents = () => {
    const { data, loading, fetchData } = useCRUD('umh/v1/agents');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State (Gabungan User Login + Data Agen)
    const initialForm = {
        // User Data
        username: '', email: '', password: '', full_name: '', phone: '',
        // Agent Data
        commission_type: 'fixed', commission_value: 0, bank_details: ''
    };
    const [formData, setFormData] = useState(initialForm);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Buat User Login dulu
            const userPayload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                role_key: 'agent'
            };
            const userRes = await api.post('umh/v1/users', userPayload);
            
            // Handle variasi respons backend
            const userId = userRes.id || (userRes.data && userRes.data.id);
            if (!userId) throw new Error("Gagal membuat user login");

            // 2. Buat Profil Agen linked to User ID
            const agentPayload = {
                umh_user_id: userId,
                commission_type: formData.commission_type,
                commission_value: formData.commission_value,
                bank_details: formData.bank_details
            };
            await api.post('umh/v1/agents', agentPayload);

            toast.success("Agen baru berhasil didaftarkan");
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error("Gagal: " + err.message);
        }
    };

    const columns = [
        { header: 'Nama Agen', accessor: 'agent_name', render: r => (
            <div>
                <div className="font-bold text-gray-900">{r.agent_name}</div>
                <div className="text-xs text-gray-500">{r.email}</div>
            </div>
        )},
        { header: 'Level', accessor: 'level', render: r => (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${r.level==='master'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>
                {r.level}
            </span>
        )},
        { header: 'Upline', accessor: 'upline_name', render: r => r.upline_name || '-' },
        { header: 'Komisi', accessor: 'commission_value', render: r => formatCurrency(r.commission_value) },
        { header: 'Status', accessor: 'status', render: r => r.status },
        { header: 'Bergabung', accessor: 'joined_date', render: r => formatDate(r.joined_date) },
    ];

    return (
        <Layout title="Kemitraan & Agen">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex justify-between">
                <h2 className="text-lg font-bold text-gray-700">Daftar Mitra</h2>
                <button onClick={() => { setFormData(initialForm); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <Plus size={18}/> Registrasi Agen Baru
                </button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={columns} data={data} loading={loading} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrasi Agen Baru" size="max-w-4xl">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-bold text-blue-800 border-b pb-2">Akun Login</h4>
                            <div><label className="label">Nama Lengkap</label><input name="full_name" className="input-field" value={formData.full_name} onChange={handleChange} required /></div>
                            <div><label className="label">Username</label><input name="username" className="input-field" value={formData.username} onChange={handleChange} required /></div>
                            <div><label className="label">Email</label><input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required /></div>
                            <div><label className="label">Password</label><input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} required /></div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-green-800 border-b pb-2">Data Keagenan</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="label">Tipe Komisi</label><select name="commission_type" className="input-field" value={formData.commission_type} onChange={handleChange}><option value="fixed">Fixed (Nominal)</option><option value="percent">Persentase (%)</option></select></div>
                                <div><label className="label">Nilai Komisi</label><input type="number" name="commission_value" className="input-field" value={formData.commission_value} onChange={handleChange} /></div>
                            </div>
                            <div><label className="label">Info Bank (Nama/No Rek)</label><textarea name="bank_details" className="input-field h-24" value={formData.bank_details} onChange={handleChange} placeholder="BCA 123456 a.n Budi"></textarea></div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-6 mt-4 border-t">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary">Daftarkan Agen</button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
};

export default Agents;