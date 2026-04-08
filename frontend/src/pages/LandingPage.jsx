import { motion } from 'framer-motion';
import { 
  Heart, 
  ArrowRight,
  Search,
  Users,
  ShieldCheck,
  Globe,
  Droplets
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';

const FeatureCard = ({ icon: Icon, title, desc, color = "text-[#660000]" }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center group">
    <div className={`w-16 h-16 bg-[#660000]/10 rounded-full flex items-center justify-center ${color} mb-6 group-hover:scale-110 transition-transform`}>
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />

      <div className="bg-[#660000] text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-6">
                <Heart className="w-3.5 h-3.5 fill-current" />
                PENGUJUAN PENDONOR DARAH
              </div>
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] text-white mb-8">
                TraceIt <span className="text-white/80">ITK</span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed mb-10 mx-auto max-w-2xl">
                Aplikasi berbasis web yang dirancang untuk membantu civitas akademika <strong>Institut Teknologi Kalimantan</strong> dalam mengajukan permohonan data pendonor darah sukarela.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/register" className="bg-white text-[#660000] px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-xl shadow-black/20">
                  Daftar Jadi Pendonor
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#about" className="bg-transparent text-white border border-white/30 px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all">
                  Pelajari Lebih Lanjut
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-8">Solusi Terpusat Berbasis Cloud</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-12">
            TraceIt hadir sebagai solusi terpusat berbasis cloud yang memungkinkan pengelolaan data secara sistematis, aman, dan dapat diakses kapan saja serta dari berbagai perangkat. Dengan demikian, proses pendataan pendonor sukarelawan menjadi lebih cepat, transparan, dan efisien.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="text-3xl font-black text-[#660000] mb-2">Sistematis</div>
              <p className="text-sm text-slate-500">Pengelolaan data yang terstruktur dan rapi.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="text-3xl font-black text-[#660000] mb-2">Aman</div>
              <p className="text-sm text-slate-500">Data pribadi terlindungi dengan standar keamanan tinggi.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="text-3xl font-black text-[#660000] mb-2">Efisien</div>
              <p className="text-sm text-slate-500">Proses verifikasi dan pendataan yang lebih cepat.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Fitur Utama TraceIt</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Platform yang dirancang khusus untuk mempermudah civitas akademika ITK.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={Users}
              title="Data Pendonor"
              desc="Unggah data pribadi lengkap mulai dari fisik hingga riwayat kesehatan."
            />
            <FeatureCard 
              icon={Search}
              title="Filter Cerdas"
              desc="Admin dapat memfilter pendonor berdasarkan nama, umur, dan golongan darah."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Verifikasi Cepat"
              desc="Proses verifikasi kesiapan pendonor yang transparan dan efisien."
            />
            <FeatureCard 
              icon={Globe}
              title="Akses Kapan Saja"
              desc="Dapat diakses dari berbagai perangkat melalui platform cloud."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <Droplets className="w-8 h-8 text-[#660000]" />
              <span className="text-2xl font-black tracking-tighter uppercase">TraceIt</span>
            </div>
            <div className="flex gap-8 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Beranda</a>
              <a href="#" className="hover:text-white transition-colors">Tentang Kami</a>
              <a href="#" className="hover:text-white transition-colors">Kontak</a>
              <a href="#" className="hover:text-white transition-colors">Privasi</a>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">
            <p>TraceIt by Miracle. Institut Teknologi Kalimantan.</p>
            <p>Dibuat dengan ❤️ untuk kemanusiaan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};