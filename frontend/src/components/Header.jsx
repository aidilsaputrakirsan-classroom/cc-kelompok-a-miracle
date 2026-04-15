import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Menu, X } from 'lucide-react';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check auth status
    const adminToken = localStorage.getItem('admin_token');
    const userToken = localStorage.getItem('user_token');
    setIsLoggedIn(!!(adminToken || userToken));
    setIsAdmin(!!adminToken);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Tentang', href: '/#about' },
    { name: 'Fitur', href: '/#features' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Droplets className={`w-8 h-8 transition-colors ${isScrolled ? 'text-[#660000]' : 'text-white'}`} />
          <span className={`text-2xl font-black tracking-tighter uppercase transition-colors ${isScrolled ? 'text-[#660000]' : 'text-white'}`}>
            TRACELT
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full transition-all ${
            isScrolled 
              ? 'bg-[#660000] text-white' 
              : 'bg-white text-[#660000]'
          }`}>
            by Miracle
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            link.href.startsWith('/#') || link.href.startsWith('#') ? (
              <a 
                key={link.name}
                href={link.href} 
                className={`text-sm font-medium transition-colors ${
                  isScrolled 
                    ? 'text-slate-600 hover:text-[#660000]' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={link.name}
                to={link.href} 
                className={`text-sm font-medium transition-colors ${
                  isScrolled 
                    ? 'text-slate-600 hover:text-[#660000]' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            )
          ))}
          
          {!isLoggedIn ? (
            <>
              <Link 
                to="/login" 
                className={`text-sm font-medium transition-colors ${
                  isScrolled 
                    ? 'text-slate-600 hover:text-[#660000]' 
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Masuk
              </Link>
              <Link 
                to="/login?type=admin" 
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
                  isScrolled 
                    ? 'bg-[#660000] text-white hover:bg-[#550000] shadow-[#660000]/20' 
                    : 'bg-white text-[#660000] hover:bg-slate-50 shadow-black/20'
                }`}
              >
                Portal Admin
              </Link>
            </>
          ) : (
            <Link 
              to={isAdmin ? "/admin" : "/user/dashboard"} 
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
                isScrolled 
                  ? 'bg-[#660000] text-white hover:bg-[#550000] shadow-[#660000]/20' 
                  : 'bg-white text-[#660000] hover:bg-slate-50 shadow-black/20'
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={`w-6 h-6 ${isScrolled ? 'text-slate-900' : 'text-white'}`} />
          ) : (
            <Menu className={`w-6 h-6 ${isScrolled ? 'text-slate-900' : 'text-white'}`} />
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                link.href.startsWith('/#') || link.href.startsWith('#') ? (
                  <a 
                    key={link.name}
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-semibold text-slate-900 hover:text-[#660000] transition-colors"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link 
                    key={link.name}
                    to={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-semibold text-slate-900 hover:text-[#660000] transition-colors"
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <Link 
                to={isLoggedIn ? "/admin" : "/login"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-[#660000] text-white px-6 py-4 rounded-2xl font-bold text-center shadow-lg shadow-[#660000]/20"
              >
                {isLoggedIn ? 'Dashboard' : 'Portal Admin'}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};