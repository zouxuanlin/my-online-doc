import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 错误 - Token 过期，跳转到登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }

    // 503/500 错误 - 服务器不可用，显示错误提示
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
      const networkError = new Error('无法连接到服务器，请检查后端服务是否正常运行');
      networkError.name = 'NetworkError';
      return Promise.reject(networkError);
    }

    // 传递后端返回的错误信息
    if (error.response?.data?.message) {
      const apiError = new Error(error.response.data.message);
      apiError.name = error.response.data.code || 'API_ERROR';
      return Promise.reject(apiError);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
