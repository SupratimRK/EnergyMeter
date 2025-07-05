import { format, parseISO, isToday, isYesterday, subDays } from 'date-fns';

export const formatDate = (date, formatString = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'HH:mm:ss');
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

export const formatDateTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (isToday(dateObj)) {
      return `Today at ${format(dateObj, 'HH:mm')}`;
    }
    
    if (isYesterday(dateObj)) {
      return `Yesterday at ${format(dateObj, 'HH:mm')}`;
    }
    
    return format(dateObj, 'MMM dd at HH:mm');
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

export const getRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    return formatDate(dateObj);
  } catch (error) {
    console.error('Error getting relative time:', error);
    return '';
  }
};

export const formatCurrency = (amount, currency = '₹') => {
  if (amount === null || amount === undefined) return '';
  
  const numAmount = typeof amount === 'string' ? 
    parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
  
  if (isNaN(numAmount)) return '';
  
  return `${currency}${numAmount.toFixed(2)}`;
};

export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return '';
  
  const num = typeof number === 'string' ? 
    parseFloat(number.replace(/[^\d.-]/g, '')) : number;
  
  if (isNaN(num)) return '';
  
  return num.toFixed(decimals);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '';
  
  const num = typeof value === 'string' ? 
    parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  
  if (isNaN(num)) return '';
  
  return `${(num * 100).toFixed(decimals)}%`;
};

export const formatPowerValue = (value, unit = 'kW') => {
  if (value === null || value === undefined) return '';
  
  if (typeof value === 'string' && value.includes(unit)) {
    return value;
  }
  
  const num = typeof value === 'string' ? 
    parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  
  if (isNaN(num)) return '';
  
  return `${num.toFixed(3)}${unit}`;
};

export const formatElectricalValue = (value, unit) => {
  if (value === null || value === undefined) return '';
  
  if (typeof value === 'string' && value.includes(unit)) {
    return value;
  }
  
  const num = typeof value === 'string' ? 
    parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  
  if (isNaN(num)) return '';
  
  const decimals = unit === 'V' || unit === 'A' ? 2 : 3;
  return `${num.toFixed(decimals)}${unit}`;
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const parseNumericValue = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

export const getStatusColor = (status) => {
  const statusColors = {
    active: 'text-success-600 bg-success-100',
    connected: 'text-success-600 bg-success-100',
    online: 'text-success-600 bg-success-100',
    low_balance: 'text-warning-600 bg-warning-100',
    warning: 'text-warning-600 bg-warning-100',
    disconnected: 'text-danger-600 bg-danger-100',
    offline: 'text-gray-600 bg-gray-100',
    error: 'text-danger-600 bg-danger-100',
    maintenance: 'text-warning-600 bg-warning-100',
  };
  
  return statusColors[status] || 'text-gray-600 bg-gray-100';
};

export const getStatusText = (status) => {
  const statusTexts = {
    active: 'Active',
    connected: 'Connected',
    online: 'Online',
    low_balance: 'Low Balance',
    warning: 'Warning',
    disconnected: 'Disconnected',
    offline: 'Offline',
    error: 'Error',
    maintenance: 'Maintenance',
  };
  
  return statusTexts[status] || status;
};

export const generateChartData = (historicalData, field = 'active_power') => {
  if (!historicalData || !Array.isArray(historicalData)) return [];
  
  return historicalData.map(item => ({
    time: format(parseISO(item.timestamp), 'HH:mm'),
    value: parseNumericValue(item[field]),
    timestamp: item.timestamp,
    ...item
  }));
};

export const calculateAverage = (data, field) => {
  if (!data || !Array.isArray(data) || data.length === 0) return 0;
  
  const sum = data.reduce((acc, item) => acc + parseNumericValue(item[field]), 0);
  return sum / data.length;
};

export const calculateTotal = (data, field) => {
  if (!data || !Array.isArray(data) || data.length === 0) return 0;
  
  return data.reduce((acc, item) => acc + parseNumericValue(item[field]), 0);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
