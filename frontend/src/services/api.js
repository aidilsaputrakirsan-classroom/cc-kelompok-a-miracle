import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_token') || localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor untuk menangani service unavailable
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isNetworkError = error.code === 'ERR_NETWORK' || !error.response;
    const isServiceUnavailable = error.response && (error.response.status === 502 || error.response.status === 503 || error.response.status === 504);

    if (isNetworkError || isServiceUnavailable) {
      error.message = 'Service temporarily unavailable';
      if (!error.response) {
        error.response = {
          status: 503,
          data: { detail: 'Service temporarily unavailable' }
        };
      } else {
        error.response.data = error.response.data || {};
        error.response.data.detail = 'Service temporarily unavailable';
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth Gateway
  loginAdmin: (email, password) => api.post('/auth/login', { email, password }),
  registerAdmin: (data) => api.post('/auth/register', {
    email: data.email,
    password: data.password,
    name: data.nama_pengguna || data.name
  }),
  loginPengguna: (email, password) => api.post('/auth/login', { email, password }),
  registerPengguna: (data) => api.post('/auth/register', {
    email: data.email,
    password: data.password,
    name: data.nama_pengguna || data.name
  }),
  getPenggunaMe: () => api.get('/auth/verify'),

  // Items CRUD via Gateway
  getItems: (params) => api.get('/items', { params }),
  createItem: (data) => api.post('/items', data),
  getItemById: (id) => api.get(`/items/${id}`),
  updateItem: (id, data) => api.put(`/items/${id}`, data),
  deleteItem: (id) => api.delete(`/items/${id}`),

  // Legacy/Fallback/Bridge Methods for Testing Compatibility
  registerPendonor: (data) => api.post('/items', data),
  getPendonorList: (params) => api.get('/items', { params }),
  getPendonorById: (id) => api.get(`/items/${id}`),
  updatePendonor: (id, data) => api.put(`/items/${id}`, data),
  deletePendonor: (id) => api.delete(`/items/${id}`),
  getPublicBloodStock: () => api.get('/items'),
  createRiwayatDonor: (data) => api.post('/items', data),
  getRiwayatDonorByPendonor: (pendonorId, params) => api.get(`/items`, { params }),
  getRiwayatDonorAll: (params) => api.get('/items', { params }),
  getPendingVerifications: (params) => api.get('/items', { params }),
  verifyRiwayatDonor: (id, data) => api.post(`/items/${id}`, data),
  createRiwayatDonorPengguna: (data) => api.post('/items', data),
  getRiwayatDonorPengguna: (params) => api.get('/items', { params }),
  getRiwayatDonorDetailPengguna: (id) => api.get(`/items/${id}`),
  updateRiwayatDonorPengguna: (id, data) => api.put(`/items/${id}`, data),
  deleteRiwayatDonorPengguna: (id) => api.delete(`/items/${id}`),

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