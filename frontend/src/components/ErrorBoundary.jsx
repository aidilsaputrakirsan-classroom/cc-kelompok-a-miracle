import { Component } from 'react';

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
    const { hasError } = this.state;
    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-xl rounded-3xl border border-red-200 bg-white p-8 shadow-lg dark:border-red-500/30 dark:bg-slate-800">
            <h1 className="text-2xl font-semibold text-red-700 dark:text-red-300">Terjadi kesalahan pada aplikasi</h1>
            <p className="mt-3 text-sm leading-relaxed text-red-600 dark:text-red-200">
              Mohon muat ulang halaman atau coba lagi nanti. Jika masalah berlanjut, hubungi tim pengembang.
            </p>
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