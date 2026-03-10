import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Search, Trash2, Edit2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toaster';
import { templateService, type Template } from '@/services/template.service';

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    category: '',
    isPublic: false,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const result = await templateService.getList({ pageSize: 50 });
      setTemplates(result.list || []);
    } catch (err: any) {
      toast({
        title: '错误',
        description: err.message || '加载模板失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      content: '',
      description: '',
      category: '',
      isPublic: false,
    });
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (template: Template) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.title,
      content: template.content || '',
      description: template.description || '',
      category: template.category || '',
      isPublic: template.isPublic,
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.title.trim()) {
        toast({ title: '错误', description: '模板标题不能为空', variant: 'destructive' });
        return;
      }

      if (selectedTemplate) {
        await templateService.update(selectedTemplate.id, formData);
        toast({ description: '模板已更新' });
      } else {
        await templateService.create(formData);
        toast({ description: '模板已创建' });
      }

      setCreateDialogOpen(false);
      setEditDialogOpen(false);
      loadTemplates();
    } catch (err: any) {
      toast({
        title: '错误',
        description: err.message || '保存失败',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await templateService.delete(id);
      toast({ description: '模板已删除' });
      loadTemplates();
    } catch (err: any) {
      toast({
        title: '错误',
        description: err.message || '删除失败',
        variant: 'destructive',
      });
    }
  };

  const handleUseTemplate = (template: Template) => {
    // 使用模板创建新文档
    navigate(`/documents/new`, {
      state: {
        title: template.title,
        content: template.content,
      },
    });
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">模板管理</h1>
          <p className="text-muted-foreground">共 {templates.length} 个模板</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          新建模板
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索模板..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? '没有找到匹配的模板' : '暂无模板，创建一个吧'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold truncate flex-1">{template.title}</h3>
                  </div>
                  {template.isPublic && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      公开
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2 min-h-[2.5rem]">
                  {template.description || template.content?.slice(0, 50) || '无描述'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {template.category && (
                      <span className="flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" />
                        {template.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUseTemplate(template)}
                    >
                      使用
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenEdit(template)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 创建/编辑模板对话框 */}
      <Dialog open={createDialogOpen || editDialogOpen} onOpenChange={(open) => {
        setCreateDialogOpen(open);
        setEditDialogOpen(open);
        if (!open) setSelectedTemplate(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? '编辑模板' : '创建模板'}</DialogTitle>
            <DialogDescription>
              {selectedTemplate ? '修改模板信息' : '创建一个新的文档模板'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">模板标题</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="输入模板标题"
              />
            </div>

            <div>
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="模板描述（可选）"
              />
            </div>

            <div>
              <Label htmlFor="category">分类</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="模板分类（可选）"
              />
            </div>

            <div>
              <Label htmlFor="content">模板内容</Label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="输入模板内容（支持 Markdown）"
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isPublic">公开模板（其他用户可见）</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
              setSelectedTemplate(null);
            }}>
              取消
            </Button>
            <Button onClick={handleSave}>
              {selectedTemplate ? '保存' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
