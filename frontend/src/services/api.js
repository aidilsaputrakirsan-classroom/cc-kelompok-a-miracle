import axios from 'axios';

// Default fallback points to backend dev port 80 when VITE_API_URL tidak diset
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

let authIsDown = false;
const authStatusCallbacks = new Set();

const setAuthDown = (isDown) => {
  if (authIsDown !== isDown) {
    authIsDown = isDown;
    authStatusCallbacks.forEach((cb) => cb(isDown));
  }
};

// Interceptor untuk menangani service unavailable
api.interceptors.response.use(
  (response) => {
    // If request succeeded, and it was to auth-service, we know auth-service is UP!
    if (response.config && response.config.url && response.config.url.includes('/auth/')) {
      setAuthDown(false);
    }
    return response;
  },
  (error) => {
    const isNetworkError = error.code === 'ERR_NETWORK' || !error.response;
    const isServiceUnavailable = error.response && (error.response.status === 502 || error.response.status === 503 || error.response.status === 504);

    if (isNetworkError || isServiceUnavailable) {
      error.message = 'Layanan sementara tidak tersedia';

      // If the failed request was to auth-service, auth is definitely down!
      if (error.config && error.config.url && error.config.url.includes('/auth/')) {
        setAuthDown(true);
      }

      if (!error.response) {
        error.response = {
          status: 503,
          data: { detail: 'Layanan sementara tidak tersedia' }
        };
      } else {
        if (!error.response.data || typeof error.response.data !== 'object') {
          error.response.data = { detail: 'Layanan sementara tidak tersedia' };
        } else {
          error.response.data.detail = 'Layanan sementara tidak tersedia';
        }
      }
    } else if (error.response && error.response.status === 401) {
      // 401 is from auth-service, so the service is UP!
      if (error.config && error.config.url && error.config.url.includes('/auth/')) {
        setAuthDown(false);
      }
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check endpoint
  getHealth: () => api.get('/health'),

  // Auth Health Status Observers
  subscribeToAuthStatus: (callback) => {
    authStatusCallbacks.add(callback);
    callback(authIsDown);
    return () => authStatusCallbacks.delete(callback);
  },
  isAuthDown: () => authIsDown,
  setAuthDownStatus: (isDown) => setAuthDown(isDown),

  // Auth Gateway
  loginAdmin: (email, password) => api.post('/auth/admin/login', { email, password }),
  registerAdmin: (data) => api.post('/auth/admin/register', {
    email: data.email,
    password: data.password,
    nama_admin: data.nama_pengguna || data.name
  }),
  loginPengguna: (email, password) => api.post('/auth/pengguna/login', { email, password }),
  registerPengguna: (data) => api.post('/auth/pengguna/register', {
    email: data.email,
    password: data.password,
    nama_pengguna: data.nama_pengguna || data.name
  }),
  getPenggunaMe: () => api.get('/pengguna/me'),

  // Pendonor, riwayat, and public blood stock
  registerPendonor: (data) => api.post('/pendonor', data),
  getPendonorList: (params) => api.get('/pendonor', { params }),
  getPendonorById: (id) => api.get(`/pendonor/${id}`),
  updatePendonor: (id, data) => api.put(`/pendonor/${id}`, data),
  deletePendonor: (id) => api.delete(`/pendonor/${id}`),
  getPublicBloodStock: () => api.get('/api/public/blood-stock'),
  createRiwayatDonor: (data) => api.post('/riwayat-donor', data),
  getRiwayatDonorByPendonor: (pendonorId, params) => api.get(`/riwayat-donor/pendonor/${pendonorId}`, { params }),
  getRiwayatDonorAll: (params) => api.get('/riwayat-donor', { params }),
  getPendingVerifications: (params) => api.get('/riwayat-donor', { params: { status_verifikasi: false, ...params } }),
  verifyRiwayatDonor: (id, data) => api.post(`/riwayat-donor/${id}/verifikasi`, data),
  createRiwayatDonorPengguna: (data) => api.post('/pengguna/riwayat-donor', data),
  getRiwayatDonorPengguna: (params) => api.get('/pengguna/riwayat-donor', { params }),
  getRiwayatDonorDetailPengguna: (id) => api.get(`/pengguna/riwayat-donor/${id}`),
  updateRiwayatDonorPengguna: (id, data) => api.put(`/pengguna/riwayat-donor/${id}`, data),
  deleteRiwayatDonorPengguna: (id) => api.delete(`/pengguna/riwayat-donor/${id}`),

  // Stats (Admin Dashboard)
  getStats: async () => {
    try {
      const [pendonorRes, riwayatVerifiedRes, riwayatPendingRes, bloodStockRes] = await Promise.all([
        api.get('/pendonor', { params: { limit: 1000 } }),
        api.get('/riwayat-donor', { params: { status_verifikasi: true, limit: 1000 } }),
        api.get('/riwayat-donor', { params: { status_verifikasi: false, limit: 1 } }),
        api.get('/api/public/blood-stock'),
      ]);

      const pendonors = pendonorRes.data.pendonor || [];
      const riwayatVerified = riwayatVerifiedRes.data.riwayat_donor || [];

      // Use API-level totals (accurate regardless of pagination limit)
      const totalPendonor = pendonorRes.data.total ?? pendonors.length;
      const totalDonorBerhasil = riwayatVerifiedRes.data.total ?? riwayatVerified.length;
      const totalPending = riwayatPendingRes.data.total ?? 0;

      // Unique pendonors with at least one verified riwayat (for Pendonor Siap & gender chart)
      const verifiedPendonorIds = new Set(riwayatVerified.map((item) => item.id_pendonor));

      // Gender distribution — verified donors only
      const pendonor_by_jenis_kelamin = {};
      pendonors
        .filter((p) => verifiedPendonorIds.has(p.id_pendonor))
        .forEach((p) => {
          pendonor_by_jenis_kelamin[p.jenis_kelamin] = (pendonor_by_jenis_kelamin[p.jenis_kelamin] || 0) + 1;
        });

      // Blood stock — from backend (verified donors, grouped by blood type)
      const stok_darah_by_golongan_darah = {};
      (bloodStockRes.data.blood_stock || []).forEach(({ golongan_darah, jumlah_stok }) => {
        stok_darah_by_golongan_darah[golongan_darah] = jumlah_stok;
      });

      return {
        data: {
          total_pendonor: totalPendonor,
          pendonor_siap_donor: verifiedPendonorIds.size,
          verifikasi_pending: totalPending,
          donor_berhasil: totalDonorBerhasil,
          pendonor_by_golongan_darah: stok_darah_by_golongan_darah,
          stok_darah_by_golongan_darah,
          pendonor_by_jenis_kelamin,
        }
      };
    } catch (err) {
      console.error('Error computing stats:', err);
      throw err;
    }
  },
};

export default api;