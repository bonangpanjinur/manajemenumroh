import React, { useState, useEffect } from 'react';
import CrudTable from '../components/CrudTable';
import Modal from '../components/Modal';
import useCRUD from '../hooks/useCRUD';
import api from '../utils/api';
import { User, Plus, MapPin, Phone, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const Jamaah = () => {
    // 1. Fetch Data Jamaah
    const { data = [], loading, fetchData, deleteItem } = useCRUD('umh/v1/jamaah');
    
    // 2. Fetch Master Kota untuk Dropdown
    const [cities, setCities] = useState([]);
    useEffect(() => {
        api.get('umh/v1/cities').then(res => res.data.success && setCities(res.data.data));
    }, []);

    // 3. State Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const initialForm = { full_name: '', nik: '', passport_number: '', gender: 'L', phone: '', city_id: '', address: '' };
    const [form, setForm] = useState(initialForm);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const endpoint = form.id ? `umh/v1/jamaah/${form.id}` : 'umh/v1/jamaah';
            const method = form.id ? 'put' : 'post';
            await api[method](endpoint, form);
            toast.success("Data Jemaah berhasil disimpan");
            setIsModalOpen(false);
            fetchData();
        } catch(e) { toast.error("Gagal menyimpan data"); }
    };

    const cols = [
        { header: 'Nama Lengkap', accessor: 'full_name', render: r => <div><div className="font-bold text-gray-800">{r.full_name}</div><div className="text-xs text-gray-500">{r.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div></div> },
        { header: 'Identitas', accessor: 'passport_number', render: r => <div className="space-y-1"><span className="block text-xs bg-blue-50 text-blue-700 px-1 rounded w-fit">P: {r.passport_number||'-'}</span><span className="block text-xs text-gray-500">NIK: {r.nik||'-'}</span></div> },
        { header: 'Kontak', accessor: 'phone', render: r => <div className="text-sm text-gray-600">{r.phone||'-'}</div> },
        { header: 'Kota Asal', accessor: 'city_id', render: r => {
            // Find city name locally (optional optimization: join in backend)
            const city = cities.find(c => c.id == r.city_id);
            return <span className="text-sm">{city ? city.name : '-'}</span>
        }},
        { header: 'Status', accessor: 'status', render: r => <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${r.status==='active_jamaah'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>{r.status.replace('_',' ')}</span> }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Database Jemaah</h1>
                    <p className="text-sm text-gray-500">Kelola data jemaah, alumni, dan calon prospek.</p>
                </div>
                <button onClick={()=>{setForm(initialForm); setIsModalOpen(true)}} className="btn-primary flex gap-2"><Plus size={18}/> Tambah Jemaah</button>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200">
                <CrudTable columns={cols} data={data} loading={loading} onEdit={(r)=>{setForm(r); setIsModalOpen(true)}} onDelete={deleteItem} />
            </div>

            <Modal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} title="Form Data Jemaah">
                <form onSubmit={handleSave} className="space-y-4">
                    
                    {/* Section Pribadi */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <h4 className="font-bold text-gray-700 text-sm border-b pb-2 mb-2 flex items-center gap-2"><User size={14}/> Data Pribadi</h4>
                        <div>
                            <label className="label">Nama Lengkap (Sesuai Paspor/KTP)</label>
                            <input className="input-field" value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} required placeholder="Contoh: Muhammad Abdullah"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="label">NIK (KTP)</label><input className="input-field" value={form.nik} onChange={e=>setForm({...form, nik:e.target.value})}/></div>
                            <div><label className="label">Jenis Kelamin</label><select className="input-field" value={form.gender} onChange={e=>setForm({...form, gender:e.target.value})}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                        </div>
                    </div>

                    {/* Section Dokumen & Kontak */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                        <h4 className="font-bold text-gray-700 text-sm border-b pb-2 mb-2 flex items-center gap-2"><CreditCard size={14}/> Dokumen & Kontak</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="label">Nomor Paspor</label><input className="input-field" value={form.passport_number} onChange={e=>setForm({...form, passport_number:e.target.value})} placeholder="X1234567"/></div>
                            <div><label className="label">WhatsApp</label><input className="input-field" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="0812..."/></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Kota Domisili</label>
                                <select className="input-field" value={form.city_id} onChange={e=>setForm({...form, city_id:e.target.value})}>
                                    <option value="">-- Pilih Kota --</option>
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.province})</option>)}
                                </select>
                            </div>
                            <div><label className="label">Alamat Lengkap</label><input className="input-field" value={form.address} onChange={e=>setForm({...form, address:e.target.value})}/></div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button className="btn-primary w-full">Simpan Data Jemaah</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default Jamaah;