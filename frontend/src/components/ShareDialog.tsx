import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toaster';
import { shareService, type Share } from '@/services/share.service';
import { X, Copy, Check, Lock, Clock, User } from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
}

export default function ShareDialog({ open, onOpenChange, documentId, documentTitle }: ShareDialogProps) {
  const { toast } = useToast();
  const [shares, setShares] = useState<Share[]>([]);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('READ');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadShares();
    }
  }, [open, documentId]);

  const loadShares = async () => {
    try {
      const data = await shareService.getDocumentShares(documentId);
      setShares(data);
    } catch (err: any) {
      toast({
        title: '错误',
        description: err.message || '加载分享列表失败',
        variant: 'destructive',
      });
    }
  };

  const handleCreateShare = async () => {
    if (!email) {
      toast({ title: '错误', description: '请输入邮箱地址', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await shareService.create({
        documentId,
        sharedWithEmail: email,
        permission,
        password: password || undefined,
        expiresAt: expiresAt || undefined,
      });

      toast({ title: '成功', description: '分享创建成功' });
      setEmail('');
      setPassword('');
      setExpiresAt('');
      loadShares();
    } catch (err: any) {
      toast({
        title: '错误',
        description: err.message || '创建分享失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    try {
      await shareService.delete(shareId);
      toast({ title: '成功', description: '分享已删除' });
      loadShares();
    } catch (err: any) {
      toast({
        title: '错误',
        description: err.message || '删除分享失败',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = (shareId: string) => {
    const link = `${window.location.origin}/documents/${documentId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(shareId);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: '已复制', description: '链接已复制到剪贴板' });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>分享文档</DialogTitle>
          <DialogDescription>
            {documentTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 创建分享表单 */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-medium">创建新分享</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">用户邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="permission">权限</Label>
                <select
                  id="permission"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                >
                  <option value="READ">只读</option>
                  <option value="WRITE">可编辑</option>
                  <option value="ADMIN">管理员</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">密码保护（可选）</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="设置访问密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">过期时间（可选）</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleCreateShare} disabled={loading} className="w-full">
              创建分享
            </Button>
          </div>

          {/* 分享列表 */}
          <div className="space-y-2">
            <h4 className="font-medium">已分享的用户</h4>
            {shares.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">暂无分享</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{share.sharedWithEmail}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {getPermissionLabel(share.permission)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {share.password && (
                            <span className="flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              密码保护
                            </span>
                          )}
                          {share.expiresAt && (
                            <span className={`flex items-center gap-1 ${isExpired(share.expiresAt) ? 'text-destructive' : ''}`}>
                              <Clock className="h-3 w-3" />
                              {isExpired(share.expiresAt) ? '已过期' : `有效期至 ${new Date(share.expiresAt).toLocaleString('zh-CN')}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(share.id)}
                      >
                        {copiedId === share.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteShare(share.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
