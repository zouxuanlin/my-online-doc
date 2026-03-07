import apiClient from './api';

export interface Folder {
  id: string;
  name: string;
  ownerId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
  };
  parent?: {
    id: string;
    name: string;
  } | null;
  children?: Folder[];
}

export interface CreateFolderInput {
  name: string;
  parentId?: string;
}

export const folderService = {
  // 创建文件夹
  async create(data: CreateFolderInput) {
    const response = await apiClient.post('/folders', data);
    return response.data.data.folder;
  },

  // 获取所有文件夹
  async getAll() {
    const response = await apiClient.get('/folders');
    return response.data.data.folders;
  },

  // 获取文件夹详情
  async getById(id: string) {
    const response = await apiClient.get(`/folders/${id}`);
    return response.data.data.folder;
  },

  // 更新文件夹
  async update(id: string, data: { name?: string; parentId?: string | null }) {
    const response = await apiClient.put(`/folders/${id}`, data);
    return response.data.data.folder;
  },

  // 删除文件夹
  async delete(id: string) {
    const response = await apiClient.delete(`/folders/${id}`);
    return response.data;
  },
};
