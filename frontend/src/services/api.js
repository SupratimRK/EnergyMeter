import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('API Base URL:', API_BASE_URL);

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Real-time data API
export const realtimeApi = {
  getCurrent: () => api.get('/realtime'),
  getStream: () => new WebSocket(import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000/realtime/stream'),
};

// Historical data API
export const historicalApi = {
  getHistorical: (params = {}) => api.get('/historical', { params }),
  getDaily: (date) => api.get('/historical/daily', { params: { date } }),
  getWeekly: () => api.get('/historical/weekly'),
  getMonthly: () => api.get('/historical/monthly'),
};

// Balance management API
export const balanceApi = {
  getBalance: () => api.get('/balance'),
  recharge: (amount, description = 'Manual recharge', paymentMethod = 'Online') =>
    api.post('/balance/recharge', { amount, description, payment_method: paymentMethod }),
  getTransactions: (params = {}) => api.get('/balance/transactions', { params }),
};

// Device management API
export const deviceApi = {
  getStatus: () => api.get('/device/status'),
  disconnect: (reason = 'Manual disconnect') => api.post('/device/disconnect', { reason }),
  reconnect: (reason = 'Manual reconnect') => api.post('/device/reconnect', { reason }),
  getHealth: () => api.get('/device/health'),
};

// Configuration API
export const configApi = {
  getRates: () => api.get('/config/rates'),
  updateRates: (rates) => api.put('/config/rates', { rates }),
  getWebhooks: () => api.get('/config/webhooks'),
  createWebhook: (webhook) => api.post('/config/webhooks', webhook),
  testWebhook: (id) => api.post(`/config/webhooks/${id}/test`),
};

// Health check API
export const healthApi = {
  check: () => api.get('/health', { baseURL: 'http://localhost:3000' }),
};

// Utility functions
export const formatCurrency = (amount) => {
  if (typeof amount === 'string' && amount.includes('₹')) {
    return amount;
  }
  return `₹${parseFloat(amount).toFixed(2)}`;
};

export const parseNumericValue = (value) => {
  if (typeof value === 'string') {
    return parseFloat(value.replace(/[^\d.-]/g, ''));
  }
  return value;
};

export const formatPower = (power) => {
  if (typeof power === 'string') return power;
  return `${power.toFixed(3)}kW`;
};

export const formatVoltage = (voltage) => {
  if (typeof voltage === 'string') return voltage;
  return `${voltage.toFixed(2)}V`;
};

export const formatCurrent = (current) => {
  if (typeof current === 'string') return current;
  return `${current.toFixed(2)}A`;
};

export const formatFrequency = (frequency) => {
  if (typeof frequency === 'string') return frequency;
  return `${frequency.toFixed(2)}Hz`;
};

export default api;
