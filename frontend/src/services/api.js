import axios from 'axios';
import { Platform } from 'react-native';

// Expo開発環境での適切なAPI URL設定
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Expo Goを使用している場合、開発マシンのIPアドレスを使用
    // 注意：以下のIPアドレスは実際の開発マシンのIPアドレスに変更する必要があります
    const developmentIP = '192.168.200.38'; // 実際の開発マシンIPアドレス
    
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      // 実機・Expo Go用（開発マシンのIPアドレス）
      return `http://${developmentIP}:8001`;
    } else {
      // Web用（開発環境のIPアドレスも使用可能）
      return `http://${developmentIP}:8001`;
    }
  } else {
    // 本番環境
    return 'https://your-production-api.com';
  }
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // タイムアウトを30秒に延長
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// スーパーマーケット関連API
export const supermarketAPI = {
  getAll: () => api.get('/supermarkets/'),
  getById: (id) => api.get(`/supermarkets/${id}`),
  create: (data) => api.post('/supermarkets/', data),
  getNearby: (latitude, longitude, radius = 5.0) => 
    api.get(`/supermarkets-nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`),
};

// 商品関連API
export const productAPI = {
  getAll: (params = {}) => api.get('/products/', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products/', data),
  search: (query) => api.get(`/products/search?q=${encodeURIComponent(query)}`),
};

// 価格関連API
export const priceAPI = {
  getAll: (params = {}) => api.get('/prices/', { params }),
  create: (data) => api.post('/prices/', data),
  compare: (productId) => api.get(`/prices/compare/${productId}`),
};

export default api;