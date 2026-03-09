import { useState, useEffect } from 'react';
import { Folder, Plus, Trash2, Edit2, ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/toaster';
import { folderService, type Folder as FolderType } from '@/services/folder.service';
import { documentService, type Document } from '@/services/document.service';
import { cn } from '@/utils/cn';

export default function FoldersPage() {
  const { success, error: showError } = useToast();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderDocuments, setFolderDocuments] = useState<Document[]>([]);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const data = await folderService.getAll();
      setFolders(data);
    } catch (err: any) {
      showError(err.message || '加载文件夹失败');
    }
  };

  const handleCreateFolder = async (parentId?: string) => {
    if (!newFolderName.trim()) {
      showError('请输入文件夹名称');
      return;
    }

    try {
      await folderService.create({ name: newFolderName.trim(), parentId });
      success('文件夹创建成功');
      setNewFolderName('');
      setCreatingFolder(false);
      loadFolders();
      if (parentId) {
        setExpandedFolders(prev => new Set(prev).add(parentId));
      }
    } catch (err: any) {
      showError(err.message || '创建文件夹失败');
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await folderService.delete(id);
      success('文件夹已删除');
      loadFolders();
    } catch (err: any) {
      showError(err.message || '删除失败，文件夹可能不为空');
    }
  };

  const handleUpdateFolder = async (id: string) => {
    if (!editingName.trim()) {
      showError('请输入文件夹名称');
      return;
    }

    try {
      await folderService.update(id, { name: editingName.trim() });
      success('文件夹已重命名');
      setEditingFolderId(null);
      loadFolders();
    } catch (err: any) {
      showError(err.message || '重命名失败');
    }
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setSelectedFolderId(id);
    loadFolderDocuments(id);
  };

  const loadFolderDocuments = async (folderId: string) => {
    try {
      const result = await documentService.getList({ folderId });
      setFolderDocuments(result.list || []);
    } catch (err: any) {
      showError(err.message || '加载文档失败');
    }
  };

  const renderFolderTree = (folderList: FolderType[], level = 0) => {
    const rootFolders = folderList.filter(f => !f.parentId);

    return rootFolders.map(folder => {
      const children = folderList.filter(f => f.parentId === folder.id);
      const isExpanded = expandedFolders.has(folder.id);
      const isEditing = editingFolderId === folder.id;

      return (
        <div key={folder.id}>
          <div
            className={cn(
              'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer hover:bg-muted transition-colors',
              selectedFolderId === folder.id && 'bg-muted'
            )}
            style={{ marginLeft: `${level * 20}px` }}
            onClick={() => toggleFolder(folder.id)}
          >
            {children.length > 0 ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )
            ) : (
              <span className="w-4" />
            )}
            <Folder className={cn(
              'h-4 w-4',
              isExpanded ? 'text-yellow-500 fill-yellow-500' : 'text-yellow-500'
            )} />
            {isEditing ? (
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleUpdateFolder(folder.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateFolder(folder.id);
                  if (e.key === 'Escape') setEditingFolderId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-7 px-2 py-1 text-sm"
                autoFocus
              />
            ) : (
              <span className="flex-1 text-sm font-medium">{folder.name}</span>
            )}
            <span className="text-xs text-muted-foreground">
              {folder._count?.documents || 0}
            </span>
            <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFolderId(folder.id);
                        setEditingName(folder.name);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>重命名</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>删除文件夹</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {isExpanded && children.length > 0 && (
            <div>{renderFolderTree(children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex h-full">
      {/* 文件夹树 */}
      <div className="w-64 border-r p-4 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">文件夹</h2>
          <Button size="sm" onClick={() => setCreatingFolder(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {creatingFolder && (
          <div className="mb-2 flex gap-2">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="文件夹名称"
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') setCreatingFolder(false);
              }}
            />
            <Button size="sm" onClick={() => handleCreateFolder()}>
              确定
            </Button>
          </div>
        )}

        <div className="space-y-1">
          {folders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              暂无文件夹
            </p>
          ) : (
            renderFolderTree(folders)
          )}
        </div>
      </div>

      {/* 文档列表 */}
      <div className="flex-1 p-6 overflow-auto">
        <h2 className="text-xl font-bold mb-4">
          {selectedFolderId ? '文件夹内容' : '选择一个文件夹'}
        </h2>
        {selectedFolderId && (
          <div className="space-y-2">
            {folderDocuments.length === 0 ? (
              <p className="text-muted-foreground">此文件夹为空</p>
            ) : (
              folderDocuments.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">{doc.title}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
