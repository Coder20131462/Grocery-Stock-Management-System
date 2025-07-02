import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Product API functions
export const productAPI = {
  getAll: () => axios.get(`${API_BASE_URL}/products`),
  getById: (id) => axios.get(`${API_BASE_URL}/products/${id}`),
  create: (product) => axios.post(`${API_BASE_URL}/products`, product),
  update: (id, product) => axios.put(`${API_BASE_URL}/products/${id}`, product),
  delete: (id) => axios.delete(`${API_BASE_URL}/products/${id}`),
  getByCategory: (category) => axios.get(`${API_BASE_URL}/products/category/${category}`),
  search: (name) => axios.get(`${API_BASE_URL}/products/search?name=${name}`),
  getLowStock: () => axios.get(`${API_BASE_URL}/products/low-stock`),
  getCategories: () => axios.get(`${API_BASE_URL}/products/categories`),
  updateStock: (id, quantity) => axios.put(`${API_BASE_URL}/products/${id}/stock`, { quantity })
};

// Auth API functions
export const authAPI = {
  login: (credentials) => axios.post(`${API_BASE_URL}/auth/signin`, credentials),
  register: (userData) => axios.post(`${API_BASE_URL}/auth/signup`, userData)
};

// Axios interceptor for handling authentication errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on the login page and not trying to login
      if (!window.location.pathname.includes('/login') && 
          !error.config?.url?.includes('/auth/signin')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
); 