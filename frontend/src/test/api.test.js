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
    const mockData = { data: { blood_stock: [] } };
    apiInstance.get.mockResolvedValue(mockData);

    const result = await apiService.getPublicBloodStock();
    
    expect(apiInstance.get).toHaveBeenCalledWith('/api/public/blood-stock');
    expect(result).toEqual(mockData);
  });

  it('loginAdmin calls correct endpoint with credentials', async () => {
    const credentials = { email: 'admin@test.com', password: 'password123' };
    const mockResponse = { data: { access_token: 'fake-token' } };
    apiInstance.post.mockResolvedValue(mockResponse);

    const result = await apiService.loginAdmin(credentials.email, credentials.password);
    
    expect(apiInstance.post).toHaveBeenCalledWith('/auth/admin/login', credentials);
    expect(result).toEqual(mockResponse);
  });
});