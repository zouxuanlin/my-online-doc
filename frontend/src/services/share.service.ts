import apiClient from './api';

export interface Share {
  id: string;
  documentId: string;
  sharedById: string;
  sharedWithEmail: string;
  permission: string;
  password: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  document?: {
    id: string;
    title: string;
  };
  sharedBy?: {
    id: string;
    email: string;
    name: string | null;
  };
  sharedWith?: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface CreateShareInput {
  documentId: string;
  sharedWithEmail: string;
  permission?: string;
  password?: string;
  expiresAt?: string;
}

export interface UpdateShareInput {
  permission?: string;
  password?: string;
  expiresAt?: string;
}

export const shareService = {
  // 创建分享
  async create(data: CreateShareInput) {
    const response = await apiClient.post('/shares', data);
    return response.data.data.share;
  },

  // 获取文档的分享列表
  async getDocumentShares(documentId: string) {
    const response = await apiClient.get(`/shares/document/${documentId}`);
    return response.data.data.shares;
  },

  // 获取用户收到的分享
  async getReceivedShares() {
    const response = await apiClient.get('/shares/received');
    return response.data.data.shares;
  },

  // 更新分享
  async update(shareId: string, data: UpdateShareInput) {
    const response = await apiClient.put(`/shares/${shareId}`, data);
    return response.data.data.share;
  },

  // 删除分享
  async delete(shareId: string) {
    const response = await apiClient.delete(`/shares/${shareId}`);
    return response.data;
  },

  // 验证分享访问
  async verifyAccess(documentId: string, password?: string) {
    const response = await apiClient.post(`/shares/${documentId}/verify`, { password });
    return response.data.data;
  },
};
