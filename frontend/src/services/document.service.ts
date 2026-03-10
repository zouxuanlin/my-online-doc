import apiClient from './api';

export interface Document {
  id: string;
  title: string;
  content: string | null;
  ownerId: string;
  folderId: string | null;
  isDeleted: boolean;
  isArchived: boolean;
  isPublic: boolean;
  publicSlug?: string | null;
  publishedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    versions: number;
  };
}

export interface CreateDocumentInput {
  title?: string;
  content?: string;
  folderId?: string;
  tagIds?: string[];
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
  folderId?: string | null;
}

export const documentService = {
  // 创建文档
  async create(data: CreateDocumentInput) {
    const response = await apiClient.post('/documents', data);
    return response.data.data.document;
  },

  // 获取文档列表
  async getList(params?: {
    folderId?: string | null;
    search?: string;
    page?: number;
    pageSize?: number;
    onlyDeleted?: boolean;
    onlyArchived?: boolean;
    tagId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  }) {
    const response = await apiClient.get('/documents', { params });
    return response.data.data;
  },

  // 获取文档详情
  async getById(id: string) {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data.data.document;
  },

  // 更新文档
  async update(id: string, data: UpdateDocumentInput) {
    const response = await apiClient.put(`/documents/${id}`, data);
    return response.data.data.document;
  },

  // 删除文档（软删除）
  async delete(id: string) {
    const response = await apiClient.delete(`/documents/${id}`);
    return response.data;
  },

  // 永久删除文档
  async permanentlyDelete(id: string) {
    const response = await apiClient.delete(`/documents/${id}/permanent`);
    return response.data;
  },

  // 恢复文档
  async restore(id: string) {
    const response = await apiClient.post(`/documents/${id}/restore`);
    return response.data.data.document;
  },

  // 获取版本历史
  async getVersions(id: string) {
    const response = await apiClient.get(`/documents/${id}/versions`);
    return response.data.data.versions;
  },

  // 回滚到指定版本
  async rollback(id: string, versionId: string) {
    const response = await apiClient.post(`/documents/${id}/versions/${versionId}/rollback`);
    return response.data.data.document;
  },

  // 归档文档
  async archive(id: string) {
    const response = await apiClient.post(`/documents/${id}/archive`);
    return response.data.data.document;
  },

  // 取消归档
  async unarchive(id: string) {
    const response = await apiClient.post(`/documents/${id}/unarchive`);
    return response.data.data.document;
  },

  // 获取相关文档
  async getRelated(id: string, limit?: number) {
    const response = await apiClient.get(`/documents/${id}/related`, { params: { limit } });
    return response.data.data.documents;
  },

  // 发布文档
  async publish(id: string, slug?: string) {
    const response = await apiClient.post(`/documents/${id}/publish`, { slug });
    return response.data.data.document;
  },

  // 取消发布文档
  async unpublish(id: string) {
    const response = await apiClient.post(`/documents/${id}/unpublish`);
    return response.data.data.document;
  },

  // 获取已发布文档列表
  async getPublishedList() {
    const response = await apiClient.get('/documents/published/list');
    return response.data.data.documents;
  },

  // 通过 slug 获取公开文档
  async getBySlug(slug: string) {
    const response = await apiClient.get(`/documents/public/${slug}`);
    return response.data.data.document;
  },
};
