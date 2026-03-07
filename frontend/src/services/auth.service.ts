import apiClient from './api';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export const authService = {
  // 登录
  async login(data: LoginInput) {
    const response = await apiClient.post('/auth/login', data);
    return response.data.data;
  },

  // 注册
  async register(data: RegisterInput) {
    const response = await apiClient.post('/auth/register', data);
    return response.data.data;
  },

  // 刷新 token
  async refresh(refreshToken: string) {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data.data.tokens;
  },

  // 登出
  async logout(refreshToken: string) {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  // 获取当前用户
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data.data.user;
  },
};
