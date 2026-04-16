import { useState, useEffect } from 'react';
import { 
  Droplets, 
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Header } from '../components/Header';

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
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-4xl font-black text-slate-900 mb-4">Stok Darah TRACELT</h1>
          <p className="text-slate-500">
            Tabel ketersediaan pendonor darah sukarela di lingkungan Institut Teknologi Kalimantan.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-bottom border-slate-100">
                <th className="px-8 py-6 text-sm font-bold text-slate-500 uppercase tracking-wider">Golongan Darah</th>
                <th className="px-8 py-6 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Jumlah Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="2" className="px-8 py-12 text-center text-slate-400">Memuat data...</td>
                </tr>
              ) : (
                bloodTypes.map((type) => (
                  <tr key={type} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#660000]/10 rounded-full flex items-center justify-center text-[#660000] font-black">
                          {type}
                        </div>
                        <span className="font-bold text-slate-900">Golongan Darah {type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-2xl font-black text-slate-900">{stockData[type] || 0}</span>
                        <Droplets className="w-5 h-5 text-[#660000]" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-8 text-center text-slate-400 text-sm">
          Update Terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </main>
    </div>
  );
};