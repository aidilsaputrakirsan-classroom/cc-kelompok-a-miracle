import { useState, useEffect } from 'react';
import { 
  Droplets, 
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Header } from '../components/Header';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const PublicStock = () => {
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(true);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await apiService.getPublicBloodStock();
        // Convert array to object for easier access
        const stockMap = {};
        response.data.blood_stock.forEach(item => {
          stockMap[item.golongan_darah] = item.jumlah_stok;
        });
        setStockData(stockMap);
      } catch (err) {
        console.error('Error fetching blood stock:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans dark:bg-slate-950 transition-colors duration-500 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#660000]/5 rounded-full blur-[100px] dark:bg-red-400/5" />
      <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px]" />

      <Header />
      
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#660000] mb-8 font-bold transition-all group dark:text-slate-400 dark:hover:text-red-400">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-black text-slate-900 mb-4 dark:text-white tracking-tight">Stok Darah TRACELT</h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
                Tabel ketersediaan pendonor darah sukarela di lingkungan Institut Teknologi Kalimantan.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest block mb-1">Status Sistem</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Data Terkini (Real-time)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-black/5 border border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800 transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                  <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] dark:text-slate-400">Golongan Darah</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right dark:text-slate-400">Jumlah Stok Tersedia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="2" className="px-10 py-24">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : (
                  bloodTypes.map((type) => (
                    <tr key={type} className="hover:bg-slate-50 transition-all dark:hover:bg-slate-800/30 group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-[#660000]/10 rounded-2xl flex items-center justify-center text-2xl text-[#660000] font-black dark:bg-red-400/10 dark:text-red-400 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            {type}
                          </div>
                          <div>
                            <span className="block font-black text-xl text-slate-900 dark:text-white mb-1 tracking-tight">Golongan {type}</span>
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest dark:text-slate-500">{type.includes('-') ? 'Rhesus Negatif' : 'Rhesus Positif'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform duration-500">
                          <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{stockData[type] || 0}</span>
                          <Droplets className={`w-8 h-8 transition-all duration-500 ${stockData[type] > 0 ? 'text-[#660000] dark:text-red-500 drop-shadow-lg' : 'text-slate-300 dark:text-slate-700'}`} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-8 text-center text-slate-400 text-sm dark:text-slate-500">
          Update Terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </main>
    </div>
  );
};