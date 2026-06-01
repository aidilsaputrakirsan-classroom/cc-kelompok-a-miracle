import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

export const AuthServiceBanner = () => {
  const [authIsDown, setAuthIsDown] = useState(false);

  useEffect(() => {
    const unsubscribe = apiService.subscribeToAuthStatus((isDown) => {
      setAuthIsDown(isDown);
    });

    return () => unsubscribe();
  }, []);

  if (!authIsDown) {
    return null;
  }

  return (
    <div className="mb-6 rounded-3xl border border-red-300/90 bg-red-100/90 p-4 text-sm text-red-950 shadow-sm dark:border-red-500/30 dark:bg-red-950/80 dark:text-red-100">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-300" />
        <div>
          <p className="font-semibold">Layanan autentikasi sementara tidak tersedia.</p>
          <p className="text-sm text-red-700 dark:text-red-200">Beberapa fitur masuk, pendaftaran, atau otentikasi akan terbatas sementara. Silakan coba lagi beberapa saat kemudian.</p>
        </div>
      </div>
    </div>
  );
};
