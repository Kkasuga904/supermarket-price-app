import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiService = {
  // スーパーマーケット関連
  getSupermarkets: () => api.get('/supermarkets/'),
  getSupermarketById: (id) => api.get(`/supermarkets/${id}`),
  getSupermarketsNearby: (latitude, longitude, radius = 5) => 
    api.get(`/supermarkets-nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`),
  
  // 商品関連
  getProducts: (params) => api.get('/products/', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  searchProducts: (query) => api.get(`/products/search?q=${encodeURIComponent(query)}`),
  
  // 価格関連
  getPrices: (params) => api.get('/prices/', { params }),
  comparePrices: (productId) => api.get(`/prices/compare/${productId}`),
};

export default apiService;