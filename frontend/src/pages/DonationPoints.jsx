import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Info, ArrowLeft, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY);

const DONATION_POINTS = [
  {
    id: 'itk',
    name: 'Institut Teknologi Kalimantan (ITK)',
    position: { lat: -1.1517, lng: 116.8615 },
    address: 'Jl. Soekarno Hatta No.KM 15, Karang Joang, Kec. Balikpapan Utara, Kota Balikpapan',
    is_pmi: false,
    description: 'Titik kumpul donor darah rutin civitas akademika ITK.'
  },
  {
    id: 'pmi-bpp',
    name: 'PMI Kota Balikpapan',
    position: { lat: -1.2427, lng: 116.8407 },
    address: 'Jl. Jenderal Sudirman No.KM.2, Klandasan Ulu, Kec. Balikpapan Kota',
    is_pmi: true,
    description: 'Unit Donor Darah (UDD) Utama PMI Balikpapan. Buka 24 Jam.'
  }
];

const MarkerWithInfoWindow = ({ point }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={point.position}
        onClick={() => setOpen(true)}
        title={point.name}
      >
        <Pin 
          background={point.is_pmi ? "#dc2626" : "#660000"} 
          glyphColor="#fff" 
          borderColor="#fff"
        />
      </AdvancedMarker>
      {open && (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <div className="p-2 max-w-[200px] text-slate-900">
            <h3 className="font-bold text-sm mb-1">{point.name}</h3>
            <p className="text-[10px] text-slate-500 mb-2 leading-tight">{point.address}</p>
            <p className="text-[10px] bg-red-50 text-red-700 p-1.5 rounded-lg border border-red-100">
              {point.description}
            </p>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export const DonationPoints = () => {
  const [selectedPoint, setSelectedPoint] = useState(null);

  if (!hasValidKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-16 h-16 text-[#660000] mb-6 animate-bounce" />
        <h2 className="text-3xl font-black mb-4">Google Maps API Key Diperlukan</h2>
        <p className="text-slate-600 max-w-md mb-8">
          Untuk mengaktifkan fitur peta, mohon masukkan API Key di menu <strong>Settings</strong> &gt; <strong>Secrets</strong> dengan nama <code>GOOGLE_MAPS_PLATFORM_KEY</code>.
        </p>
        <Link to="/" className="px-8 py-3 bg-[#660000] text-white rounded-2xl font-bold hover:bg-[#550000] transition-all">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden pt-16">
        {/* Sidebar */}
        <div className="w-full md:w-96 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-10 shadow-xl">
          <div className="p-8 bg-gradient-to-br from-[#660000] to-[#8b0000] text-white">
            <h2 className="text-2xl font-black mb-1">Titik Donor</h2>
            <p className="text-white/70 text-sm font-bold">Cari lokasi donor terdekat di Balikpapan.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {DONATION_POINTS.map((point) => (
              <motion.button
                key={point.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPoint(point)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                  selectedPoint?.id === point.id 
                    ? 'border-[#660000] bg-red-50 dark:bg-red-950/20 shadow-lg' 
                    : 'border-slate-100 bg-white dark:bg-slate-800 dark:border-slate-700 hover:border-slate-200'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    point.is_pmi ? 'bg-red-100 text-red-600' : 'bg-red-50 text-[#660000]'
                  }`}>
                    {point.is_pmi ? <Droplets className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">{point.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{point.address}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#660000] dark:text-red-400">
                      <Navigation className="w-3 h-3" />
                      <span>{point.is_pmi ? 'PMI Office' : 'Kampus ITK'}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-normal font-medium">
                Pilih lokasi untuk melihat detail dan rute menuju titik donor darah.
              </p>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              mapId="TRACELT_MAP_ID"
              center={selectedPoint?.position || DONATION_POINTS[0].position}
              zoom={13}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              gestureHandling={'greedy'}
              disableDefaultUI={false}
            >
              {DONATION_POINTS.map(point => (
                <MarkerWithInfoWindow key={point.id} point={point} />
              ))}
            </Map>
          </APIProvider>
        </div>
      </main>
    </div>
  );
};