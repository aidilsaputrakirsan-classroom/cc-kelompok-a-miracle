import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserDashboardHeader } from '../components/UserDashboardHeader';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const GOLONGAN_DARAH = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export const UserInputDonor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendonor, setPendonor] = useState(null);
  const [form, setForm] = useState({ golongan_darah: 'O+', tanggal_terakhir_donor: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getRiwayatDonorPengguna({ limit: 1 });
        const riwayats = res.data.riwayat_donor || [];
        if (riwayats.length > 0) {
          const donorRes = await apiService.getPendonorById(riwayats[0].id_pendonor);
          setPendonor(donorRes.data);
          setForm({ golongan_darah: donorRes.data.golongan_darah, tanggal_terakhir_donor: '' });
        }
      } catch (err) {
        console.error('Gagal memuat data donor:', err);
        if (err.response?.status === 401) navigate('/login?type=user');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const validate = () => {
    const e = {};
    if (!form.tanggal_terakhir_donor) e.tanggal_terakhir_donor = 'Tanggal donor wajib diisi';
    else if (new Date(form.tanggal_terakhir_donor) > new Date()) e.tanggal_terakhir_donor = 'Tanggal tidak boleh di masa depan';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');
    if (!validate()) return;

    setSaving(true);
    try {
      await apiService.updatePendonor(pendonor.id_pendonor, {
        golongan_darah: form.golongan_darah,
        tanggal_terakhir_donor: form.tanggal_terakhir_donor,
        total_donor: (pendonor.total_donor || 0) + 1,
      });

      await apiService.createRiwayatDonorPengguna({
        id_pendonor: pendonor.id_pendonor,
        golongan_darah: form.golongan_darah,
      });

      setSuccessMsg('Data donor berhasil dicatat!');
      setTimeout(() => navigate('/user/dashboard'), 1500);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setServerError(typeof detail === 'string' ? detail : 'Gagal menyimpan data. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <UserDashboardHeader />

      <main className="max-w-lg mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Input Data Donor</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
            Catat riwayat donor baru. Data diri sudah tersimpan dari profil Anda.
          </p>

          {!pendonor ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:bg-slate-900 dark:border-slate-700">
              <p className="text-slate-700 dark:text-slate-300 font-semibold mb-2">Data diri belum diisi</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Isi data diri terlebih dahulu sebelum mencatat riwayat donor.
              </p>
              <Link
                to="/user/data-diri"
                className="inline-flex items-center gap-2 rounded-xl bg-[#660000] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4d0000] transition"
              >
                Isi Data Diri Sekarang
              </Link>
            </div>
          ) : (
            <>
              {/* Ringkasan profil donor */}
              <div className="mb-6 rounded-2xl bg-white border border-slate-200 p-5 dark:bg-slate-900 dark:border-slate-800">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Profil Donor</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{pendonor.nama_lengkap}</p>
                    <p className="text-sm text-slate-500">{pendonor.email}</p>
                  </div>
                  <Link to="/user/data-diri" className="text-xs text-[#660000] dark:text-red-400 font-semibold hover:underline">
                    Edit
                  </Link>
                </div>
                <div className="mt-3 flex gap-3 flex-wrap">
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {pendonor.golongan_darah}
                  </span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {pendonor.jenis_kelamin}
                  </span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Total donor: {pendonor.total_donor}x
                  </span>
                </div>
              </div>

              {successMsg && (
                <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 text-sm font-semibold dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                  {successMsg}
                </div>
              )}
              {serverError && (
                <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm font-semibold dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tanggal Donor
                  </label>
                  <input
                    type="date"
                    value={form.tanggal_terakhir_donor}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, tanggal_terakhir_donor: e.target.value }));
                      setErrors((er) => { const n = { ...er }; delete n.tanggal_terakhir_donor; return n; });
                    }}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition focus:outline-none focus:ring-2 ${
                      errors.tanggal_terakhir_donor
                        ? 'border-red-400 focus:ring-red-300'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-[#660000]/30 focus:border-[#660000]'
                    }`}
                  />
                  {errors.tanggal_terakhir_donor && (
                    <p className="mt-1 text-xs text-red-500">{errors.tanggal_terakhir_donor}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Golongan Darah
                  </label>
                  <select
                    value={form.golongan_darah}
                    onChange={(e) => setForm((f) => ({ ...f, golongan_darah: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#660000]/30 focus:border-[#660000] transition"
                  >
                    {GOLONGAN_DARAH.map((g) => <option key={g}>{g}</option>)}
                  </select>
                  <p className="mt-1 text-xs text-slate-400">Dikonfirmasi saat verifikasi admin</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => navigate('/user/dashboard')} className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    Batal
                  </button>
                  <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-[#660000] py-3 text-sm font-semibold text-white hover:bg-[#4d0000] transition disabled:opacity-60">
                    {saving ? 'Menyimpan...' : 'Catat Donor'}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
};
