import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

export const AuthServiceBanner = () => {
  const [authIsDown, setAuthIsDown] = useState(false);

  useEffect(() => {
    const unsubscribe = apiService.subscribeToAuthStatus((isDown) => {
      setAuthIsDown(isDown);
    });
    return unsubscribe;
  }, []);

  if (!authIsDown) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-6 rounded-3xl border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm dark:border-red-700/40 dark:bg-red-950/80 dark:text-red-200"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Layanan autentikasi sementara tidak tersedia.</p>
            <p className="text-xs text-red-700/90 dark:text-red-300/80">
              Beberapa fitur mungkin tidak dapat digunakan. Silakan tunggu beberapa saat dan coba lagi.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
