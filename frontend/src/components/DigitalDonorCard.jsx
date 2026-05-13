import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Droplets, User, Calendar, MapPin, QrCode } from 'lucide-react';

export const DigitalDonorCard = ({ pendonor }) => {
  if (!pendonor) return null;

  const cardData = JSON.stringify({
    id: pendonor.id_pendonor,
    nama: pendonor.nama_lengkap,
    golongan_darah: pendonor.golongan_darah,
    last_donor: pendonor.tanggal_terakhir_donor
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-md mx-auto aspect-[1.586/1] bg-gradient-to-br from-[#660000] to-[#8b0000] rounded-[2rem] p-6 text-white shadow-2xl shadow-red-900/40 overflow-hidden group"
    >
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none" />
      
      <div className="relative h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <Droplets className="w-6 h-6 text-red-200" />
            </div>
            <div>
              <h3 className="font-black text-xl tracking-tighter leading-none">TRACELT</h3>
              <p className="text-[10px] font-bold text-white/60 tracking-widest uppercase">Digital Donor Card</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
            <span className="text-2xl font-black">{pendonor.golongan_darah}</span>
          </div>
        </div>

        <div className="flex gap-6 items-end">
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1">Nama Pendonor</p>
              <h4 className="text-xl font-bold truncate">{pendonor.nama_lengkap}</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1">ID Pendonor</p>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
                  <User className="w-3 h-3 text-white/40" />
                  {pendonor.id_pendonor}
                </div>
              </div>
              <div>
                <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1">Total Donor</p>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold">
                  <Droplets className="w-3 h-3 text-white/40" />
                  {pendonor.total_donor || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-500">
            <QRCodeSVG value={cardData} size={80} level="H" includeMargin={false} />
          </div>
        </div>
      </div>
      
      {/* Branding accent */}
      <div className="absolute right-0 bottom-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
        <QrCode className="w-20 h-20 rotate-12" />
      </div>
    </motion.div>
  );
};