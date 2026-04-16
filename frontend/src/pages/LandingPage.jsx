import { motion } from 'framer-motion';
import { 
  Droplets,
  Heart, 
  ArrowRight,
  Search,
  Users,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';

const FeatureCard = ({ icon: Icon, title, desc, color = "text-[#660000]" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all text-center flex flex-col items-center group border border-slate-100 hover:border-[#660000]/20"
  >
    <div className={`w-16 h-16 bg-[#660000]/10 rounded-full flex items-center justify-center ${color} mb-6 group-hover:scale-110 group-hover:bg-[#660000]/20 transition-all duration-300`}>
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed flex-1">{desc}</p>
  </motion.div>
);

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <div className="bg-[#660000] text-white">
        {/* Hero Section */}
        <section className="relative overflow-visible pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
          {/* Background gradient elements with lower z-index */}
          <div className="absolute top-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-50 -z-10"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-2xl opacity-50 -z-10"></div>
          
          <div className="max-w-3xl mx-auto text-center relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-6 border border-white/30">
                <Heart className="w-3.5 h-3.5 fill-current" />
                PENGUJUAN PENDONOR DARAH
              </div>
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] text-white mb-8 drop-shadow-lg">
                TRACELT <span className="text-white/70">ITK</span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed mb-10 mx-auto max-w-2xl drop-shadow-md">
                Aplikasi berbasis web yang dirancang untuk membantu civitas akademika <strong>Institut Teknologi Kalimantan</strong> dalam mengajukan permohonan data pendonor darah sukarela.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/register" className="bg-white text-[#660000] px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-2xl shadow-black/30 hover:shadow-2xl hover:scale-105">
                  Daftar Jadi Pendonor
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#about" className="bg-white/15 backdrop-blur-md text-white border border-white/40 px-8 py-4 rounded-2xl font-bold hover:bg-white/25 transition-all hover:scale-105">
                  Pelajari Lebih Lanjut
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-black text-slate-900 mb-6">Solusi Terpusat Berbasis Cloud</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                TRACELT hadir sebagai solusi terpusat berbasis cloud yang memungkinkan pengelolaan data secara sistematis, aman, dan dapat diakses kapan saja serta dari berbagai perangkat.
              </p>
            </motion.div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: '🎯', label: 'Sistematis', desc: 'Pengelolaan data yang terstruktur dan rapi.' },
              { icon: '🛡️', label: 'Aman', desc: 'Data pribadi terlindungi dengan standar keamanan tinggi.' },
              { icon: '⚡', label: 'Efisien', desc: 'Proses verifikasi dan pendataan yang lebih cepat.' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:border-[#660000]/20"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-2xl font-bold text-[#660000] mb-2">{item.label}</div>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#660000]/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-slate-900 mb-6">Fitur Utama TRACELT</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              Platform yang dirancang khusus untuk mempermudah civitas akademika ITK dengan fitur-fitur canggih.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-24">
            <FeatureCard 
              icon={Users}
              title="Data Pendonor"
              desc="Unggah data pribadi lengkap mulai dari fisik hingga riwayat kesehatan."
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group"
            >
              <Link to="/stock" className="block h-full">
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all text-center flex flex-col items-center h-full border border-slate-100 hover:border-[#660000]/30 hover:bg-[#660000]/5">
                  <div className="w-16 h-16 bg-[#660000]/10 rounded-full flex items-center justify-center text-[#660000] mb-6 group-hover:scale-110 group-hover:bg-[#660000]/20 transition-all duration-300">
                    <Droplets className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Stok Darah</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">Pantau ketersediaan stok darah di ITK secara real-time dan transparan.</p>
                  <div className="text-[#660000] text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Lihat Detail <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
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
      <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white py-16 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-[#660000] rounded-lg flex items-center justify-center shadow-lg shadow-[#660000]/30">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase">TRACELT</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Platform pengelolaan pendonor darah untuk civitas akademika ITK.</p>
            </div>
            
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs">
            <p>© 2026 TRACELT by Miracle. Institut Teknologi Kalimantan. All rights reserved.</p>
            <p>Dibuat dengan ❤️ untuk kemanusiaan.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};