import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token JWT
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token');
  const userToken = localStorage.getItem('user_token');

  const requestPath = String(config.url || '');
  const isUserEndpoint = requestPath.startsWith('/pengguna');
  const isAdminEndpoint = requestPath.startsWith('/pendonor') || requestPath.startsWith('/riwayat-donor');

  let token = null;
  if (isUserEndpoint) {
    token = userToken;
  } else if (isAdminEndpoint) {
    token = adminToken;
  } else {
    token = adminToken || userToken;
  }
  
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
  getPublicBloodStock: () => api.get('/public/blood-stock'),

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
  deleteRiwayatDonorPengguna: (id) => api.delete(`/pengguna/riwayat-donor/${id}`),

  // Stats (Admin Dashboard)
  getStats: async () => {
    try {
      const [pendonorRes, riwayatAllRes, riwayatVerifiedRes, riwayatPendingRes] = await Promise.all([
        api.get('/pendonor', { params: { limit: 1000 } }),
        api.get('/riwayat-donor', { params: { limit: 1000 } }),
        api.get('/riwayat-donor', { params: { status_verifikasi: true, limit: 1000 } }),
        api.get('/riwayat-donor', { params: { status_verifikasi: false, limit: 1000 } }),
      ]);
      
      const pendonors = pendonorRes.data.pendonor || [];
      const riwayats = riwayatAllRes.data.riwayat_donor || [];
      const riwayatVerified = riwayatVerifiedRes.data.riwayat_donor || [];
      const riwayatPending = riwayatPendingRes.data.riwayat_donor || [];

      const verifiedPendonorIds = new Set(riwayatVerified.map((item) => item.id_pendonor));
      const verifiedPendonors = pendonors.filter((p) => verifiedPendonorIds.has(p.id_pendonor));
      
      const pendonor_by_golongan_darah = {};
      const pendonor_by_jenis_kelamin = {};
      
      verifiedPendonors.forEach((p) => {
        pendonor_by_golongan_darah[p.golongan_darah] = (pendonor_by_golongan_darah[p.golongan_darah] || 0) + 1;
        pendonor_by_jenis_kelamin[p.jenis_kelamin] = (pendonor_by_jenis_kelamin[p.jenis_kelamin] || 0) + 1;
      });
      
      return {
        data: {
          total_pendonor: pendonors.length,
          pendonor_siap_donor: riwayatVerified.length,
          verifikasi_pending: riwayatPending.length,
          donor_berhasil: riwayatVerified.length,
          pendonor_by_golongan_darah,
          stok_darah_by_golongan_darah: pendonor_by_golongan_darah,
          pendonor_by_jenis_kelamin,
          total_riwayat: riwayats.length,
        }
      };
    } catch (err) {
      console.error('Error computing stats:', err);
      throw err;
    }
  },
};

export default api;