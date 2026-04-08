import React, { useState, useEffect } from 'react';
import { Droplets, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    setIsLoggedIn(!!token);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Beranda', href: '/#' },
    { name: 'Tentang', href: '/#about' },
    { name: 'Fitur', href: '/#features' },
  ];

  return (
    <div className="sticky top-0 z-50 bg-[#660000] text-white shadow-lg">
      <nav className="max-w-7xl mx-auto px-6 py-4 lg:py-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Droplets className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2">
            <span className="text-xl lg:text-2xl font-black tracking-tighter text-white uppercase">TraceIt</span>
            <span className="text-[10px] lg:text-xs font-bold text-[#660000] bg-white px-2 py-0.5 rounded-full w-fit">by Miracle</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href} 
              className="text-white/80 text-sm font-medium hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
          
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link 
                to="/admin" 
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="text-white/70 hover:text-white p-2 transition-colors"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-white text-[#660000] px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-lg shadow-black/20"
            >
              Portal Admin
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#550000] border-t border-white/10 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="text-lg font-bold text-white/90 hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-white/10" />
              {isLoggedIn ? (
                <div className="flex flex-col gap-4">
                  <Link 
                    to="/admin" 
                    className="flex items-center justify-center gap-2 bg-white text-[#660000] py-4 rounded-2xl font-bold"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Ke Dashboard Admin
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 text-white/70 font-medium py-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Keluar dari Akun
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-white text-[#660000] py-4 rounded-2xl font-bold text-center shadow-xl"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Portal Admin
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};