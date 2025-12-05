import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Spinner from '../components/Spinner';
import { FileText, PieChart, DollarSign } from 'lucide-react';

const Accounting = () => {
    const [activeTab, setActiveTab] = useState('balance-sheet');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            try {
                const endpoint = activeTab === 'balance-sheet' 
                    ? 'umh/v1/accounting/reports/balance-sheet' 
                    : 'umh/v1/accounting/reports/profit-loss';
                const res = await api.get(endpoint);
                if (res.data.success) setReportData(res.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchReport();
    }, [activeTab]);

    const formatMoney = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

    const ReportSection = ({ title, items, total, colorClass }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
            <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${colorClass}`}>{title}</h3>
            <div className="space-y-3">
                {items?.length === 0 && <p className="text-gray-400 italic">Belum ada data.</p>}
                {items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">[{item.code}] {item.name}</span>
                        <span className="font-mono">{formatMoney(item.balance)}</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t flex justify-between font-bold text-gray-900 bg-gray-50 p-2 rounded">
                <span>Total {title}</span>
                <span>{formatMoney(total)}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Laporan Keuangan (Enterprise)</h1>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('balance-sheet')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab==='balance-sheet' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Neraca</button>
                    <button onClick={() => setActiveTab('profit-loss')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab==='profit-loss' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Laba Rugi</button>
                </div>
            </div>

            {loading ? <Spinner /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeTab === 'balance-sheet' && reportData && (
                        <>
                            <ReportSection title="Aset (Harta)" items={reportData.data.assets} total={reportData.totals.assets} colorClass="text-blue-600 border-blue-200" />
                            <div>
                                <ReportSection title="Kewajiban (Utang)" items={reportData.data.liabilities} total={reportData.totals.liabilities} colorClass="text-red-600 border-red-200" />
                                <ReportSection title="Ekuitas (Modal)" items={reportData.data.equity} total={reportData.totals.equity} colorClass="text-green-600 border-green-200" />
                                <div className="bg-gray-800 text-white p-4 rounded-xl mt-4 flex justify-between font-bold">
                                    <span>Total Pasiva</span>
                                    <span>{formatMoney(reportData.totals.liabilities + reportData.totals.equity)}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'profit-loss' && reportData && (
                        <>
                            <ReportSection title="Pendapatan (Revenue)" items={reportData.data.revenue} total={reportData.totals.revenue} colorClass="text-green-600 border-green-200" />
                            <div>
                                <ReportSection title="Beban (Expenses)" items={reportData.data.expense} total={reportData.totals.expense} colorClass="text-red-600 border-red-200" />
                                <div className={`p-6 rounded-xl text-center mt-4 border-2 ${reportData.net_income >= 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                    <div className="text-sm uppercase tracking-wide font-bold mb-1">Laba / Rugi Bersih</div>
                                    <div className="text-3xl font-bold font-mono">{formatMoney(reportData.net_income)}</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default Accounting;