import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/login?type=admin" replace />;
  return <AdminLayout>{children}</AdminLayout>;
};

const UserRoute = ({ children }) => {
  const token = localStorage.getItem('user_token');
  if (!token) return <Navigate to="/login?type=user" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user/register" element={<UserRegister />} />
        <Route path="/register" element={<DonorRegistration />} />
        <Route path="/stock" element={<PublicStock />} />

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