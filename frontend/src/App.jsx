import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
const LandingPage = lazy(() => import('./pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const UserRegister = lazy(() => import('./pages/UserRegister').then((module) => ({ default: module.UserRegister })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const UserDashboard = lazy(() => import('./pages/UserDashboard').then((module) => ({ default: module.UserDashboard })));
const DonorList = lazy(() => import('./pages/DonorList').then((module) => ({ default: module.DonorList })));
const VerificationQueue = lazy(() => import('./pages/VerificationQueue').then((module) => ({ default: module.VerificationQueue })));
const DonorRegistration = lazy(() => import('./pages/DonorRegistration').then((module) => ({ default: module.DonorRegistration })));
const PublicStock = lazy(() => import('./pages/PublicStock').then((module) => ({ default: module.PublicStock })));
const StatusPage = lazy(() => import('./pages/StatusPage'));
const AboutPage = lazy(() => import('./components/AboutPage'));
import { AdminLayout } from './components/AdminLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { apiService } from './services/api';

// ================= ADMIN ROUTE =================
const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
          setIsValid(false);
          setLoading(false);
          return;
        }

        await apiService.getPendonorList({});
        setIsValid(true);
      } catch (err) {
        console.error('Token validation failed:', err);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('user_token');
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Memverifikasi akses...</div>;
  if (!isValid) return <Navigate to="/login?type=admin" replace />;
  return <AdminLayout>{children}</AdminLayout>;
};

// ================= USER ROUTE =================
const UserRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = localStorage.getItem('user_token');
        if (!token) {
          setIsValid(false);
          setLoading(false);
          return;
        }

        await apiService.getPenggunaMe();
        setIsValid(true);
      } catch (err) {
        console.error('Token validation failed:', err);
        localStorage.removeItem('user_token');
        localStorage.removeItem('admin_token');
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen">Memverifikasi akses...</div>;
  if (!isValid) return <Navigate to="/login?type=user" replace />;
  return <>{children}</>;
};

// ================= APP =================
export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Background polling for health status to detect if auth service is down
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await apiService.getHealth();
        const authStatus = res.data?.dependencies?.['auth-service'];
        if (authStatus) {
          const isUnavailable = authStatus.status === 'unavailable' || authStatus.circuit_breaker?.state !== 'CLOSED';
          apiService.setAuthDownStatus(isUnavailable);
        }
      } catch (err) {
        console.error('Health check failed:', err);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // 10 seconds polling
    return () => clearInterval(interval);
  }, []);

  // Load theme dari localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setDarkMode(shouldUseDark);
    if (shouldUseDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;

      if (newMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }

      return newMode;
    });
  };
  
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Memuat halaman...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/register" element={<DonorRegistration />} />
            <Route path="/stock" element={<PublicStock />} />
            <Route path="/about" element={<AboutPage />} />

            <Route path="/status" element={<StatusPage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/donors"
              element={
                <AdminRoute>
                  <DonorList />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/verify"
              element={
                <AdminRoute>
                  <VerificationQueue />
                </AdminRoute>
              }
            />

            <Route
              path="/user/dashboard"
              element={
                <UserRoute>
                  <UserDashboard />
                </UserRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}