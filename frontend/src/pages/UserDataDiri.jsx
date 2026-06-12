import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Scale, Ruler, Droplets, Calendar, CheckCircle2 } from 'lucide-react';
import { UserDashboardHeader } from '../components/UserDashboardHeader';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const GOLONGAN_DARAH = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const calcAge = (dateStr) => {
  if (!dateStr) return '';
  const birth = new Date(dateStr);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? String(age) : '';
};

const emptyForm = {
  nama_lengkap: '', email: '', jenis_kelamin: 'Laki-laki',
  berat_badan: '', tinggi_badan: '', golongan_darah: 'O+',
  umur: '', tanggal_lahir: '', alamat: '', no_telepon: '', riwayat_kesehatan: '',
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
        if (err.response?.status === 401) navigate('/login?type=user');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const set = (field, value) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === 'tanggal_lahir') next.umur = calcAge(value);
      return next;
    });
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.nama_lengkap.trim()) e.nama_lengkap = 'Wajib diisi';
    if (!form.email.trim()) e.email = 'Wajib diisi';
    if (!form.tanggal_lahir) e.tanggal_lahir = 'Wajib diisi';
    if (!form.umur || Number(form.umur) < 17) e.tanggal_lahir = 'Umur minimal 17 tahun';
    if (!form.berat_badan || Number(form.berat_badan) <= 0) e.berat_badan = 'Tidak valid';
    if (!form.tinggi_badan || Number(form.tinggi_badan) <= 0) e.tinggi_badan = 'Tidak valid';
    if (!form.alamat.trim()) e.alamat = 'Wajib diisi';
    if (!form.no_telepon.trim()) e.no_telepon = 'Wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(''); setSuccessMsg('');
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, berat_badan: Number(form.berat_badan), tinggi_badan: Number(form.tinggi_badan), umur: Number(form.umur) };
      if (pendonorId) {
        const { golongan_darah: _locked, ...updatePayload } = payload;
        await apiService.updatePendonor(pendonorId, updatePayload);
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
        setServerError('Gagal menyimpan. Coba lagi.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      <UserDashboardHeader />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {pendonorId ? 'Edit Data Diri' : 'Isi Data Diri'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Disimpan sebagai profil donor — tidak perlu diisi ulang setiap input donor.
            </p>
          </div>

          {successMsg && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 text-sm font-semibold dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5 shrink-0" />{successMsg}
            </motion.div>
          )}
          {serverError && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-sm font-semibold dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Seksi 1 — Identitas */}
            <Section title="Identitas" icon={<User className="w-4 h-4" />}>
              <div className="grid gap-4">
                <Field label="Nama Lengkap" error={errors.nama_lengkap} icon={<User className="w-4 h-4 text-slate-400" />}>
                  <input type="text" value={form.nama_lengkap} onChange={(e) => set('nama_lengkap', e.target.value)}
                    className={inp(errors.nama_lengkap)} placeholder="Budi Santoso" />
                </Field>
                <Field label="Email" error={errors.email} icon={<Mail className="w-4 h-4 text-slate-400" />}>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                    className={inp(errors.email)} placeholder="budi@example.com" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Jenis Kelamin" error={errors.jenis_kelamin}>
                    <div className="flex gap-2">
                      {['Laki-laki', 'Perempuan'].map((g) => (
                        <button key={g} type="button" onClick={() => set('jenis_kelamin', g)}
                          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold border transition ${
                            form.jenis_kelamin === g
                              ? 'bg-[#660000] text-white border-[#660000]'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#660000]'
                          }`}>
                          {g === 'Laki-laki' ? '♂ Laki-laki' : '♀ Perempuan'}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Golongan Darah" error={errors.golongan_darah} icon={<Droplets className="w-4 h-4 text-slate-400" />}>
                    {pendonorId ? (
                      <>
                        <div className={`${inp()} bg-slate-50 dark:bg-slate-900/60 cursor-not-allowed flex items-center justify-between`}>
                          <span className="font-bold text-slate-900 dark:text-white">{form.golongan_darah}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Terkunci</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Tidak dapat diubah setelah didaftarkan</p>
                      </>
                    ) : (
                      <select value={form.golongan_darah} onChange={(e) => set('golongan_darah', e.target.value)}
                        className={inp(errors.golongan_darah)}>
                        {GOLONGAN_DARAH.map((g) => <option key={g}>{g}</option>)}
                      </select>
                    )}
                  </Field>
                </div>
              </div>
            </Section>

            {/* Seksi 2 — Tanggal lahir & umur */}
            <Section title="Kelahiran" icon={<Calendar className="w-4 h-4" />}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tanggal Lahir" error={errors.tanggal_lahir} icon={<Calendar className="w-4 h-4 text-slate-400" />}>
                  <input type="date" value={form.tanggal_lahir}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => set('tanggal_lahir', e.target.value)}
                    className={inp(errors.tanggal_lahir)} />
                </Field>
                <Field label="Umur (otomatis)" hint="Dihitung dari tanggal lahir">
                  <div className={`${inp()} flex items-center gap-2 bg-slate-50 dark:bg-slate-900 cursor-not-allowed`}>
                    <span className="text-slate-900 dark:text-white font-semibold">
                      {form.umur || '—'}
                    </span>
                    {form.umur && <span className="text-slate-400 text-xs">tahun</span>}
                  </div>
                </Field>
              </div>
            </Section>

            {/* Seksi 3 — Fisik */}
            <Section title="Data Fisik" icon={<Scale className="w-4 h-4" />}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Berat Badan" error={errors.berat_badan} icon={<Scale className="w-4 h-4 text-slate-400" />}>
                  <div className="relative">
                    <input type="number" value={form.berat_badan} onChange={(e) => set('berat_badan', e.target.value)}
                      className={`${inp(errors.berat_badan)} pr-10`} placeholder="60" min="1" max="300" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">kg</span>
                  </div>
                </Field>
                <Field label="Tinggi Badan" error={errors.tinggi_badan} icon={<Ruler className="w-4 h-4 text-slate-400" />}>
                  <div className="relative">
                    <input type="number" value={form.tinggi_badan} onChange={(e) => set('tinggi_badan', e.target.value)}
                      className={`${inp(errors.tinggi_badan)} pr-10`} placeholder="165" min="1" max="300" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">cm</span>
                  </div>
                </Field>
              </div>
            </Section>

            {/* Seksi 4 — Kontak */}
            <Section title="Kontak & Alamat" icon={<Phone className="w-4 h-4" />}>
              <div className="grid gap-4">
                <Field label="Nomor Telepon" error={errors.no_telepon} icon={<Phone className="w-4 h-4 text-slate-400" />}>
                  <input type="tel" value={form.no_telepon} onChange={(e) => set('no_telepon', e.target.value)}
                    className={inp(errors.no_telepon)} placeholder="08123456789" />
                </Field>
                <Field label="Alamat" error={errors.alamat} icon={<MapPin className="w-4 h-4 text-slate-400" />}>
                  <textarea value={form.alamat} onChange={(e) => set('alamat', e.target.value)}
                    rows={2} className={inp(errors.alamat)} placeholder="Jl. Merdeka No. 1, Balikpapan" />
                </Field>
              </div>
            </Section>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => navigate('/user/dashboard')}
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                Batal
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 rounded-2xl bg-[#660000] py-3.5 text-sm font-semibold text-white hover:bg-[#4d0000] transition disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Menyimpan...</>
                ) : pendonorId ? 'Simpan Perubahan' : 'Simpan Data Diri'}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

const inp = (err) =>
  `w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 transition focus:outline-none focus:ring-2 ${
    err ? 'border-red-400 focus:ring-red-300' : 'border-slate-200 dark:border-slate-700 focus:ring-[#660000]/30 focus:border-[#660000]'
  }`;

const Section = ({ title, icon, children }) => (
  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
      <span className="text-[#660000] dark:text-red-400">{icon}</span>
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</span>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Field = ({ label, error, hint, icon, children }) => (
  <div>
    {label && (
      <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        {icon}{label}
      </label>
    )}
    {children}
    {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
  </div>
);
