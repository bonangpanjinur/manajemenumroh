import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api'; // PERBAIKAN: Menggunakan named import { api }

const HR = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/hr/employees');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching HR data:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const columns = [
        { 
            key: 'name', 
            label: 'Nama Karyawan',
            render: (val, row) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                        {val ? val.charAt(0) : '?'}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{val}</div>
                        <div className="text-xs text-gray-500">{row.position || 'Staff'}</div>
                    </div>
                </div>
            )
        },
        { key: 'department', label: 'Divisi' },
        { key: 'phone', label: 'Kontak' },
        { 
            key: 'status', 
            label: 'Status',
            render: (val) => {
                const colors = { active: 'bg-green-100 text-green-700', leave: 'bg-yellow-100 text-yellow-700', terminated: 'bg-red-100 text-red-700' };
                return <span className={`px-2 py-1 rounded text-xs ${colors[val] || 'bg-gray-100'}`}>{val}</span>
            }
        }
    ];

    const formFields = [
        { section: 'Data Karyawan' },
        { name: 'name', label: 'Nama Lengkap', type: 'text', required: true, width: 'half' },
        { name: 'position', label: 'Jabatan / Posisi', type: 'text', required: true, width: 'half' },
        { 
            name: 'department', 
            label: 'Divisi', 
            type: 'select', 
            options: [
                {value: 'Operasional', label: 'Operasional'}, 
                {value: 'Keuangan', label: 'Keuangan'}, 
                {value: 'Marketing', label: 'Marketing'},
                {value: 'IT', label: 'IT & Support'}
            ], 
            width: 'half' 
        },
        { name: 'join_date', label: 'Tanggal Bergabung', type: 'date', width: 'half' },
        
        { section: 'Kontak' },
        { name: 'email', label: 'Email Kantor', type: 'email', width: 'half' },
        { name: 'phone', label: 'No. HP / WA', type: 'text', width: 'half' },
        
        { section: 'Status Kepegawaian' },
        { 
            name: 'status', 
            label: 'Status', 
            type: 'select', 
            options: [{value: 'active', label: 'Aktif'}, {value: 'leave', label: 'Cuti'}, {value: 'terminated', label: 'Keluar'}], 
            defaultValue: 'active', 
            width: 'full' 
        }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Data Karyawan (HR)"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchEmployees}
                formFields={formFields}
                searchPlaceholder="Cari karyawan..."
            />
        </div>
    );
};

export default HR;