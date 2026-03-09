import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toaster';
import { documentService } from '@/services/document.service';
import { tagService } from '@/services/tag.service';
import { TagSelector } from '@/components/TagSelector';
import type { Document } from '@/services/document.service';
import type { Tag } from '@/services/tag.service';

export default function DocumentEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id === 'new') {
      // 新建文档
      setTitle('新文档');
      setContent('');
      setLoading(false);
    } else {
      loadDocument();
    }
  }, [id]);

  const loadDocument = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const doc = await documentService.getById(id);
      const tags = await tagService.getDocumentTags(id);
      setDocument(doc);
      setTitle(doc.title);
      setContent(doc.content || '');
      setSelectedTags(tags.map((t: Tag) => t.id));
    } catch (err: any) {
      showError(err.message || '加载文档失败');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (id === 'new') {
        const doc = await documentService.create({ title, content, tagIds: selectedTags });
        success('文档创建成功');
        navigate(`/documents/${doc.id}`);
      } else if (id) {
        await documentService.update(id, { title, content });
        await tagService.updateDocumentTags(id, selectedTags);
        success('文档保存成功');
      }
    } catch (err: any) {
      showError(err.message || '保存失败');
    } finally {
      setSaving(false);
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
            <Button variant="ghost" onClick={() => navigate('/documents')}>
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
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="开始输入内容..."
          className="w-full h-full resize-none outline-none text-base leading-relaxed"
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  );
}
