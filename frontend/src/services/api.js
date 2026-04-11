import axios from 'axios';

const API_BASE_URL = '/api'; // Sesuaikan dengan URL backend Anda

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token JWT ke setiap request admin
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Auth Admin
  loginAdmin: (email, password) => api.post('/auth/admin/login', { email, password }),
  registerAdmin: (data) => api.post('/auth/admin/register', data),

  // Pendonor
  registerPendonor: (data) => api.post('/pendonor', data),
  getPendonorList: (params) => api.get('/pendonor', { params }),
  getPendonorById: (id) => api.get(`/pendonor/${id}`),
  updatePendonor: (id, data) => api.put(`/pendonor/${id}`, data),
  deletePendonor: (id) => api.delete(`/pendonor/${id}`),

  // Riwayat Donor
  createRiwayatDonor: (data) => api.post('/riwayat-donor', data),
  getRiwayatDonorByPendonor: (pendonorId, params) => api.get(`/riwayat-donor/pendonor/${pendonorId}`, { params }),
  getPendingVerifications: (params) => api.get('/riwayat-donor', { params: { ...params, status_verifikasi: false } }),
  verifyRiwayatDonor: (id, data) => api.post(`/riwayat-donor/${id}/verifikasi`, data),

  // Riwayat Kesehatan
  createRiwayatKesehatan: (data) => api.post('/riwayat-kesehatan', data),
  getRiwayatKesehatanByPendonor: (pendonorId) => api.get(`/riwayat-kesehatan/pendonor/${pendonorId}`),
  updateRiwayatKesehatan: (id, keterangan) => api.put(`/riwayat-kesehatan/${id}`, { keterangan }),
  deleteRiwayatKesehatan: (id) => api.delete(`/riwayat-kesehatan/${id}`),

  // Gamifikasi & Stats
  getGamifikasi: (pendonorId) => api.get(`/pendonor/${pendonorId}/gamifikasi`),
  getStats: () => api.get('/stats/pendonor'),
};

export default api;