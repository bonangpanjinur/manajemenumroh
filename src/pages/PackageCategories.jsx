import React from 'react';
import CrudTable from '../components/CrudTable';

const PackageCategories = () => {
  const columns = [
    { key: 'name', label: 'Nama Kategori' },
    { key: 'slug', label: 'Slug (URL)' },
    { 
      key: 'type', 
      label: 'Jenis', 
      render: (val) => <span className="uppercase text-xs font-bold text-gray-500">{val}</span> 
    },
    { key: 'description', label: 'Deskripsi', render: (val) => val ? val.substring(0, 50) + '...' : '-' }
  ];

  const formFields = [
    { name: 'name', label: 'Nama Kategori', type: 'text', required: true, width: 'full' },
    { name: 'slug', label: 'Slug (Opsional)', type: 'text', width: 'half' },
    { 
      name: 'type', 
      label: 'Jenis Layanan', 
      type: 'select', 
      options: [
        {value: 'umrah', label: 'Umrah'}, 
        {value: 'haji', label: 'Haji'}, 
        {value: 'tour', label: 'Wisata Halal'}
      ], 
      defaultValue: 'umrah',
      width: 'half' 
    },
    { name: 'description', label: 'Deskripsi', type: 'textarea', width: 'full' }
  ];

  return (
    <CrudTable
      title="Kategori Paket"
      endpoint="/package-categories"
      columns={columns}
      formFields={formFields}
      searchPlaceholder="Cari kategori..."
    />
  );
};

export default PackageCategories;