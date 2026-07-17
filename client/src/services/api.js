import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// Interceptor to attach Google Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mysafar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to unwrap Axios response and handle sliding session
api.interceptors.response.use(
  (response) => {
    // Sliding window logic: If backend issued a fresh token, save it silently
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('mysafar_token', newToken);
    }
    return response.data;
  },
  (error) => {
    // Automatically log out if the custom token expires
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('mysafar_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Opportunities
export const getOpportunities = (params) => api.get('/opportunities', { params });
export const getStats = () => api.get('/opportunities/stats');
export const getOpportunity = (id) => api.get(`/opportunities/${id}`);
export const createOpportunity = (data) => api.post('/opportunities', data);
export const updateOpportunity = (id, data) => api.put(`/opportunities/${id}`, data);
export const moveOpportunity = (id, section) => api.patch(`/opportunities/${id}/move`, { section });
export const deleteOpportunity = (id) => api.delete(`/opportunities/${id}`);

// Profile
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);

// Resumes
export const getResumes = () => api.get('/resumes');
export const uploadResume = (formData) => {
  return api.post('/resumes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
export const deleteResume = (id) => api.delete(`/resumes/${id}`);

export default api;
