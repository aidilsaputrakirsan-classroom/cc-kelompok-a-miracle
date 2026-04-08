import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { DonorList } from './pages/DonorList';
import { VerificationQueue } from './pages/VerificationQueue';
import { DonorRegistration } from './pages/DonorRegistration';
import { AdminLayout } from './components/AdminLayout';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<DonorRegistration />} />

        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/donors" element={
          <ProtectedRoute>
            <DonorList />
          </ProtectedRoute>
        } />
        <Route path="/admin/verify" element={
          <ProtectedRoute>
            <VerificationQueue />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}