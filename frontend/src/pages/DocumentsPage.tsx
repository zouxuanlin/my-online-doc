import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Trash2, RotateCcw, Eye, FileIcon, Tag, Edit2, Archive, Package, Filter, X, Download } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toaster';
import { documentService, Document as DocType } from '@/services/document.service';
import type { Tag as TagType } from '@/services/tag.service';
import { tagService } from '@/services/tag.service';
import { batchExportDocuments, ExportFormat } from '@/services/export.service';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  useEffect(() => {
    loadDocuments();
    loadTags();
  }, [showDeleted, showArchived, selectedTag, sortBy, sortOrder, startDate, endDate]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const result = await documentService.getList({
        onlyDeleted: showDeleted,
        onlyArchived: showArchived && !showDeleted,
        tagId: selectedTag,
        sortBy,
        sortOrder,
        startDate,
        endDate,
      });
      setDocuments(result.list || []);
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '加载文档失败',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const result = await tagService.getAll();
      setTags(result);
    } catch (err: any) {
      // ignore error
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
      toast({
        title: "错误",
        description: err.message || '创建文档失败',
        variant: "destructive"
      });
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
      toast({
        title: "错误",
        description: err.message || '操作失败',
        variant: "destructive"
      });
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
      toast({
        title: "错误",
        description: err.message || '恢复失败',
        variant: "destructive"
      });
    }
  };

  const handleArchiveDocument = async (id: string) => {
    try {
      await documentService.archive(id);
      toast({ description: '文档已归档' });
      loadDocuments();
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '归档失败',
        variant: "destructive"
      });
    }
  };

  const handleUnarchiveDocument = async (id: string) => {
    try {
      await documentService.unarchive(id);
      toast({ description: '已取消归档' });
      loadDocuments();
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '操作失败',
        variant: "destructive"
      });
    }
  };

  const clearFilters = () => {
    setSelectedTag(undefined);
    setSortBy('updatedAt');
    setSortOrder('desc');
    setStartDate(undefined);
    setEndDate(undefined);
    setShowFilters(false);
  };

  const hasActiveFilters = selectedTag || sortBy !== 'updatedAt' || startDate || endDate;

  const toggleSelectDocument = (id: string) => {
    setSelectedDocuments(prev =>
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  const handleBatchExport = async (format: ExportFormat) => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "提示",
        description: '请先选择要导出的文档',
        variant: "destructive"
      });
      return;
    }
    try {
      const docsToExport = documents.filter(doc => selectedDocuments.includes(doc.id));
      await batchExportDocuments(docsToExport, format);
      toast({ description: `已导出 ${docsToExport.length} 个文档` });
      setSelectedDocuments([]);
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '批量导出失败',
        variant: "destructive"
      });
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold mb-1">
              {showDeleted ? '回收站' : showArchived ? '已归档' : '我的文档'}
            </h1>
            <p className="text-sm text-muted-foreground">
              共 {documents.length} 个文档
            </p>
          </div>
          {selectedDocuments.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                已选择 {selectedDocuments.length} 个文档
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">批量导出</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBatchExport('markdown')}>
                    导出为 Markdown (ZIP)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBatchExport('pdf')}>
                    导出为 PDF (ZIP)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBatchExport('html')}>
                    导出为 HTML (ZIP)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBatchExport('word')}>
                    导出为 Word (ZIP)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDocuments([])}
              >
                取消
              </Button>
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={showArchived && !showDeleted ? 'default' : 'outline'}
            onClick={() => setShowArchived(!showArchived)}
            size="sm"
          >
            <Package className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">已归档</span>
          </Button>
          <Button
            variant={showDeleted ? 'default' : 'outline'}
            onClick={() => setShowDeleted(!showDeleted)}
            size="sm"
          >
            <Trash2 className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">{showDeleted ? '返回' : '回收站'}</span>
          </Button>
          {!showDeleted && !showArchived && (
            <Button onClick={handleCreateDocument} size="sm">
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">新建文档</span>
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索文档标题或内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            size="sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            筛选
            {hasActiveFilters && <span className="ml-1 w-2 h-2 rounded-full bg-primary" />}
          </Button>
        </div>

        {/* 高级筛选面板 */}
        {showFilters && (
          <Card className="p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">高级筛选</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                清除筛选
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* 标签筛选 */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">标签</label>
                <select
                  value={selectedTag || ''}
                  onChange={(e) => setSelectedTag(e.target.value || undefined)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">全部标签</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 排序字段 */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">排序字段</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="updatedAt">最后修改时间</option>
                  <option value="createdAt">创建时间</option>
                  <option value="title">标题</option>
                </select>
              </div>

              {/* 排序顺序 */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">排序顺序</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="desc">降序</option>
                  <option value="asc">升序</option>
                </select>
              </div>

              {/* 日期范围 */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">日期范围</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={startDate || ''}
                    onChange={(e) => setStartDate(e.target.value || undefined)}
                    className="text-sm"
                    placeholder="开始日期"
                  />
                  <Input
                    type="date"
                    value={endDate || ''}
                    onChange={(e) => setEndDate(e.target.value || undefined)}
                    className="text-sm"
                    placeholder="结束日期"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {!showDeleted && (
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedDocuments.length === filteredDocuments.length ? '取消全选' : '全选'}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            已选择 {selectedDocuments.length}/{filteredDocuments.length}
          </span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? '没有找到匹配的文档' : showDeleted ? '回收站为空' : showArchived ? '没有已归档的文档' : '暂无文档，点击新建开始创作'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Card
              key={doc.id}
              className="group hover:shadow-md transition-shadow cursor-pointer relative"
              onClick={() => navigate(`/documents/${doc.id}`)}
            >
              <div
                className="absolute top-3 left-3 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={selectedDocuments.includes(doc.id)}
                  onCheckedChange={() => toggleSelectDocument(doc.id)}
                />
              </div>
              <CardContent className="p-4 pt-10">
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
                    ) : showArchived ? (
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
                                  handleUnarchiveDocument(doc.id);
                                }}
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>取消归档</TooltipContent>
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
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleArchiveDocument(doc.id);
                                }}
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>归档文档</TooltipContent>
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
