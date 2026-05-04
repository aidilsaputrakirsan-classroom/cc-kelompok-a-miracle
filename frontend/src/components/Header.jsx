import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Menu, X, Sun, Moon, ArrowRight } from 'lucide-react';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initial theme check
    const savedTheme = localStorage.getItem('theme');
    setIsDark(savedTheme === 'dark' || document.documentElement.classList.contains('dark'));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    const handleStorageChange = () => {
      const adminToken = localStorage.getItem('admin_token');
      const userToken = localStorage.getItem('user_token');
      setIsLoggedIn(!!(adminToken || userToken));
      setIsAdmin(!!adminToken);
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', handleStorageChange);
    
    // Initial check
    handleStorageChange();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Tentang', href: '/#about' },
    { name: 'Fitur', href: '/#features' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-lg py-3 dark:bg-slate-900/80 dark:shadow-slate-950/50 border-b border-slate-200/50 dark:border-slate-800/50' 
          : 'bg-transparent py-6'
      }`}
    >
      <nav className="max-w-full mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group relative">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            className={`transition-colors ${isScrolled ? 'text-[#660000] dark:text-red-500' : 'text-white'}`}
          >
            <Droplets className="w-8 h-8" />
          </motion.div>
          <div className="flex flex-col">
            <span className={`text-2xl font-black tracking-tighter uppercase transition-colors leading-none ${isScrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
              TRACELT
            </span>
            <span className={`text-[10px] font-bold tracking-widest uppercase opacity-70 transition-colors ${isScrolled ? 'text-slate-500 dark:text-slate-400' : 'text-white/80'}`}>
              by Miracle
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            link.href.startsWith('/#') || link.href.startsWith('#') ? (
              <a 
                key={link.name}
                href={link.href} 
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all relative group ${
                  isScrolled 
                    ? 'text-slate-600 hover:text-[#660000] dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.name}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            ) : (
              <Link 
                key={link.name}
                to={link.href} 
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all relative group ${
                  window.location.pathname === link.href
                    ? (isScrolled ? 'text-[#660000] dark:text-red-400 bg-red-50 dark:bg-red-500/10' : 'text-white bg-white/20')
                    : (isScrolled 
                        ? 'text-slate-600 hover:text-[#660000] dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800' 
                        : 'text-white/80 hover:text-white hover:bg-white/10')
                }`}
              >
                {link.name}
                {window.location.pathname === link.href && (
                  <motion.span layoutId="nav-active" className="absolute bottom-1 left-4 right-4 h-0.5 bg-current" />
                )}
              </Link>
            )
          ))}

          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-3 opacity-30" />

          {/* Dark Mode Toggle */}
          <div className="relative group mr-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl transition-all flex items-center gap-2 border shadow-sm ${
                isScrolled 
                  ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300' 
                  : 'border-white/20 bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              ) : (
                <Moon className="w-4 h-4 text-[#660000] fill-[#660000]/10 dark:text-red-400" />
              )}
            </motion.button>
            <div className="absolute top-full right-0 mt-3 p-2 bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0 shadow-xl border border-white/10">
              {isDark ? 'Mode Terang' : 'Mode Gelap'}
            </div>
          </div>
          
          {!isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className={`text-sm font-bold px-4 py-2 rounded-lg transition-all ${
                  isScrolled 
                    ? 'text-slate-600 hover:text-[#660000] dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Masuk
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/login?type=admin" 
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg flex items-center gap-2 group/btn ${
                    isScrolled 
                      ? 'bg-[#660000] text-white hover:bg-[#550000] shadow-[#660000]/20' 
                      : 'bg-white text-[#660000] hover:bg-slate-50 shadow-black/20'
                  }`}
                >
                  Portal Admin
                  <motion.span 
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to={isAdmin ? "/admin" : "/user/dashboard"} 
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg flex items-center gap-2 ${
                  isScrolled 
                    ? 'bg-[#660000] text-white hover:bg-[#550000] shadow-[#660000]/20' 
                    : 'bg-white text-[#660000] hover:bg-slate-50 shadow-black/20'
                }`}
              >
                Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className={`w-6 h-6 ${isScrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`} />
          ) : (
            <Menu className={`w-6 h-6 ${isScrolled ? 'text-slate-900 dark:text-white' : 'text-white'}`} />
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
            className="lg:hidden bg-white border-t border-slate-100 overflow-hidden dark:bg-slate-900 dark:border-slate-800"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                link.href.startsWith('/#') || link.href.startsWith('#') ? (
                  <a 
                    key={link.name}
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-semibold text-slate-900 hover:text-[#660000] transition-colors dark:text-white dark:hover:text-red-400"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link 
                    key={link.name}
                    to={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-semibold text-slate-900 hover:text-[#660000] transition-colors dark:text-white dark:hover:text-red-400"
                  >
                    {link.name}
                  </Link>
                )
              ))}
              {!isLoggedIn ? (
                <>
                  <Link 
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-semibold text-slate-900 hover:text-[#660000] transition-colors dark:text-white dark:hover:text-red-400"
                  >
                    Masuk
                  </Link>
                  <Link 
                    to="/login?type=admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-[#660000] text-white px-6 py-4 rounded-2xl font-bold text-center shadow-lg shadow-[#660000]/20 dark:bg-red-900 dark:shadow-red-900/20"
                  >
                    Portal Admin
                  </Link>
                </>
              ) : (
                <Link 
                  to={isAdmin ? "/admin" : "/user/dashboard"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-[#660000] text-white px-6 py-4 rounded-2xl font-bold text-center shadow-lg shadow-[#660000]/20 dark:bg-red-900 dark:shadow-red-900/20"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};