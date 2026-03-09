import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toaster';
import { documentService } from '@/services/document.service';
import type { Document } from '@/services/document.service';

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const doc = await documentService.getById(id);
      setDocument(doc);
    } catch (err: any) {
      showError(err.message || '加载文档失败');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/documents/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/documents')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <h1 className="text-xl font-semibold">{document.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>最后修改：{new Date(document.updatedAt).toLocaleString('zh-CN')}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              编辑
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-base">
            {document.content || '无内容'}
          </pre>
        </div>
      </div>
    </div>
  );
}
