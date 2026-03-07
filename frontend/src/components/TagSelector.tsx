import { useState, useEffect, useRef } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { tagService, type Tag } from '@/services/tag.service';
import { useToast } from '@/components/ui/toaster';
import { cn } from '@/utils/cn';

interface TagSelectorProps {
  documentId?: string;
  value?: string[];
  onChange?: (tagIds: string[]) => void;
}

export function TagSelector({ documentId, value = [], onChange }: TagSelectorProps) {
  const { toast, error: showError } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(value);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    setSelectedTags(value);
  }, [value]);

  const loadTags = async () => {
    try {
      const data = await tagService.getAll();
      setTags(data);
    } catch (err: any) {
      showError('加载标签失败');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await tagService.create(newTagName.trim());
      setTags([...tags, newTag]);
      setNewTagName('');
      setIsCreating(false);
      toast({ description: '标签创建成功' });

      // 如果有关联文档，自动添加标签
      if (documentId) {
        await tagService.addTagToDocument(documentId, newTag.id);
        if (onChange && !selectedTags.includes(newTag.id)) {
          const newSelected = [...selectedTags, newTag.id];
          setSelectedTags(newSelected);
          onChange(newSelected);
        }
      }
    } catch (err: any) {
      showError(err.response?.data?.message || '创建标签失败');
    }
  };

  const handleToggleTag = async (tagId: string) => {
    if (!documentId) {
      // 仅选择标签，不保存到服务器
      const newSelected = selectedTags.includes(tagId)
        ? selectedTags.filter((id) => id !== tagId)
        : [...selectedTags, tagId];
      setSelectedTags(newSelected);
      onChange?.(newSelected);
      return;
    }

    try {
      if (selectedTags.includes(tagId)) {
        await tagService.removeTagFromDocument(documentId, tagId);
        const newSelected = selectedTags.filter((id) => id !== tagId);
        setSelectedTags(newSelected);
        onChange?.(newSelected);
      } else {
        await tagService.addTagToDocument(documentId, tagId);
        const newSelected = [...selectedTags, tagId];
        setSelectedTags(newSelected);
        onChange?.(newSelected);
      }
    } catch (err: any) {
      showError(err.response?.data?.message || '操作失败');
    }
  };

  const handleDeleteTag = async (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await tagService.delete(tagId);
      setTags(tags.filter((t) => t.id !== tagId));
      if (selectedTags.includes(tagId)) {
        const newSelected = selectedTags.filter((id) => id !== tagId);
        setSelectedTags(newSelected);
        onChange?.(newSelected);
      }
      toast({ description: '标签已删除' });
    } catch (err: any) {
      showError(err.response?.data?.message || '删除标签失败');
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) inputRef.current?.focus();
        }}
        className="gap-2"
      >
        <TagIcon className="h-4 w-4" />
        标签
        {selectedTags.length > 0 && (
          <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
            {selectedTags.length}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-64 bg-background border rounded-lg shadow-lg z-50 p-3">
          {/* 已选标签 */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2 pb-2 border-b">
              {selectedTags.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId);
                if (!tag) return null;
                return (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                  >
                    {tag.name}
                    <button
                      onClick={() => handleToggleTag(tag.id)}
                      className="hover:text-primary-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* 创建新标签 */}
          {isCreating ? (
            <div className="flex gap-1 mb-2">
              <Input
                ref={inputRef}
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTag();
                  if (e.key === 'Escape') setIsCreating(false);
                }}
                placeholder="标签名称"
                className="h-8 text-sm"
                autoFocus
              />
              <Button size="sm" onClick={handleCreateTag}>
                确定
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCreating(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsCreating(true);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className="w-full justify-start text-xs mb-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              创建新标签
            </Button>
          )}

          {/* 标签列表 */}
          <div className="space-y-1 max-h-48 overflow-auto">
            {tags.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                暂无标签
              </p>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag.id}
                  className={cn(
                    'flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-sm',
                    selectedTags.includes(tag.id)
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted'
                  )}
                  onClick={() => handleToggleTag(tag.id)}
                >
                  <span className="flex items-center gap-2">
                    <TagIcon className="h-3 w-3" />
                    {tag.name}
                  </span>
                  <button
                    onClick={(e) => handleDeleteTag(tag.id, e)}
                    className="opacity-0 hover:opacity-100 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
