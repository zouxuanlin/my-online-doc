import { useState, useEffect } from 'react';
import { Link2, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { documentService } from '@/services/document.service';

interface LinkDocumentProps {
  onLinkInsert: (linkText: string) => void;
  currentDocumentId?: string;
}

interface Document {
  id: string;
  title: string;
}

export default function LinkDocument({ onLinkInsert, currentDocumentId }: LinkDocumentProps) {
  const [open, setOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      loadDocuments();
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = documents.filter((doc: Document) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments(documents);
    }
  }, [searchTerm, documents]);

  const loadDocuments = async () => {
    try {
      const result = await documentService.getList({ pageSize: 100 });
      const allDocs: Document[] = result.list || [];
      // 排除当前文档
      const filtered = currentDocumentId
        ? allDocs.filter((doc: Document) => doc.id !== currentDocumentId)
        : allDocs;
      setDocuments(filtered);
      setFilteredDocuments(filtered);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleSelectDocument = (title: string) => {
    onLinkInsert(`[[${title}]]`);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title="插入文档链接">
          <Link2 className="h-4 w-4 mr-2" />
          文档链接
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>插入文档链接</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索文档..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredDocuments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4 text-sm">
                {searchTerm ? '没有找到匹配的文档' : '暂无文档'}
              </p>
            ) : (
              filteredDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleSelectDocument(doc.title)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
                >
                  {doc.title}
                </button>
              ))
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>提示：点击文档名称插入链接，格式为 <code className="bg-muted px-1.5 py-0.5 rounded">[[文档名]]</code></p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
