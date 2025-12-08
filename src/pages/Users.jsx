import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';

const Users = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState([]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching users:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchRolesData = async () => {
            try {
                const res = await api.get('/roles');
                setRoles(Array.isArray(res) ? res : []);
            } catch (e) {
                setRoles([]);
            }
        };
        fetchUsers();
        fetchRolesData();
    }, [fetchUsers]);

    const columns = [
        { 
            key: 'user_login', 
            label: 'Username',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {val ? val.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{val}</div>
                        <div className="text-xs text-gray-500">{row.user_email}</div>
                    </div>
                </div>
            )
        },
        { key: 'display_name', label: 'Nama Lengkap' },
        { 
            key: 'roles', 
            label: 'Role', 
            render: (val) => (Array.isArray(val) ? val.join(', ') : val) 
        },
        { 
            key: 'registered', 
            label: 'Terdaftar',
            render: (val) => val ? new Date(val).toLocaleDateString() : '-'
        }
    ];

    const formFields = [
        { section: 'Akun Login' },
        { name: 'user_login', label: 'Username', type: 'text', required: true, width: 'half' },
        { name: 'user_email', label: 'Email', type: 'email', required: true, width: 'half' },
        { name: 'first_name', label: 'Nama Depan', type: 'text', width: 'half' },
        { name: 'last_name', label: 'Nama Belakang', type: 'text', width: 'half' },
        
        { section: 'Keamanan' },
        { name: 'password', label: 'Password', type: 'password', width: 'full', help: 'Kosongkan jika tidak ingin mengubah password user.' },
        { 
            name: 'role', 
            label: 'Role Akses', 
            type: 'select', 
            options: (roles || []).map(r => ({ value: r.name, label: r.display_name })),
            required: true,
            width: 'full' 
        }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Manajemen Pengguna (Users)"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchUsers}
                formFields={formFields}
                searchPlaceholder="Cari username atau email..."
            />
        </div>
    );
};

export default Users;