import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Clock, Star, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/toaster';
import { useRecentStore } from '@/stores/recentStore';
import { bookmarkService } from '@/services/bookmark.service';
import { documentService } from '@/services/document.service';
import { exportDocument } from '@/services/export.service';
import type { Document } from '@/services/document.service';

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { addRecent } = useRecentStore();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);

  useEffect(() => {
    loadDocument();
  }, [id]);

  useEffect(() => {
    // 加载成功后记录最近浏览
    if (document) {
      addRecent({ id: document.id, title: document.title });
      checkBookmarkStatus();
      loadRelatedDocuments();
    }
  }, [document]);

  const checkBookmarkStatus = async () => {
    if (!id) return;
    try {
      const status = await bookmarkService.checkStatus(id);
      setIsBookmarked(status);
    } catch (err: any) {
      // ignore error
    }
  };

  const handleToggleBookmark = async () => {
    if (!id) return;
    try {
      if (isBookmarked) {
        await bookmarkService.remove(id);
        setIsBookmarked(false);
        success('已取消收藏');
      } else {
        await bookmarkService.add(id);
        setIsBookmarked(true);
        success('已添加收藏');
      }
    } catch (err: any) {
      showError(err.message || '操作失败');
    }
  };

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

  const handleExport = async (format: 'markdown' | 'pdf' | 'html' | 'word') => {
    if (!document) return;
    try {
      await exportDocument(document, format);
      success(`已导出为 ${format.toUpperCase()} 格式`);
    } catch (err: any) {
      showError(err.message || '导出失败');
    }
  };

  const loadRelatedDocuments = async () => {
    if (!id) return;
    try {
      const related = await documentService.getRelated(id, 5);
      setRelatedDocuments(related);
    } catch (err: any) {
      // ignore error
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('markdown')}>
                  导出为 Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  导出为 PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('html')}>
                  导出为 HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('word')}>
                  导出为 Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant={isBookmarked ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggleBookmark}
            >
              <Star className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-white' : ''}`} />
              {isBookmarked ? '已收藏' : '收藏'}
            </Button>
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

      {/* 相关文档推荐 */}
      {relatedDocuments.length > 0 && (
        <div className="border-t p-6">
          <h2 className="text-lg font-semibold mb-4">相关文档</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm truncate">{doc.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {doc.content?.slice(0, 50) || '无内容'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(doc.updatedAt).toLocaleDateString('zh-CN')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
