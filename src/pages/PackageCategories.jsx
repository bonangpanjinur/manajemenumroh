import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';

const PackageCategories = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/package-categories');
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const columns = [
        { key: 'name', label: 'Nama Kategori', render: (val) => <span className="font-bold">{val}</span> },
        { key: 'slug', label: 'Slug URL', render: (val) => <code className="bg-gray-100 px-1 rounded text-xs">{val}</code> },
        { key: 'description', label: 'Deskripsi', render: (val) => <span className="text-gray-500 text-sm truncate max-w-xs block">{val || '-'}</span> }
    ];

    const formFields = [
        { name: 'name', label: 'Nama Kategori', type: 'text', required: true, width: 'full' },
        { name: 'slug', label: 'Slug (Opsional)', type: 'text', placeholder: 'Otomatis dari nama', width: 'full' },
        { name: 'description', label: 'Deskripsi', type: 'textarea', width: 'full' }
    ];

    return (
        <div className="p-6">
            <CrudTable
                title="Kategori Paket"
                data={data}
                columns={columns}
                loading={loading}
                onRefresh={fetchCategories}
                formFields={formFields}
                searchPlaceholder="Cari kategori..."
            />
        </div>
    );
};

export default PackageCategories;