import apiClient from './api';

export interface Tag {
  id: string;
  name: string;
  ownerId: string;
  parentId?: string | null;
  color?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
  };
  children?: Tag[];
}

export const tagService = {
  // 创建标签
  async create(name: string, parentId?: string, color?: string) {
    const response = await apiClient.post('/tags', { name, parentId, color });
    return response.data.data.tag;
  },

  // 获取所有标签
  async getAll(flat?: boolean) {
    const response = await apiClient.get('/tags', { params: { flat } });
    return response.data.data.tags;
  },

  // 更新标签
  async update(id: string, data: { name?: string; color?: string; parentId?: string | null }) {
    const response = await apiClient.put(`/tags/${id}`, data);
    return response.data.data.tag;
  },

  // 删除标签
  async delete(id: string) {
    const response = await apiClient.delete(`/tags/${id}`);
    return response.data;
  },

  // 获取文档的标签
  async getDocumentTags(documentId: string) {
    const response = await apiClient.get(`/tags/document/${documentId}`);
    return response.data.data.tags;
  },

  // 为文档添加标签
  async addTagToDocument(documentId: string, tagId: string) {
    const response = await apiClient.post('/tags/document/add', {
      documentId,
      tagId,
    });
    return response.data;
  },

  // 从文档移除标签
  async removeTagFromDocument(documentId: string, tagId: string) {
    const response = await apiClient.post('/tags/document/remove', {
      documentId,
      tagId,
    });
    return response.data;
  },

  // 更新文档的所有标签
  async updateDocumentTags(documentId: string, tagIds: string[]) {
    const response = await apiClient.put(`/tags/document/${documentId}/tags`, {
      tagIds,
    });
    return response.data;
  },

  // 按标签获取文档
  async getDocumentsByTag(tagId: string) {
    const response = await apiClient.get(`/tags/tag/${tagId}/documents`);
    return response.data.data.documents;
  },
};
