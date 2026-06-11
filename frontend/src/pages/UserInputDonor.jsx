import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplets, CalendarDays, CheckCircle2, ArrowRight, UserCog } from 'lucide-react';
import { UserDashboardHeader } from '../components/UserDashboardHeader';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const GOLONGAN_DARAH = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const GOLONGAN_COLOR = {
  'O+': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  'O-': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  'A+': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'A-': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  'B+': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'B-': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  'AB+': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  'AB-': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
};

export const UserInputDonor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendonor, setPendonor] = useState(null);
  const [form, setForm] = useState({ golongan_darah: 'O+', tanggal_terakhir_donor: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);

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
        if (err.response?.status === 401) navigate('/login?type=user');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const validate = () => {
    const e = {};
    if (!form.tanggal_terakhir_donor) e.tanggal = 'Tanggal donor wajib diisi';
    else if (new Date(form.tanggal_terakhir_donor) > new Date()) e.tanggal = 'Tanggal tidak boleh di masa depan';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
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
      setDone(true);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setServerError(typeof detail === 'string' ? detail : 'Gagal menyimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <UserDashboardHeader />

      <main className="max-w-lg mx-auto px-4 py-10">

        {/* Sukses state */}
        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Donor Tercatat!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Data donor Anda berhasil disimpan dan menunggu verifikasi admin.
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setDone(false); setForm({ golongan_darah: pendonor?.golongan_darah || 'O+', tanggal_terakhir_donor: '' }); }}
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition">
                Input Lagi
              </button>
              <button onClick={() => navigate('/user/dashboard')}
                className="flex-1 rounded-2xl bg-[#660000] py-3 text-sm font-semibold text-white hover:bg-[#4d0000] transition flex items-center justify-center gap-2">
                Ke Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Input Data Donor</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
                Catat riwayat donor baru. Data diri sudah tersimpan dari profil Anda.
              </p>
            </div>

            {/* Belum ada profil donor */}
            {!pendonor ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <UserCog className="w-7 h-7 text-slate-400" />
                </div>
                <p className="font-bold text-slate-800 dark:text-white mb-1">Data diri belum diisi</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Isi profil donor Anda terlebih dahulu sebelum mencatat riwayat donor.
                </p>
                <Link to="/user/data-diri"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#660000] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4d0000] transition">
                  Isi Data Diri <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                {/* Profil donor card */}
                <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#660000] to-[#8b0000] dark:from-red-950 dark:to-red-900 text-white p-5 shadow-lg shadow-[#660000]/20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Profil Donor</p>
                      <p className="font-bold text-lg leading-tight">{pendonor.nama_lengkap}</p>
                      <p className="text-white/70 text-sm">{pendonor.email}</p>
                    </div>
                    <Link to="/user/data-diri"
                      className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg font-semibold transition">
                      Edit
                    </Link>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Chip>{pendonor.golongan_darah}</Chip>
                    <Chip>{pendonor.jenis_kelamin}</Chip>
                    <Chip>{pendonor.berat_badan} kg</Chip>
                    <Chip>{pendonor.total_donor}× donor</Chip>
                  </div>
                </div>

                {serverError && (
                  <div className="mb-5 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-5 py-4 text-sm font-semibold">
                    {serverError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">

                  {/* Tanggal donor */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                      <CalendarDays className="w-4 h-4 text-[#660000] dark:text-red-400" />
                      Tanggal Donor
                    </label>
                    <input
                      type="date"
                      value={form.tanggal_terakhir_donor}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, tanggal_terakhir_donor: e.target.value }));
                        setErrors({});
                      }}
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition focus:outline-none focus:ring-2 ${
                        errors.tanggal
                          ? 'border-red-400 focus:ring-red-300'
                          : 'border-slate-200 dark:border-slate-700 focus:ring-[#660000]/30 focus:border-[#660000]'
                      }`}
                    />
                    {errors.tanggal && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.tanggal}</p>}
                  </div>

                  {/* Golongan darah */}
                  <div className="p-5">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                      <Droplets className="w-4 h-4 text-[#660000] dark:text-red-400" />
                      Golongan Darah
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {GOLONGAN_DARAH.map((g) => (
                        <button key={g} type="button" onClick={() => setForm((f) => ({ ...f, golongan_darah: g }))}
                          className={`rounded-xl border py-2.5 text-sm font-bold transition ${
                            form.golongan_darah === g
                              ? `${GOLONGAN_COLOR[g]} ring-2 ring-offset-1 ring-current`
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}>
                          {g}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-slate-400">Dikonfirmasi saat verifikasi admin</p>
                  </div>

                  {/* Submit */}
                  <div className="px-5 pb-5 flex gap-3">
                    <button type="button" onClick={() => navigate('/user/dashboard')}
                      className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition">
                      Batal
                    </button>
                    <button type="submit" disabled={saving}
                      className="flex-1 rounded-2xl bg-[#660000] py-3 text-sm font-semibold text-white hover:bg-[#4d0000] transition disabled:opacity-60 flex items-center justify-center gap-2">
                      {saving ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
                      ) : 'Catat Donor'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

const Chip = ({ children }) => (
  <span className="rounded-full bg-white/15 border border-white/20 px-3 py-1 text-xs font-semibold text-white">
    {children}
  </span>
);
