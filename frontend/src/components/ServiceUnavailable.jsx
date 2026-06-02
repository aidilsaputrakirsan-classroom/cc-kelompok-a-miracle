import { AlertCircle, RefreshCcw } from 'lucide-react';

export const ServiceUnavailable = ({ onRetry, error, fullPage = false }) => {
  const message = error?.response?.data?.detail || error?.message || 'Layanan sementara tidak tersedia. Silakan coba lagi nanti.';

  return (
    <div className={fullPage ? 'min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950' : 'rounded-3xl border border-slate-200/80 bg-white p-8 shadow-lg dark:border-slate-800/70 dark:bg-slate-900'}>
      <div className={fullPage ? 'w-full max-w-xl' : 'max-w-xl'}>
        <div className="rounded-3xl border border-red-200/70 bg-red-50 p-8 text-center shadow-sm dark:border-red-700/50 dark:bg-red-950/60">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-600/10 text-red-700 dark:bg-red-400/10 dark:text-red-200">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-900 dark:text-white">Layanan sementara tidak tersedia</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {message}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#660000] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4b0000]"
            >
              <RefreshCcw className="w-4 h-4" />
              Coba lagi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
