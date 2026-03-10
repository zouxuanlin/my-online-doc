import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toaster';
import { documentService } from '@/services/document.service';
import type { Document } from '@/services/document.service';

export default function PublicDocumentPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { error: showError } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
  }, [slug]);

  const loadDocument = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const doc = await documentService.getBySlug(slug);
      setDocument(doc);
    } catch (err: any) {
      showError(err.message || '加载文档失败');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">文档不存在或未被发布</p>
          <Button className="mt-4" onClick={() => navigate('/documents')}>
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b px-6 py-4 bg-card">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/documents')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <h1 className="text-xl font-semibold">{document.title}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>最后修改：{new Date(document.updatedAt).toLocaleString('zh-CN')}</span>
          </div>
        </div>
      </div>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-base">
            {document.content || '无内容'}
          </pre>
        </div>
      </div>
    </div>
  );
}
