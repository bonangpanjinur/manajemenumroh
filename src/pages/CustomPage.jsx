import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

export default function CustomPage() {
    const { slug } = useParams(); // Ambil slug dari URL (misal: /page/tentang-kami)
    const [pageData, setPageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            setError(null);
            try {
                // Panggil API yang baru kita buat
                const res = await api.get(`/content/page?slug=${slug}`);
                setPageData(res);
            } catch (err) {
                console.error(err);
                setError('Halaman tidak ditemukan atau telah dihapus.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <PublicLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <Spinner />
                </div>
            </PublicLayout>
        );
    }

    if (error || !pageData) {
        return (
            <PublicLayout>
                <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                        &larr; Kembali ke Beranda
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            {/* Header / Featured Image */}
            <div className="bg-gray-900 text-white relative">
                {pageData.featured_image && (
                    <div className="absolute inset-0">
                        <img 
                            src={pageData.featured_image} 
                            alt={pageData.title} 
                            className="w-full h-full object-cover opacity-30"
                        />
                    </div>
                )}
                <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                        {pageData.title}
                    </h1>
                    <div className="mt-4 flex justify-center items-center text-sm text-gray-300">
                        <Link to="/" className="hover:text-white">Beranda</Link>
                        <ChevronRightIcon className="h-4 w-4 mx-2" />
                        <span>{pageData.title}</span>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <article className="prose prose-lg prose-indigo mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                    {/* Render HTML dari WordPress */}
                    <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
                </article>
            </div>
        </PublicLayout>
    );
}