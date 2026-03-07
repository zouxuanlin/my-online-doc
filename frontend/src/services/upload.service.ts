import apiClient from './api';

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  mimetype: string;
  createdAt: string;
}

export const uploadService = {
  // 上传文件
  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.file;
  },

  // 获取文件列表
  async getFiles() {
    const response = await apiClient.get('/upload');
    return response.data.data.files;
  },

  // 删除文件
  async delete(filename: string) {
    const response = await apiClient.delete(`/upload/${filename}`);
    return response.data;
  },
};
