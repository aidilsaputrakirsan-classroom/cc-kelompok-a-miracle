import React, { useState, useEffect } from 'react';
import {
  Users,
  Droplets,
  CheckCircle,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  PieChart as PieChartIcon,
  Activity,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import useDarkMode from '../hooks/useDarkMode';
import { apiService } from '../services/api';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ icon: Icon, label, path, active, collapsed, badge }) => (
  <Link
    to={path}
    title={collapsed ? `${label}${badge > 0 ? ` (${badge} menunggu)` : ''}` : undefined}
    className={cn(
      'flex items-center rounded-xl transition-all duration-200 group',
      collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3',
      active
        ? 'bg-indigo-800/10 text-indigo-800 font-medium dark:bg-indigo-400/10 dark:text-indigo-400'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
    )}
  >
    {/* Icon with dot badge when collapsed */}
    <div className="relative shrink-0">
      <Icon className={cn(
        'w-5 h-5',
        active
          ? 'text-indigo-800 dark:text-indigo-400'
          : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
      )} />
      {badge > 0 && collapsed && (
        <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-amber-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none shadow-sm">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </div>
    {!collapsed && <span className="truncate flex-1">{label}</span>}
    {!collapsed && badge > 0 && (
      <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 text-[10px] font-black rounded-full leading-none shrink-0 border border-amber-200 dark:border-amber-900/40">
        {badge}
      </span>
    )}
  </Link>
);

export const AdminLayout = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, toggleDarkMode]                = useDarkMode();
  const [authIsDown, setAuthIsDown]             = useState(false);
  const [pendingCount, setPendingCount]         = useState(0);
  const [isCollapsed, setIsCollapsed]           = useState(
    () => localStorage.getItem('admin_sidebar_collapsed') === 'true'
  );

  useEffect(() => {
    const unsub = apiService.subscribeToAuthStatus((isDown) => setAuthIsDown(isDown));
    return () => unsub();
  }, []);

  // Fetch pending verification count; re-run on every route change so badge stays fresh
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await apiService.getPendingVerifications({ limit: 1 });
        setPendingCount(res.data.total ?? 0);
      } catch {
        // silently ignore — badge just won't update
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30_000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const menuItems = [
    { icon: PieChartIcon, label: 'Statistik',         path: '/admin' },
    { icon: Activity,    label: 'Status Sistem',      path: '/admin/status' },
    { icon: Users,       label: 'Dashboard Pendonor', path: '/admin/donors' },
    { icon: CheckCircle, label: 'Verifikasi',          path: '/admin/verify', badge: pendingCount },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/');
  };

  const sidebarW = isCollapsed ? '4rem' : '16rem';

  return (
    <div className="min-h-screen bg-slate-50 flex dark:bg-slate-950 dark:text-slate-50">

      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside
        style={{ width: sidebarW }}
        className="hidden lg:flex flex-col bg-white border-r border-indigo-900/15 fixed h-full z-30 overflow-hidden transition-[width] duration-300 ease-in-out dark:bg-slate-900 dark:border-indigo-700/20"
      >
        {/* Logo */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center pt-5 pb-4 px-2' : 'gap-3 pt-6 pb-2 px-4'} shrink-0`}>
          <Droplets className="w-8 h-8 text-indigo-800 dark:text-indigo-400 shrink-0" />
          {!isCollapsed && (
            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase dark:text-white whitespace-nowrap">
              TRACELT
            </span>
          )}
        </div>

        {!isCollapsed && (
          <div className="px-4 mb-6 shrink-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-800/10 text-indigo-800 dark:bg-indigo-400/10 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              Admin Portal
            </span>
          </div>
        )}
        {isCollapsed && <div className="mb-4" />}

        {/* Nav */}
        <nav className={`flex-1 flex flex-col gap-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              {...item}
              active={location.pathname === item.path}
              collapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Bottom actions */}
        <div className={`flex flex-col gap-1 pb-6 pt-4 border-t border-indigo-900/10 dark:border-indigo-700/15 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <button
            onClick={toggleDarkMode}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
            className={cn(
              'flex items-center rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400',
              isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
            )}
          >
            {isDark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {!isCollapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          <button
            onClick={handleLogout}
            title="Keluar"
            className={cn(
              'flex items-center rounded-xl transition-all duration-200 text-slate-500 hover:bg-indigo-800/10 hover:text-indigo-800 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-400',
              isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* ── Sidebar toggle — fixed sibling so overflow-hidden on aside never clips it */}
      <button
        onClick={toggleCollapsed}
        style={{ left: `calc(${sidebarW} - 12px)`, transition: 'left 300ms ease-in-out' }}
        className="hidden lg:flex fixed top-7 z-40 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-transform"
        title={isCollapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
      >
        {isCollapsed
          ? <ChevronRight className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          : <ChevronLeft  className="w-3 h-3 text-slate-500 dark:text-slate-400" />
        }
      </button>

      {/* ── Mobile Header ───────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-indigo-900/15 z-50 px-4 py-3 flex items-center justify-between dark:bg-slate-900 dark:border-indigo-700/20">
        <div className="flex items-center gap-2">
          <Droplets className="w-6 h-6 text-indigo-800 dark:text-indigo-400" />
          <span className="font-black text-lg text-slate-900 uppercase tracking-tighter dark:text-white">TRACELT</span>
          <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded bg-indigo-800/10 text-indigo-800 dark:bg-indigo-400/10 dark:text-indigo-400">
            Admin
          </span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="dark:text-slate-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* ── Mobile Menu Overlay ──────────────────────────── */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:hidden fixed inset-0 bg-white z-40 pt-20 px-6 dark:bg-slate-900"
        >
          <nav className="flex flex-col gap-3">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.path}
                {...item}
                active={location.pathname === item.path}
                collapsed={false}
              />
            ))}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl hover:bg-indigo-800/10 hover:text-indigo-800 dark:hover:bg-indigo-400/10 dark:hover:text-indigo-400 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Keluar</span>
              </button>
              <button
                type="button"
                onClick={() => { toggleDarkMode(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition-all"
              >
                {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
                {isDark ? 'Mode Terang' : 'Mode Gelap'}
              </button>
            </div>
          </nav>
        </motion.div>
      )}

      {/* ── Main Content ─────────────────────────────────── */}
      <main
        style={{ marginLeft: `max(0px, ${sidebarW})` }}
        className="flex-1 p-6 lg:p-10 pt-20 lg:pt-10 min-h-screen flex flex-col transition-[margin-left] duration-300 ease-in-out"
      >
        <AnimatePresence>
          {authIsDown && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="bg-gradient-to-r from-indigo-900 via-red-700 to-indigo-900 text-white text-xs md:text-sm font-bold p-4 rounded-2xl flex items-center gap-3 shadow-md overflow-hidden shrink-0"
            >
              <AlertCircle className="w-5 h-5 animate-pulse shrink-0" />
              <div>
                <p className="font-extrabold leading-none">Beberapa fitur sementara tidak tersedia</p>
                <p className="text-white/80 font-medium text-xs mt-1">Layanan autentikasi sedang offline.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};