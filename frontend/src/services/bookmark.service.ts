import apiClient from './api';

export interface Document {
  id: string;
  title: string;
  content: string | null;
  ownerId: string;
  folderId: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const bookmarkService = {
  // 获取收藏列表
  async getList() {
    const response = await apiClient.get('/bookmarks');
    return response.data.data.documents;
  },

  // 添加收藏
  async add(documentId: string) {
    const response = await apiClient.post('/bookmarks', { documentId });
    return response.data;
  },

  // 移除收藏
  async remove(documentId: string) {
    const response = await apiClient.delete(`/bookmarks/${documentId}`);
    return response.data;
  },

  // 检查收藏状态
  async checkStatus(documentId: string) {
    const response = await apiClient.get(`/bookmarks/check/${documentId}`);
    return response.data.data.isBookmarked;
  },
};
