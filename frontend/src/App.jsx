import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { UserRegister } from './pages/UserRegister';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { DonorList } from './pages/DonorList';
import { VerificationQueue } from './pages/VerificationQueue';
import { DonorRegistration } from './pages/DonorRegistration';
import { PublicStock } from './pages/PublicStock';
import { AdminLayout } from './components/AdminLayout';
import AboutPage from "./components/AboutPage";
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

  // Load theme dari localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
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
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/register" element={<DonorRegistration />} />
        <Route path="/stock" element={<PublicStock />} />
        <Route path="/about" element={<AboutPage />} />

        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/donors" element={
          <AdminRoute>
            <DonorList />
          </AdminRoute>
        } />
        <Route path="/admin/verify" element={
          <AdminRoute>
            <VerificationQueue />
          </AdminRoute>
        } />

        <Route path="/user/dashboard" element={
          <UserRoute>
            <UserDashboard />
          </UserRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}