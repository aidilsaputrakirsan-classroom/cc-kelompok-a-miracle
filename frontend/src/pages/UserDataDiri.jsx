import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserDashboardHeader } from '../components/UserDashboardHeader';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const GOLONGAN_DARAH = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const emptyForm = {
  nama_lengkap: '',
  email: '',
  jenis_kelamin: 'Laki-laki',
  berat_badan: '',
  tinggi_badan: '',
  golongan_darah: 'O+',
  umur: '',
  tanggal_lahir: '',
  alamat: '',
  no_telepon: '',
  riwayat_kesehatan: '',
};

export const UserDataDiri = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendonorId, setPendonorId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [meRes, riwayatRes] = await Promise.all([
          apiService.getPenggunaMe(),
          apiService.getRiwayatDonorPengguna({ limit: 1 }),
        ]);

        const pengguna = meRes.data;
        const riwayats = riwayatRes.data.riwayat_donor || [];

        if (riwayats.length > 0) {
          const donorRes = await apiService.getPendonorById(riwayats[0].id_pendonor);
          const p = donorRes.data;
          setPendonorId(p.id_pendonor);
          setForm({
            nama_lengkap: p.nama_lengkap,
            email: p.email,
            jenis_kelamin: p.jenis_kelamin,
            berat_badan: String(p.berat_badan),
            tinggi_badan: String(p.tinggi_badan),
            golongan_darah: p.golongan_darah,
            umur: String(p.umur),
            tanggal_lahir: p.tanggal_lahir,
            alamat: p.alamat,
            no_telepon: p.no_telepon,
            riwayat_kesehatan: p.riwayat_kesehatan || '',
          });
        } else {
          setForm((f) => ({ ...f, nama_lengkap: pengguna.nama_pengguna, email: pengguna.email }));
        }
      } catch (err) {
        console.error('Gagal memuat profil:', err);
        if (err.response?.status === 401) navigate('/login?type=user');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const validate = () => {
    const e = {};
    if (!form.nama_lengkap.trim()) e.nama_lengkap = 'Nama wajib diisi';
    if (!form.email.trim()) e.email = 'Email wajib diisi';
    if (!form.tanggal_lahir) e.tanggal_lahir = 'Tanggal lahir wajib diisi';
    if (!form.jenis_kelamin) e.jenis_kelamin = 'Jenis kelamin wajib dipilih';
    if (!form.berat_badan || Number(form.berat_badan) <= 0) e.berat_badan = 'Berat badan tidak valid';
    if (!form.tinggi_badan || Number(form.tinggi_badan) <= 0) e.tinggi_badan = 'Tinggi badan tidak valid';
    if (!form.umur || Number(form.umur) < 17) e.umur = 'Umur minimal 17 tahun';
    if (!form.alamat.trim()) e.alamat = 'Alamat wajib diisi';
    if (!form.no_telepon.trim()) e.no_telepon = 'Nomor telepon wajib diisi';
    if (!form.riwayat_kesehatan.trim()) e.riwayat_kesehatan = 'Isi "Tidak ada" jika tidak ada riwayat';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        berat_badan: Number(form.berat_badan),
        tinggi_badan: Number(form.tinggi_badan),
        umur: Number(form.umur),
      };

      if (pendonorId) {
        await apiService.updatePendonor(pendonorId, payload);
      } else {
        await apiService.registerPendonor({ ...payload, total_donor: 0, tanggal_terakhir_donor: null });
      }

      setSuccessMsg('Data diri berhasil disimpan!');
      setTimeout(() => navigate('/user/dashboard'), 1500);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') setServerError(detail);
      else if (Array.isArray(detail)) {
        const mapped = {};
        detail.forEach((item) => { const f = item?.loc?.[item.loc.length - 1]; if (f) mapped[f] = item.msg; });
        setErrors((prev) => ({ ...prev, ...mapped }));
        setServerError('Periksa kembali isian formulir.');
      } else {
        setServerError('Gagal menyimpan data. Coba lagi.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <UserDashboardHeader />

      <main className="max-w-2xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
            {pendonorId ? 'Edit Data Diri' : 'Isi Data Diri'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
            Data ini disimpan sebagai profil donor Anda dan tidak perlu diisi ulang setiap input donor.
          </p>

          {successMsg && (
            <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 text-sm font-semibold dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
              {successMsg}
            </div>
          )}
          {serverError && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm font-semibold dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Nama Lengkap" error={errors.nama_lengkap}>
              <input type="text" value={form.nama_lengkap} onChange={(e) => handleChange('nama_lengkap', e.target.value)} className={inputCls(errors.nama_lengkap)} placeholder="Budi Santoso" />
            </Field>

            <Field label="Email" error={errors.email}>
              <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className={inputCls(errors.email)} placeholder="budi@example.com" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Jenis Kelamin" error={errors.jenis_kelamin}>
                <select value={form.jenis_kelamin} onChange={(e) => handleChange('jenis_kelamin', e.target.value)} className={inputCls(errors.jenis_kelamin)}>
                  <option>Laki-laki</option>
                  <option>Perempuan</option>
                </select>
              </Field>
              <Field label="Golongan Darah" error={errors.golongan_darah}>
                <select value={form.golongan_darah} onChange={(e) => handleChange('golongan_darah', e.target.value)} className={inputCls(errors.golongan_darah)}>
                  {GOLONGAN_DARAH.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Tanggal Lahir" error={errors.tanggal_lahir}>
                <input type="date" value={form.tanggal_lahir} onChange={(e) => handleChange('tanggal_lahir', e.target.value)} className={inputCls(errors.tanggal_lahir)} />
              </Field>
              <Field label="Umur" error={errors.umur}>
                <input type="number" value={form.umur} onChange={(e) => handleChange('umur', e.target.value)} className={inputCls(errors.umur)} placeholder="20" min="17" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Berat Badan (kg)" error={errors.berat_badan}>
                <input type="number" value={form.berat_badan} onChange={(e) => handleChange('berat_badan', e.target.value)} className={inputCls(errors.berat_badan)} placeholder="60" />
              </Field>
              <Field label="Tinggi Badan (cm)" error={errors.tinggi_badan}>
                <input type="number" value={form.tinggi_badan} onChange={(e) => handleChange('tinggi_badan', e.target.value)} className={inputCls(errors.tinggi_badan)} placeholder="165" />
              </Field>
            </div>

            <Field label="Nomor Telepon" error={errors.no_telepon}>
              <input type="tel" value={form.no_telepon} onChange={(e) => handleChange('no_telepon', e.target.value)} className={inputCls(errors.no_telepon)} placeholder="08123456789" />
            </Field>

            <Field label="Alamat" error={errors.alamat}>
              <textarea value={form.alamat} onChange={(e) => handleChange('alamat', e.target.value)} rows={2} className={inputCls(errors.alamat)} placeholder="Jl. Merdeka No. 1, Balikpapan" />
            </Field>

            <Field label="Riwayat Kesehatan" error={errors.riwayat_kesehatan}>
              <textarea value={form.riwayat_kesehatan} onChange={(e) => handleChange('riwayat_kesehatan', e.target.value)} rows={2} className={inputCls(errors.riwayat_kesehatan)} placeholder='Contoh: Tidak ada / Diabetes / Hipertensi' />
            </Field>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/user/dashboard')} className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                Batal
              </button>
              <button type="submit" disabled={saving} className="flex-1 rounded-2xl bg-[#660000] py-3 text-sm font-semibold text-white hover:bg-[#4d0000] transition disabled:opacity-60">
                {saving ? 'Menyimpan...' : pendonorId ? 'Simpan Perubahan' : 'Simpan Data Diri'}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

const inputCls = (err) =>
  `w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 transition focus:outline-none focus:ring-2 ${
    err
      ? 'border-red-400 focus:ring-red-300'
      : 'border-slate-200 dark:border-slate-700 focus:ring-[#660000]/30 focus:border-[#660000]'
  }`;

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);
