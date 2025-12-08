import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';
import { formatDate } from '../utils/formatters';

const Tasks = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/tasks');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/users'); // Asumsi endpoint user tersedia
                setUsers(Array.isArray(res) ? res : []);
            } catch (e) {
                setUsers([]);
            }
        };
        fetchTasks();
        fetchUsers();
    }, [fetchTasks]);

    const columns = [
        { 
            key: 'title', 
            label: 'Judul Tugas',
            render: (val, row) => (
                <div className="flex items-start gap-2">
                    <input type="checkbox" checked={row.status === 'completed'} readOnly className="mt-1" />
                    <div>
                        <div className={`font-medium ${row.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{val}</div>
                        <div className="text-xs text-gray-500">Due: {formatDate(row.due_date)}</div>
                    </div>
                </div>
            )
        },
        { 
            key: 'assigned_to_name', 
            label: 'Assigned To',
            render: (val) => val ? <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full w-fit">👤 {val}</div> : '-'
        },
        { 
            key: 'priority', 
            label: 'Priority',
            render: (val) => {
                const colors = { high: 'text-red-600', medium: 'text-yellow-600', low: 'text-blue-600' };
                return <span className={`text-xs font-bold uppercase ${colors[val]}`}>{val}</span>
            }
        }
    ];

    const formFields = [
        { name: 'title', label: 'Judul Tugas', type: 'text', required: true, width: 'full' },
        { name: 'description', label: 'Deskripsi Detail', type: 'textarea', width: 'full' },
        { name: 'due_date', label: 'Tenggat Waktu (Due Date)', type: 'date', required: true, width: 'half' },
        { 
            name: 'priority', 
            label: 'Prioritas', 
            type: 'select', 
            options: [{value: 'low', label: 'Low'}, {value: 'medium', label: 'Medium'}, {value: 'high', label: 'High'}], 
            defaultValue: 'medium', 
            width: 'half' 
        },
        { 
            name: 'assigned_to', 
            label: 'Tugaskan Kepada', 
            type: 'select', 
            options: (users || []).map(u => ({ value: u.id, label: u.name })), 
            width: 'full' 
        }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Tugas Tim (Tasks)"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchTasks}
                formFields={formFields}
                searchPlaceholder="Cari tugas..."
            />
        </div>
    );
};

export default Tasks;