import React, { useState, useEffect, useCallback } from 'react';
import CrudTable from '../components/CrudTable';
import { api } from '../utils/api';

const Masters = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState('airlines'); // Default tab

    const fetchMasters = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch berdasarkan tipe yang dipilih
            const response = await api.get(`/masters?type=${type}`);
            setData(Array.isArray(response) ? response : []);
        } catch (error) {
            console.error("Error fetching masters:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => {
        fetchMasters();
    }, [fetchMasters]);

    // Kolom dinamis berdasarkan tipe
    const getColumns = () => {
        if (type === 'airlines') {
            return [
                { key: 'name', label: 'Nama Maskapai' },
                { key: 'code', label: 'Kode IATA', render: (val) => <span className="font-mono bg-gray-100 px-2 py-1 rounded">{val}</span> },
                { key: 'country', label: 'Negara Asal' }
            ];
        } else if (type === 'hotels') {
            return [
                { key: 'name', label: 'Nama Hotel' },
                { key: 'city', label: 'Kota', render: (val) => val === 'Makkah' ? '🕋 Makkah' : (val === 'Madinah' ? '🕌 Madinah' : val) },
                { key: 'rating', label: 'Bintang', render: (val) => <span className="text-yellow-500">{'★'.repeat(val)}</span> }
            ];
        }
        return [{ key: 'name', label: 'Nama' }];
    };

    const getFormFields = () => {
        const common = [{ name: 'name', label: 'Nama', type: 'text', required: true, width: 'full' }];
        
        if (type === 'airlines') {
            return [
                ...common,
                { name: 'code', label: 'Kode Maskapai (IATA)', type: 'text', width: 'half' },
                { name: 'country', label: 'Negara', type: 'text', width: 'half' }
            ];
        } else if (type === 'hotels') {
            return [
                ...common,
                { name: 'city', label: 'Kota', type: 'select', options: [{value: 'Makkah', label: 'Makkah'}, {value: 'Madinah', label: 'Madinah'}, {value: 'Jeddah', label: 'Jeddah'}, {value: 'Transit', label: 'Transit'}], width: 'half' },
                { name: 'rating', label: 'Rating Bintang', type: 'select', options: [{value: '3', label: '3 Bintang'}, {value: '4', label: '4 Bintang'}, {value: '5', label: '5 Bintang'}], width: 'half' },
                { name: 'distance', label: 'Jarak ke Haram (m)', type: 'number', width: 'full' }
            ];
        }
        return common;
    };

    return (
        <div className="p-6">
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['airlines', 'hotels', 'locations'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setType(tab)}
                            className={`${
                                type === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            <CrudTable
                title={`Data Master: ${type.toUpperCase()}`}
                data={data}
                columns={getColumns()}
                loading={loading}
                onRefresh={fetchMasters}
                formFields={getFormFields()}
                searchPlaceholder={`Cari data ${type}...`}
                // Pass extra param ke create endpoint agar backend tahu tipe datanya
                extraPayload={{ type: type }} 
            />
        </div>
    );
};

export default Masters;