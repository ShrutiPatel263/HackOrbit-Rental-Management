import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    if (status === 401) {
      localStorage.removeItem('token');
      // Avoid redirect loop or form reset on explicit auth requests
      const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
      const alreadyOnLogin = typeof window !== 'undefined' && window.location.pathname === '/login';
      if (!isAuthRequest && !alreadyOnLogin) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth Service
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.get('/auth/verify'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
};

// Rental Service
export const rentalService = {
  getProducts: (filters) => api.get('/products', { params: filters }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  
  getBookings: () => api.get('/bookings'),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  updateBooking: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  cancelBooking: (id) => api.put(`/bookings/${id}/cancel`),
  
  checkAvailability: (productId, startDate, endDate) => 
    api.post('/bookings/check-availability', { productId, startDate, endDate }),
    
  getQuotation: (items) => api.post('/quotations', { items }),
  
  // Payment
  createPayment: (bookingId, amount) => api.post('/payments/create', { bookingId, amount }),
  verifyPayment: (paymentData) => api.post('/payments/verify', paymentData),
  
  // Razorpay
  getRazorpayKey: () => api.get('/razorpay/key'),
  createRazorpayOrder: (bookingId, amount) => api.post('/razorpay/create-order', { bookingId, amount }),
  verifyRazorpayPayment: (paymentData) => api.post('/razorpay/verify-payment', paymentData),
  verifyRazorpayOTP: (otp, bookingId) => api.post('/razorpay/verify-otp', { otp, bookingId }),
  
  // Admin
  getStats: () => api.get('/admin/stats'),
  getCustomers: () => api.get('/admin/customers'),
  getReports: (filters) => api.get('/admin/reports', { params: filters }),
  
  // File Upload
  uploadFile: (file, type = 'product') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

export default api;