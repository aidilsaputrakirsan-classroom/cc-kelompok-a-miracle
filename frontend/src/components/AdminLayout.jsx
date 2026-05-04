import React, { useState } from 'react';
import { 
  Users, 
  Droplets, 
  CheckCircle, 
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  PieChart as PieChartIcon
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ icon: Icon, label, path, active }) => (
  <Link
    to={path}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-[#660000]/10 text-[#660000] font-medium dark:bg-red-400/10 dark:text-red-400" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-[#660000] dark:text-red-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300")} />
    <span>{label}</span>
  </Link>
);

export const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const menuItems = [
    { icon: PieChartIcon, label: 'Statistik', path: '/admin' },
    { icon: Users, label: 'Dashboard Pendonor', path: '/admin/donors' },
    { icon: CheckCircle, label: 'Verifikasi', path: '/admin/verify' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex dark:bg-slate-950 dark:text-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6 fixed h-full dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-10 px-2">
          <Droplets className="w-8 h-8 text-[#660000] dark:text-red-400" />
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase dark:text-white">TRACELT</span>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.path} 
              {...item} 
              active={location.pathname === item.path} 
            />
          ))}
        </nav>

        <div className="flex flex-col gap-2 mt-auto">
          <button 
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-all duration-200"
          >
            {isDark ? (
              <>
                <Sun className="w-5 h-5" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-[#660000]/10 hover:text-[#660000] dark:hover:bg-red-400/10 dark:hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 px-4 py-3 flex items-center justify-between dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Droplets className="w-6 h-6 text-[#660000] dark:text-red-400" />
          <span className="font-black text-lg text-slate-900 uppercase tracking-tighter dark:text-white">TRACELT</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="dark:text-slate-300">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:hidden fixed inset-0 bg-white z-40 pt-20 px-6 dark:bg-slate-900"
        >
          <nav className="flex flex-col gap-4">
            {menuItems.map((item) => (
              <SidebarItem 
                key={item.path} 
                {...item} 
                active={location.pathname === item.path} 
              />
            ))}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-slate-500"
            >
              <LogOut className="w-5 h-5" />
              <span>Keluar</span>
            </button>
          </nav>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 pt-20 lg:pt-10">
        {children}
      </main>
    </div>
  );
};