import React, { useState } from 'react';
import { 
  Users, 
  Droplets, 
  CheckCircle, 
  LayoutDashboard, 
  LogOut,
  Menu,
  X
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
        ? "bg-[#660000]/10 text-[#660000] font-medium" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-[#660000]" : "text-slate-400 group-hover:text-slate-600")} />
    <span>{label}</span>
  </Link>
);

export const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Dashboard Pendonor', path: '/admin/donors' },
    { icon: CheckCircle, label: 'Verifikasi', path: '/admin/verify' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 p-6 fixed h-full">
        <div className="flex items-center gap-3 mb-10 px-2">
          <Droplets className="w-8 h-8 text-[#660000]" />
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">TRACELT</span>
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

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-[#660000]/10 hover:text-[#660000] transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="w-6 h-6 text-[#660000]" />
          <span className="font-black text-lg text-slate-900 uppercase tracking-tighter">TRACELT</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:hidden fixed inset-0 bg-white z-40 pt-20 px-6"
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