import apiClient from './api';

export interface Template {
  id: string;
  title: string;
  content: string | null;
  description: string | null;
  category: string | null;
  isPublic: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateInput {
  title: string;
  content?: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
}

export const templateService = {
  // 获取模板列表
  async getList(params?: {
    search?: string;
    category?: string;
    onlyPublic?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const response = await apiClient.get('/templates', { params });
    return response.data.data;
  },

  // 获取模板详情
  async getById(id: string) {
    const response = await apiClient.get(`/templates/${id}`);
    return response.data.data.template;
  },

  // 创建模板
  async create(data: CreateTemplateInput) {
    const response = await apiClient.post('/templates', data);
    return response.data.data.template;
  },

  // 更新模板
  async update(id: string, data: Partial<CreateTemplateInput>) {
    const response = await apiClient.put(`/templates/${id}`, data);
    return response.data.data.template;
  },

  // 删除模板
  async delete(id: string) {
    const response = await apiClient.delete(`/templates/${id}`);
    return response.data;
  },

  // 获取所有分类
  async getCategories() {
    const response = await apiClient.get('/templates/categories');
    return response.data.data.categories;
  },
};
