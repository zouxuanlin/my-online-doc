import apiClient from './api';

export interface Comment {
  id: string;
  content: string;
  documentId: string;
  userId: string;
  parentId: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
  };
  parent?: Comment | null;
  replies?: Comment[];
}

export interface CreateCommentInput {
  content: string;
  documentId: string;
  parentId?: string;
}

export interface UpdateCommentInput {
  content: string;
}

export const commentService = {
  // 获取文档评论列表
  async getComments(documentId: string) {
    const response = await apiClient.get(`/comments/documents/${documentId}`);
    return response.data.data;
  },

  // 创建评论
  async createComment(data: CreateCommentInput) {
    const response = await apiClient.post('/comments', data);
    return response.data.data.comment;
  },

  // 更新评论
  async updateComment(commentId: string, data: UpdateCommentInput) {
    const response = await apiClient.put(`/comments/${commentId}`, data);
    return response.data.data.comment;
  },

  // 删除评论
  async deleteComment(commentId: string) {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data;
  },
};
