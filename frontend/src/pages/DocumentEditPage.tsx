import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toaster';
import { documentService } from '@/services/document.service';
import { tagService } from '@/services/tag.service';
import { TagSelector } from '@/components/TagSelector';
import LinkDocument from '@/components/LinkDocument';
import LinkHelp from '@/components/LinkHelp';
import type { Tag } from '@/services/tag.service';
import MDEditor from '@uiw/react-md-editor';
import { useThemeStore } from '@/stores/themeStore';
import RichTextEditor from '@/components/RichTextEditor';

export default function DocumentEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme } = useThemeStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(false);
  const [useRichText, setUseRichText] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInsertLink = (linkText: string) => {
    setContent((prev) => prev + (prev ? '\n' : '') + linkText);
  };

  useEffect(() => {
    if (id === 'new') {
      // 检查是否从模板创建
      const templateData = location.state as any;
      if (templateData?.title || templateData?.content) {
        setTitle(templateData.title || '新文档');
        setContent(templateData.content || '');
      } else {
        setTitle('新文档');
        setContent('');
      }
      setLoading(false);
    } else {
      loadDocument();
    }
  }, [id, location.state]);

  // 监听内容变化，标记是否有未保存的更改
  useEffect(() => {
    if (!loading) {
      setHasChanges(true);
    }
  }, [title, content, selectedTags, loading]);

  const loadDocument = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const doc = await documentService.getById(id);
      const tags = await tagService.getDocumentTags(id);
      setTitle(doc.title);
      setContent(doc.content || '');
      setSelectedTags(tags.map((t: Tag) => t.id));
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

  const handleSave = async () => {
    try {
      setSaving(true);
      if (id === 'new') {
        await documentService.create({ title, content, tagIds: selectedTags });
        toast({ description: '文档创建成功' });
        navigate('/documents');
      } else if (id) {
        await documentService.update(id, { title, content });
        await tagService.updateDocumentTags(id, selectedTags);
        toast({ description: '文档保存成功' });
        navigate('/documents');
      }
    } catch (err: any) {
      toast({
        title: "错误",
        description: err.message || '保存失败',
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      // 有未保存的更改，确认后返回
      if (confirm('有未保存的更改，确定要放弃吗？')) {
        navigate('/documents');
      }
    } else {
      navigate('/documents');
    }
  };

  const handleTagsChange = (tagIds: string[]) => {
    setSelectedTags(tagIds);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 px-0 h-auto w-64"
              placeholder="文档标题"
            />
          </div>
          <div className="flex items-center gap-2">
            <TagSelector documentId={id !== 'new' ? id : undefined} value={selectedTags} onChange={handleTagsChange} />
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="h-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {useRichText ? '富文本编辑模式' : 'Markdown 编辑模式'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LinkDocument onLinkInsert={handleInsertLink} currentDocumentId={id !== 'new' ? id : undefined} />
              <LinkHelp />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseRichText(!useRichText)}
              >
                {useRichText ? '切换到 Markdown' : '切换到富文本'}
              </Button>
              {!useRichText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreview(!preview)}
                >
                  {preview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {preview ? '编辑' : '预览'}
                </Button>
              )}
            </div>
          </div>
          {useRichText ? (
            <RichTextEditor
              content={content}
              onChange={setContent}
              editable={!preview}
            />
          ) : (
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || '')}
              preview={preview ? 'preview' : 'edit'}
              height="100%"
              enableScroll={true}
              data-color-mode={theme}
            />
          )}
        </div>
      </div>
    </div>
  );
}
