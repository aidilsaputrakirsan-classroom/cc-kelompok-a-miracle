import React, { useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const ServiceUnavailable = ({ onRetry, error, fullPage = false }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      // Small timeout to give feedback to the user that retry happened
      setTimeout(() => {
        setIsRetrying(false);
      }, 800);
    }
  };

  const containerClasses = fullPage
    ? "fixed inset-0 bg-slate-50/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 dark:bg-slate-950/95 transition-colors duration-500"
    : "flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[2.5rem] shadow-xl max-w-2xl mx-auto my-8 transition-colors duration-500";

  return (
    <div className={containerClasses} role="alert">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center flex flex-col items-center max-w-md"
      >
        {/* Glow Icon Ring */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/10 rounded-3xl blur-xl animate-pulse" />
          <div className="relative w-20 h-20 bg-red-50 dark:bg-red-950/30 rounded-3xl flex items-center justify-center text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 shadow-inner">
            <WifiOff className="w-10 h-10" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
          Layanan Tidak Tersedia
        </h2>

        {/* Indonesian Description */}
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm lg:text-base leading-relaxed mb-8">
          Server sedang mengalami gangguan sementara atau dalam proses pemeliharaan jaringan. Kami sedang berupaya memulihkannya secepat mungkin.
        </p>

        {/* Error Detail (if any) */}
        {error && (error.message || error.response?.data?.detail) && (
          <div className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-850 p-4 rounded-2xl mb-8 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-550 block mb-1">
              Detail Teknis
            </span>
            <code className="text-xs text-red-650 dark:text-red-400 font-mono break-all leading-normal">
              {error.response?.data?.detail || error.message}
            </code>
          </div>
        )}

        {/* Retry Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-3 px-8 py-4.5 bg-[#660000] hover:bg-[#550000] text-white rounded-3xl font-bold shadow-lg shadow-[#660000]/20 dark:bg-red-600 dark:hover:bg-red-500 dark:shadow-red-900/30 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-wait"
        >
          <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Mencoba Kembali...' : 'Coba Lagi'}</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ServiceUnavailable;
