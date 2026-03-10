import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Clock, Star, Download, FileText, Globe, Link, Share, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toaster';
import { useRecentStore } from '@/stores/recentStore';
import { bookmarkService } from '@/services/bookmark.service';
import { documentService } from '@/services/document.service';
import { exportDocument } from '@/services/export.service';
import ShareDialog from '@/components/ShareDialog';
import VersionDiffViewer from '@/components/VersionDiffViewer';
import Backlinks from '@/components/Backlinks';
import CommentSection from '@/components/CommentSection';
import MarkdownPreview from '@/components/MarkdownPreview';
import type { Document } from '@/services/document.service';

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addRecent } = useRecentStore();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [relatedDocuments, setRelatedDocuments] = useState<Document[]>([]);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<[any, any] | null>(null);
  const [diffViewerOpen, setDiffViewerOpen] = useState(false);

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

  const loadVersions = async () => {
    if (!id) return;
    try {
      const versionList = await documentService.getVersions(id);
      setVersions(versionList);
    } catch (err: any) {
      // ignore error
    }
  };

  const handleOpenVersionHistory = () => {
    loadVersions();
    setVersionHistoryOpen(true);
  };

  const handleCompareVersions = () => {
    if (selectedVersions && selectedVersions[0] && selectedVersions[1]) {
      setDiffViewerOpen(true);
    }
  };

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
        toast({ description: '已取消收藏' });
      } else {
        await bookmarkService.add(id);
        setIsBookmarked(true);
        toast({ description: '已添加收藏' });
      }
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '操作失败',
        variant: "destructive"
      });
    }
  };

  const loadDocument = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const doc = await documentService.getById(id);
      setDocument(doc);
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '加载文档失败',
        variant: "destructive"
      });
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
      toast({ description: `已导出为 ${format.toUpperCase()} 格式` });
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '导出失败',
        variant: "destructive"
      });
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

  const handlePublish = async () => {
    if (!id) return;
    try {
      await documentService.publish(id, customSlug || undefined);
      toast({ description: '文档已发布，可通过公开链接访问' });
      setPublishDialogOpen(false);
      loadDocument();
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '发布失败',
        variant: "destructive"
      });
    }
  };

  const handleUnpublish = async () => {
    if (!id) return;
    try {
      await documentService.unpublish(id);
      toast({ description: '已取消发布' });
      loadDocument();
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '操作失败',
        variant: "destructive"
      });
    }
  };

  const copyPublicLink = () => {
    if (!document?.publicSlug) return;
    const url = `${window.location.origin}/documents/public/${document.publicSlug}`;
    navigator.clipboard.writeText(url);
    toast({ description: '链接已复制到剪贴板' });
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
            {document?.isPublic ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPublicLink}
                >
                  <Link className="h-4 w-4 mr-2" />
                  复制链接
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleUnpublish}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  取消发布
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => setPublishDialogOpen(true)}
              >
                <Globe className="h-4 w-4 mr-2" />
                发布
              </Button>
            )}
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
            <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
              <Share className="h-4 w-4 mr-2" />
              分享
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenVersionHistory}>
              <History className="h-4 w-4 mr-2" />
              历史版本
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="prose max-w-none">
          <MarkdownPreview content={document.content || ''} />
        </div>
      </div>

      {/* 双向链接 */}
      <div className="border-t p-6">
        <Backlinks documentId={id!} />
      </div>

      {/* 评论区 */}
      <CommentSection documentId={id!} />

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

      {/* 发布对话框 */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发布文档</DialogTitle>
            <DialogDescription>
              发布后文档可通过公开链接访问，任何人无需登录即可查看
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                自定义链接后缀（可选）
              </label>
              <Input
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                placeholder="留空将自动生成"
              />
              <p className="text-xs text-muted-foreground mt-1">
                如不填写，系统将自动生成随机链接
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handlePublish}>
              发布
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 分享对话框 */}
      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        documentId={id!}
        documentTitle={document.title}
      />

      {/* 版本历史对话框 */}
      <Dialog open={versionHistoryOpen} onOpenChange={setVersionHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>版本历史</DialogTitle>
            <DialogDescription>
              选择两个版本进行对比
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {versions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">暂无版本历史</p>
            ) : (
              <div className="space-y-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedVersions?.[0]?.id === version.id || selectedVersions?.[1]?.id === version.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      if (selectedVersions?.[0]?.id === version.id) {
                        setSelectedVersions([null, selectedVersions?.[1] ?? null] as [any, any]);
                      } else if (selectedVersions?.[1]?.id === version.id) {
                        setSelectedVersions([selectedVersions?.[0] ?? null, null] as [any, any]);
                      } else if (!selectedVersions || selectedVersions.length < 2) {
                        const newSelection = selectedVersions
                          ? [...selectedVersions, version]
                          : [version];
                        setSelectedVersions(newSelection as [any, any]);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                        selectedVersions?.[0]?.id === version.id || selectedVersions?.[1]?.id === version.id
                          ? 'border-primary bg-primary text-white'
                          : 'border-muted-foreground'
                      }`}>
                        {(selectedVersions?.[0]?.id === version.id || selectedVersions?.[1]?.id === version.id) && (
                          <span className="text-xs">✓</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">版本 {version.version}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(version.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // 回滚到该版本的逻辑可以在这里添加
                      }}
                    >
                      回滚
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVersionHistoryOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleCompareVersions}
              disabled={!selectedVersions || selectedVersions.length !== 2}
            >
              对比所选版本
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 版本对比查看器 */}
      <VersionDiffViewer
        open={diffViewerOpen}
        onOpenChange={setDiffViewerOpen}
        oldContent={selectedVersions?.[0]?.content || ''}
        newContent={selectedVersions?.[1]?.content || ''}
        oldVersion={`v${selectedVersions?.[0]?.version}`}
        newVersion={`v${selectedVersions?.[1]?.version}`}
      />
    </div>
  );
}
