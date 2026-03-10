import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Share, Lock, Clock, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toaster';
import { shareService, type Share } from '@/services/share.service';

export default function SharedWithMePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [receivedShares, setReceivedShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    try {
      setLoading(true);
      const shares = await shareService.getReceivedShares();
      setReceivedShares(shares || []);
    } catch (err: any) {
      toast({
        title: '错误',
        description: err.message || '加载分享列表失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'READ': return '只读';
      case 'WRITE': return '可编辑';
      case 'ADMIN': return '管理员';
      default: return permission;
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">与我共享</h1>
          <p className="text-muted-foreground">
            共 {receivedShares.filter(s => !isExpired(s.expiresAt)).length} 个有效分享
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/documents')}>
          <FileText className="h-4 w-4 mr-2" />
          浏览文档
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : receivedShares.length === 0 ? (
        <div className="text-center py-12">
          <Share className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            暂无分享
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {receivedShares.map((share) => {
            const expired = isExpired(share.expiresAt);
            return (
              <Card
                key={share.id}
                className={`group hover:shadow-md transition-shadow cursor-pointer ${expired ? 'opacity-60' : ''}`}
                onClick={() => !expired && navigate(`/documents/${share.documentId}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold truncate flex-1">
                        {share.document?.title || '文档'}
                      </h3>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {getPermissionLabel(share.permission)}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{share.sharedBy?.name || share.sharedBy?.email}</span>
                    </div>
                    {share.password && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        <span>密码保护</span>
                      </div>
                    )}
                    {share.expiresAt && (
                      <div className={`flex items-center gap-2 text-xs ${expired ? 'text-destructive' : 'text-muted-foreground'}`}>
                        <Clock className="h-3 w-3" />
                        <span>{expired ? '已过期' : `有效期至 ${new Date(share.expiresAt).toLocaleString('zh-CN')}`}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    分享于 {new Date(share.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
