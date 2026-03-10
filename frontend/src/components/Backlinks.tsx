import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { documentService } from '@/services/document.service';

interface BacklinksProps {
  documentId: string;
}

interface LinkedDocument {
  id: string;
  title: string;
  updatedAt: string;
}

export default function Backlinks({ documentId }: BacklinksProps) {
  const navigate = useNavigate();
  const [backlinks, setBacklinks] = useState<LinkedDocument[]>([]);
  const [outgoingLinks, setOutgoingLinks] = useState<LinkedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, [documentId]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const [backlinksData, outgoingData] = await Promise.all([
        documentService.getBacklinks(documentId),
        documentService.getOutgoingLinks(documentId),
      ]);
      setBacklinks(backlinksData || []);
      setOutgoingLinks(outgoingData || []);
    } catch (err: any) {
      // ignore error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        加载中...
      </div>
    );
  }

  if (backlinks.length === 0 && outgoingLinks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 双向链接 - 哪些文档链接到这里 */}
      {backlinks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            链入文档 ({backlinks.length})
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {backlinks.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium truncate">{doc.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(doc.updatedAt).toLocaleDateString('zh-CN')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 出向链接 - 当前文档链接到其他文档 */}
      {outgoingLinks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            链出文档 ({outgoingLinks.length})
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {outgoingLinks.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium truncate">{doc.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(doc.updatedAt).toLocaleDateString('zh-CN')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
