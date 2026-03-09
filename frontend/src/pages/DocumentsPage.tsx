import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Trash2, RotateCcw, Eye, FileIcon, Tag, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/authStore';
import { documentService, Document as DocType } from '@/services/document.service';
import { useToast } from '@/components/ui/toaster';
import type { Tag as TagType } from '@/services/tag.service';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast, error: showError } = useToast();
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [showDeleted]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const result = await documentService.getList({
        includeDeleted: showDeleted,
      });
      setDocuments(result.list || []);
    } catch (err: any) {
      showError(err.message || '加载文档失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const doc = await documentService.create({
        title: '新文档',
        content: '',
      });
      navigate(`/documents/${doc.id}/edit`);
    } catch (err: any) {
      showError(err.message || '创建文档失败');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      if (showDeleted) {
        await documentService.permanentlyDelete(id);
        toast({ description: '文档已永久删除' });
      } else {
        await documentService.delete(id);
        toast({ description: '文档已移动到回收站' });
      }
      setDeleteConfirmOpen(false);
      loadDocuments();
    } catch (err: any) {
      showError(err.message || '操作失败');
    }
  };

  const handleDeleteClick = (id: string) => {
    setDocumentToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete) {
      handleDeleteDocument(documentToDelete);
    }
  };

  const handleRestoreDocument = async (id: string) => {
    try {
      await documentService.restore(id);
      toast({ description: '文档已恢复' });
      loadDocuments();
    } catch (err: any) {
      showError(err.message || '恢复失败');
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            {showDeleted ? '回收站' : '我的文档'}
          </h1>
          <p className="text-muted-foreground">
            共 {documents.length} 个文档
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showDeleted ? 'default' : 'outline'}
            onClick={() => setShowDeleted(!showDeleted)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {showDeleted ? '返回文档列表' : '回收站'}
          </Button>
          {!showDeleted && (
            <Button onClick={handleCreateDocument}>
              <Plus className="h-4 w-4 mr-2" />
              新建文档
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索文档..."
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
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? '没有找到匹配的文档' : showDeleted ? '回收站为空' : '暂无文档，点击新建开始创作'}
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
                    <FileIcon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold truncate flex-1">{doc.title}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {showDeleted ? (
                      <>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreDocument(doc.id);
                                }}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>恢复文档</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(doc.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>永久删除</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    ) : (
                      <>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/documents/${doc.id}/edit`);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>编辑文档</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(doc.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>删除文档</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {doc.content || '无内容'}
                </p>
                {/* 标签显示 */}
                {(doc as any).tags && (doc as any).tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {((doc as any).tags || []).slice(0, 3).map((t: any) => (
                      <span
                        key={t.tag.id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {t.tag.name}
                      </span>
                    ))}
                    {((doc as any).tags || []).length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{((doc as any).tags || []).length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {new Date(doc.updatedAt).toLocaleDateString('zh-CN')}
                  </span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{doc._count?.versions || 0} 个版本</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除文档</DialogTitle>
            <DialogDescription>
              {showDeleted
                ? '确定要永久删除此文档吗？此操作不可逆，文档将被彻底删除。'
                : '确定要删除此文档吗？文档将被移动到回收站。'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
