// import { describe, it, expect, vi, beforeEach } from 'vitest'

// // Mock fetch global
// global.fetch = vi.fn()

// describe('API Service', () => {
//   beforeEach(() => {
//     fetch.mockClear()
//   })

//   it('fetchItems memanggil endpoint yang benar', async () => {
//     fetch.mockResolvedValueOnce({
//       ok: true,
//       json: async () => ({ total: 0, items: [] }),
//     })

//     const response = await fetch('http://localhost:8000/items')
//     const data = await response.json()

//     expect(fetch).toHaveBeenCalledWith('http://localhost:8000/items')
//     expect(data.items).toEqual([])
//   })

//   it('handle error saat API gagal', async () => {
//     fetch.mockRejectedValueOnce(new Error('Network error'))

//     await expect(
//       fetch('http://localhost:8000/items')
//     ).rejects.toThrow('Network error')
//   })
// })

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from '../services/api';
import axios from 'axios';

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() },
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      })),
    },
  };
});

// Import the instances created inside api.js
import apiInstance from '../services/api';

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPublicBloodStock calls correct endpoint', async () => {
    const mockData = { data: { A: 10, B: 5 } };
    apiInstance.get.mockResolvedValue(mockData);

    const result = await apiService.getPublicBloodStock();
    
    expect(apiInstance.get).toHaveBeenCalledWith('/public/blood-stock');
    expect(result).toEqual(mockData);
  });

  it('loginAdmin calls correct endpoint with credentials', async () => {
    const credentials = { email: 'admin@test.com', password: 'password123' };
    const mockResponse = { data: { token: 'fake-token' } };
    apiInstance.post.mockResolvedValue(mockResponse);

    const result = await apiService.loginAdmin(credentials.email, credentials.password);
    
    expect(apiInstance.post).toHaveBeenCalledWith('/auth/admin/login', credentials);
    expect(result).toEqual(mockResponse);
  });
});