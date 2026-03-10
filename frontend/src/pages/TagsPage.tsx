import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag as TagIcon, Plus, Edit2, Trash2, X, Save, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/toaster';
import { tagService, type Tag } from '@/services/tag.service';

interface TagNode extends Tag {
  expanded?: boolean;
  children?: TagNode[];
}

export default function TagsPage() {
  const navigate = useNavigate();
  const { toast, error: showError } = useToast();
  const [tags, setTags] = useState<TagNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#3b82f6');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [newTagParentId, setNewTagParentId] = useState<string | undefined>(undefined);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const colors = [
    '#3b82f6', '#ef4444', '#22c55e', '#eab308', '#f97316',
    '#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#84cc16'
  ];

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await tagService.getAll();
      setTags(buildTagTree(data));
    } catch (err: any) {
      showError(err.message || '加载标签失败');
    } finally {
      setLoading(false);
    }
  };

  const buildTagTree = (tags: Tag[]): TagNode[] => {
    const tagMap = new Map<string, TagNode>();
    const rootTags: TagNode[] = [];

    tags.forEach(tag => {
      tagMap.set(tag.id, { ...tag, expanded: true, children: [] });
    });

    tags.forEach(tag => {
      const node = tagMap.get(tag.id)!;
      if (tag.parentId && tagMap.has(tag.parentId)) {
        tagMap.get(tag.parentId)!.children?.push(node);
      } else {
        rootTags.push(node);
      }
    });

    return rootTags;
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      showError('标签名称不能为空');
      return;
    }

    try {
      await tagService.create(newTagName.trim(), newTagParentId, newTagColor);
      toast({ description: '标签创建成功' });
      setIsCreateDialogOpen(false);
      setNewTagName('');
      setNewTagColor('#3b82f6');
      setNewTagParentId(undefined);
      loadTags();
    } catch (err: any) {
      showError(err.message || '创建标签失败');
    }
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditColor(tag.color || '#3b82f6');
  };

  const handleSaveEdit = async () => {
    if (!editingTag || !editName.trim()) {
      showError('标签名称不能为空');
      return;
    }

    try {
      await tagService.update(editingTag.id, { name: editName.trim(), color: editColor });
      toast({ description: '标签更新成功' });
      setEditingTag(null);
      loadTags();
    } catch (err: any) {
      showError(err.message || '更新标签失败');
    }
  };

  const handleDeleteClick = (tag: Tag) => {
    setTagToDelete(tag);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tagToDelete) return;

    try {
      await tagService.delete(tagToDelete.id);
      toast({ description: '标签已删除' });
      setTagToDelete(null);
      setIsDeleteConfirmOpen(false);
      loadTags();
    } catch (err: any) {
      showError(err.message || '删除标签失败');
    }
  };

  const handleViewDocuments = (tagId: string) => {
    navigate(`/tags/${tagId}`);
  };

  const toggleExpand = (tagId: string) => {
    setTags(prev => prev.map(tag => {
      if (tag.id === tagId) {
        return { ...tag, expanded: !tag.expanded };
      }
      if (tag.children) {
        return { ...tag, children: toggleExpandRecursive(tag.children, tagId) };
      }
      return tag;
    }));
  };

  const toggleExpandRecursive = (children: TagNode[], tagId: string): TagNode[] => {
    return children.map(child => {
      if (child.id === tagId) {
        return { ...child, expanded: !child.expanded };
      }
      if (child.children) {
        return { ...child, children: toggleExpandRecursive(child.children, tagId) };
      }
      return child;
    });
  };

  const filteredTags = filterTags(tags, searchTerm);

  const filterTags = (tags: TagNode[], term: string): TagNode[] => {
    if (!term) return tags;

    const result: TagNode[] = [];
    tags.forEach(tag => {
      const matchesName = tag.name.toLowerCase().includes(term.toLowerCase());
      const filteredChildren = tag.children ? filterTags(tag.children, term) : [];

      if (matchesName || filteredChildren.length > 0) {
        result.push({ ...tag, expanded: true, children: filteredChildren });
      }
    });
    return result;
  };

  const renderTagNode = (tag: TagNode, depth: number = 0) => (
    <div key={tag.id}>
      <Card className={`group hover:shadow-md transition-shadow ${depth > 0 ? 'ml-6' : ''}`}
        style={{ borderLeft: `4px solid ${tag.color || '#3b82f6'}` }}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              {tag.children && tag.children.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleExpand(tag.id)}
                >
                  {tag.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
              <div className="flex items-center gap-2 flex-1">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tag.color || '#3b82f6' }}
                />
                {editingTag?.id === tag.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h3 className="font-semibold flex-1">{tag.name}</h3>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              {editingTag?.id === tag.id ? (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveEdit();
                    }}
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTag(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDocuments(tag.id);
                          }}
                        >
                          <FileText className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>查看文档</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTag(tag);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>编辑标签</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(tag);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>删除标签</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
            </div>
          </div>
          {tag._count?.documents !== undefined && (
            <div className="text-xs text-muted-foreground mt-2 ml-8">
              {tag._count.documents} 个文档
            </div>
          )}
        </CardContent>
      </Card>
      {tag.expanded && tag.children && tag.children.length > 0 && (
        <div className="mt-2">
          {tag.children.map(child => renderTagNode(child, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">标签管理</h1>
          <p className="text-muted-foreground">
            共 {tags.reduce((sum, tag) => sum + 1 + (tag.children?.length || 0), 0)} 个标签
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新建标签
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : filteredTags.length === 0 ? (
        <div className="text-center py-12">
          <TagIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? '没有找到匹配的标签' : '暂无标签，点击新建开始创建'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTags.map(tag => renderTagNode(tag))}
        </div>
      )}

      {/* 创建标签对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建标签</DialogTitle>
            <DialogDescription>
              创建新标签，可以选择父标签实现层级结构
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">标签名称</label>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="输入标签名称"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">标签颜色</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${newTagColor === color ? 'border-primary' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">父标签（可选）</label>
              <select
                value={newTagParentId || ''}
                onChange={(e) => setNewTagParentId(e.target.value || undefined)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">无（作为根标签）</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateTag}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除标签</DialogTitle>
            <DialogDescription>
              确定要删除标签 "{tagToDelete?.name}" 吗？此操作不可逆，该标签将从所有文档中移除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑标签颜色对话框 */}
      {editingTag && (
        <Dialog open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑标签颜色</DialogTitle>
              <DialogDescription>
                选择标签的颜色
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${editColor === color ? 'border-primary' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setEditColor(color)}
                />
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTag(null)}>
                取消
              </Button>
              <Button onClick={handleSaveEdit}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
