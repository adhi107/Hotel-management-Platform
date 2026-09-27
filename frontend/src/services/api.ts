import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aura_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const branchId = localStorage.getItem('aura_branch_id');
  if (branchId) {
    config.headers['X-Branch-ID'] = branchId;
  }
  const tenantId = localStorage.getItem('aura_tenant_id');
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('aura_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
          const newAccessToken = res.data.data.access_token;
          const newRefreshToken = res.data.data.refresh_token;
          localStorage.setItem('aura_access_token', newAccessToken);
          localStorage.setItem('aura_refresh_token', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (e) {
          localStorage.removeItem('aura_access_token');
          localStorage.removeItem('aura_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
