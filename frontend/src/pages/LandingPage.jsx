import { useState, useEffect } from 'react';
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
import { LoadingSpinner } from '../components/LoadingSpinner';

const FeatureCard = ({ icon: Icon, title, desc, color = "text-[#660000]" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all text-center flex flex-col items-center group border border-slate-100 dark:bg-slate-900/50 dark:backdrop-blur-sm dark:border-slate-800 dark:hover:border-red-400/30 hover:-translate-y-2"
  >
    <div className={`w-16 h-16 bg-[#660000]/10 rounded-2xl flex items-center justify-center ${color} mb-6 group-hover:scale-110 group-hover:bg-[#660000]/20 transition-all duration-500 dark:bg-red-400/10 dark:text-red-400 shadow-inner`}>
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-black text-slate-900 mb-3 dark:text-white tracking-tight">{title}</h3>
    <p className="text-slate-500 text-sm font-medium leading-relaxed flex-1 dark:text-slate-400">{desc}</p>
  </motion.div>
);

export const LandingPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <div className="min-h-screen bg-white font-sans dark:bg-slate-950 transition-colors duration-300">
      <Header />
      <div className="bg-[#660000] text-white dark:bg-red-950 transition-colors duration-300">
        {/* Hero Section */}
        <section className="relative overflow-visible pt-32 pb-24 lg:pt-48 lg:pb-32 px-6">
          {/* Background gradient elements with lower z-index */}
          <div className="absolute top-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl opacity-50 -z-10"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-2xl opacity-50 -z-10"></div>
          
          <div className="max-w-6xl mx-auto text-center relative z-20">
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
              <div className="flex flex-wrap gap-6 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="bg-white text-[#660000] px-10 py-5 rounded-[2rem] font-black text-lg flex items-center gap-2 hover:bg-slate-50 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] group/cta">
                    Daftar Jadi Pendonor
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight className="w-6 h-6 group-hover/cta:translate-x-1 transition-transform" />
                    </motion.div>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <a href="#about" className="bg-white/10 backdrop-blur-xl text-white border-2 border-white/30 px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-white/20 transition-all flex items-center border-b-[4px] active:border-b-0 active:translate-y-1">
                    Pelajari Lebih Lanjut
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-slate-50 relative overflow-hidden dark:bg-slate-900 border-y border-slate-200/50 dark:border-slate-800/50 transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#660000]/20 to-transparent dark:via-red-500/20" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#660000]/5 rounded-full blur-3xl dark:bg-red-400/5" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[#660000] font-black tracking-widest text-xs uppercase mb-4 block dark:text-red-400">Tentang Kami</span>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-8 dark:text-white tracking-tight">Solusi Terpusat Berbasis Cloud</h2>
              <div className="w-24 h-1.5 bg-[#660000] mx-auto rounded-full mb-8 dark:bg-red-500" />
              <p className="text-xl text-slate-600 leading-relaxed dark:text-slate-400 max-w-3xl mx-auto font-medium">
                TRACELT hadir sebagai solusi terpusat berbasis cloud yang memungkinkan pengelolaan data secara sistematis, aman, dan dapat diakses kapan saja serta dari berbagai perangkat.
              </p>
            </motion.div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: '🎯', label: 'Sistematis', desc: 'Pengelolaan data yang terstruktur dan rapi untuk kemudahan akses.', gradient: 'from-blue-500/10 to-blue-500/5' },
              { icon: '🛡️', label: 'Aman', desc: 'Data pribadi terlindungi dengan standar keamanan tinggi dan enkripsi cloud.', gradient: 'from-[#660000]/10 to-[#660000]/5' },
              { icon: '⚡', label: 'Efisien', desc: 'Proses verifikasi dan pendataan yang lebih cepat untuk tindakan darurat.', gradient: 'from-amber-500/10 to-amber-500/5' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                className={`p-10 rounded-[2.5rem] shadow-xl border border-white dark:border-slate-800 transition-all bg-white dark:bg-slate-800 relative group overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10 text-center">
                  <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-500 inline-block">{item.icon}</div>
                  <div className="text-2xl font-black text-slate-800 mb-4 dark:text-white">{item.label}</div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white relative overflow-hidden dark:bg-slate-950 transition-colors duration-500">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#660000]/5 rounded-full blur-[100px] dark:bg-red-400/5 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-full mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#660000]/10 text-[#660000] text-[10px] font-black uppercase tracking-widest mb-4 dark:bg-red-500/10 dark:text-red-400">Power of Cloud</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 dark:text-white tracking-tight">Fitur Utama TRACELT</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-xl dark:text-slate-400 font-medium">
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
                <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all text-center flex flex-col items-center h-full border border-slate-100 hover:border-[#660000]/30 hover:bg-[#660000]/5 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-800/50">
                  <div className="w-16 h-16 bg-[#660000]/10 rounded-full flex items-center justify-center text-[#660000] mb-6 group-hover:scale-110 group-hover:bg-[#660000]/20 transition-all duration-300 dark:bg-red-400/10 dark:text-red-400">
                    <Droplets className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 dark:text-white">Stok Darah</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1 dark:text-slate-400">Pantau ketersediaan stok darah di ITK secara real-time dan transparan.</p>
                  <div className="text-[#660000] text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:text-red-400">
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
        <div className="max-w-full mx-auto">
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