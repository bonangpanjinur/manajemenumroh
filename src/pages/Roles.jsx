import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';

const Roles = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/roles');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching roles:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const columns = [
        { key: 'display_name', label: 'Nama Role', render: (val) => <span className="font-bold">{val}</span> },
        { key: 'name', label: 'Role ID', render: (val) => <code className="bg-gray-100 px-1 rounded text-xs text-gray-600">{val}</code> },
        { key: 'users_count', label: 'Jumlah User', render: (val) => <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">{val || 0}</span> }
    ];

    const formFields = [
        { name: 'display_name', label: 'Nama Role (Tampilan)', type: 'text', required: true, width: 'half' },
        { name: 'name', label: 'Role ID (Slug, unik)', type: 'text', required: true, width: 'half', placeholder: 'cth: finance_staff' },
        { 
            name: 'capabilities', 
            label: 'Hak Akses (Capabilities)', 
            type: 'textarea', 
            width: 'full', 
            help: 'Pisahkan dengan koma. Contoh: read_dashboard, manage_bookings, export_data' 
        }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Manajemen Hak Akses (Roles)"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchRoles}
                formFields={formFields}
                searchPlaceholder="Cari role..."
            />
        </div>
    );
};

export default Roles;