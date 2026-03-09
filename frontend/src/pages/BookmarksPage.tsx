import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toaster';
import { bookmarkService } from '@/services/bookmark.service';
import type { Document } from '@/services/bookmark.service';

export default function BookmarksPage() {
  const navigate = useNavigate();
  const { toast, error: showError } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const result = await bookmarkService.getList();
      setDocuments(result || []);
    } catch (err: any) {
      showError(err.message || '加载收藏失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (id: string) => {
    try {
      await bookmarkService.remove(id);
      toast({ description: '已取消收藏' });
      loadBookmarks();
    } catch (err: any) {
      showError(err.message || '操作失败');
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">我的收藏</h1>
          <p className="text-muted-foreground">共 {documents.length} 个收藏</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/documents')}>
          <FileText className="h-4 w-4 mr-2" />
          浏览文档
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索收藏..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? '没有找到匹配的收藏' : '暂无收藏，去文档列表添加收藏吧'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="group hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/documents/${doc.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <h3 className="font-semibold truncate flex-1">{doc.title}</h3>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBookmark(doc.id);
                    }}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {doc.content || '无内容'}
                </p>
                <div className="text-xs text-muted-foreground">
                  {new Date(doc.updatedAt).toLocaleDateString('zh-CN')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
