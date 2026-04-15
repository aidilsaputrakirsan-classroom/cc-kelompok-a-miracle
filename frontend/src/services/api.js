import axios from 'axios';

const API_BASE_URL = '/api'; // Sesuaikan dengan URL backend Anda

const api = axios.create({
  baseURL: '', // Biarkan kosong jika menggunakan proxy atau path relatif
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token JWT
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token');
  const userToken = localStorage.getItem('user_token');
  
  // Prioritaskan admin token jika ada, atau gunakan user token
  const token = adminToken || userToken;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Auth Admin
  loginAdmin: (email, password) => api.post('/auth/admin/login', { email, password }),
  registerAdmin: (data) => api.post('/auth/admin/register', data),

  // Auth Pengguna
  loginPengguna: (email, password) => api.post('/auth/pengguna/login', { email, password }),
  registerPengguna: (data) => api.post('/auth/pengguna/register', data),
  getPenggunaMe: () => api.get('/pengguna/me'),

  // Pendonor
  registerPendonor: (data) => api.post('/pendonor', data),
  getPendonorList: (params) => api.get('/pendonor', { params }),
  getPendonorById: (id) => api.get(`/pendonor/${id}`),
  updatePendonor: (id, data) => api.put(`/pendonor/${id}`, data),
  deletePendonor: (id) => api.delete(`/pendonor/${id}`),

  // Public
  getPublicBloodStock: () => api.get('/api/public/blood-stock'),

  // Riwayat Donor (Admin)
  createRiwayatDonor: (data) => api.post('/riwayat-donor', data),
  getRiwayatDonorByPendonor: (pendonorId, params) => api.get(`/riwayat-donor/pendonor/${pendonorId}`, { params }),
  getRiwayatDonorAll: (params) => api.get('/riwayat-donor', { params }),
  getPendingVerifications: (params) => api.get('/riwayat-donor', { params: { ...params, status_verifikasi: false } }),
  verifyRiwayatDonor: (id, data) => api.post(`/riwayat-donor/${id}/verifikasi`, data),

  // Riwayat Donor (Pengguna)
  createRiwayatDonorPengguna: (data) => api.post('/pengguna/riwayat-donor', data),
  getRiwayatDonorPengguna: (params) => api.get('/pengguna/riwayat-donor', { params }),
  getRiwayatDonorDetailPengguna: (id) => api.get(`/pengguna/riwayat-donor/${id}`),
  updateRiwayatDonorPengguna: (id, data) => api.put(`/pengguna/riwayat-donor/${id}`, data),
};

export default api;