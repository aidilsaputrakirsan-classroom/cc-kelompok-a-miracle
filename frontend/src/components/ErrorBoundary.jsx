import { Component } from 'react';
import { isAxiosError } from 'axios';

function getFriendlyErrorMessage(error) {
  if (!error) return 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi nanti.';

  if (error.message === 'Service temporarily unavailable') {
    return 'Service temporarily unavailable';
  }

  if (isAxiosError(error)) {
    if (error.message?.includes('Network Error') || error.message?.includes('Service temporarily unavailable') || error.code === 'ERR_NETWORK') {
      return 'Service temporarily unavailable';
    }

    if (error.response) {
      if (error.response.status === 502 || error.response.status === 503 || error.response.status === 504) {
        return 'Service temporarily unavailable';
      }
      return `Permintaan ke API gagal dengan status ${error.response.status}. Silakan muat ulang atau coba lagi nanti.`;
    }

    return 'Terjadi kesalahan saat menghubungi API. Silakan coba lagi.';
  }

  return error.message || 'Terjadi kesalahan pada aplikasi. Silakan coba lagi.';
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-xl rounded-3xl border border-red-200 bg-white p-8 shadow-lg dark:border-red-500/30 dark:bg-slate-800">
            <h1 className="text-2xl font-semibold text-red-700 dark:text-red-300">Terjadi kesalahan pada aplikasi</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {getFriendlyErrorMessage(error)}
            </p>
            {error?.message && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 break-words">
                Detail: {error.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Muat ulang halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;