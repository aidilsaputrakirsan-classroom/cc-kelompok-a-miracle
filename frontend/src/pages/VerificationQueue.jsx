import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText,
  User,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

export const VerificationQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await apiService.getPendingVerifications();
        setQueue(res.data.riwayat_donor);
      } catch (err) {
        console.error('Gagal mengambil antrean verifikasi:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await apiService.verifyRiwayatDonor(id, { 
        status_verifikasi: status, 
        catatan: "Diverifikasi oleh admin" 
      });
      setQueue(prev => prev.filter(item => item.id_riwayat !== id));
    } catch (err) {
      console.error('Gagal memverifikasi:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          to="/admin" 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
          title="Kembali ke Dashboard"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Antrean Verifikasi</h1>
          <p className="text-slate-500 text-sm">Validasi laporan donor darah dari pendonor untuk memberikan point.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {queue.map((item) => (
          <div key={item.id_riwayat} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">Laporan Donor #{item.id_riwayat}</span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase rounded-md border border-amber-100">
                    Pending
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>ID Pendonor: {item.id_pendonor}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tanggal Donor: {item.tanggal_donor}</span>
                  </div>
                </div>
                {item.catatan && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 flex items-start gap-2 italic">
                    <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                    "{item.catatan}"
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0">
              <button 
                onClick={() => handleVerify(item.id_riwayat, 'rejected')}
                className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Tolak</span>
              </button>
              <button 
                onClick={() => handleVerify(item.id_riwayat, 'approved')}
                className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-100"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Setujui</span>
              </button>
            </div>
          </div>
        ))}

        {queue.length === 0 && !loading && (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-slate-900 font-medium">Semua Bersih!</h3>
            <p className="text-slate-500 text-sm mt-1">Tidak ada laporan donor yang menunggu verifikasi saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
};