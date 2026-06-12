import { Link, useNavigate } from 'react-router-dom';
import { Droplets, Sun, Moon, LogOut, ClipboardPlus, UserCog } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';

export const UserDashboardHeader = () => {
  const [isDark, toggleDarkMode] = useDarkMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('admin_token');
    navigate('/login?type=user');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 dark:bg-slate-900/80 dark:border-slate-800/50 shadow-sm">
      <nav className="max-w-full mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Droplets className="w-7 h-7 text-[#660000] dark:text-red-500" />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter uppercase text-slate-900 dark:text-white leading-none">
              TRACELT
            </span>
            <span className="text-[9px] font-bold tracking-widest uppercase opacity-60 text-slate-500 dark:text-slate-400">
              by Miracle
            </span>
          </div>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-all"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-[#660000]" />}
          </button>

          {/* Data Diri */}
          <Link
            to="/user/data-diri"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all"
          >
            <UserCog className="w-4 h-4" />
            <span className="hidden sm:inline">Data Diri</span>
          </Link>

          {/* Input Donor */}
          <Link
            to="/user/input-donor"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all"
          >
            <ClipboardPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Input Donor</span>
          </Link>

          {/* Keluar */}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-xl bg-[#660000] hover:bg-[#4d0000] px-4 py-2 text-sm font-semibold text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
