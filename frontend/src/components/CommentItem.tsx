import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MoreHorizontal, Edit2, Trash2, Reply, X, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/toaster';
import { useAuthStore } from '@/stores/authStore';
import { commentService, type Comment } from '@/services/comment.service';

interface CommentItemProps {
  comment: Comment;
  documentId: string;
  onCommentUpdate: () => void;
  maxDepth?: number;
  currentDepth?: number;
}

export default function CommentItem({
  comment,
  documentId,
  onCommentUpdate,
  maxDepth = 3,
  currentDepth = 0,
}: CommentItemProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isAuthor = user?.id === comment.userId;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const canReply = currentDepth < maxDepth;

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast({
        title: '提示',
        description: '请输入回复内容',
        variant: 'destructive',
      });
      return;
    }

    try {
      await commentService.createComment({
        content: replyContent,
        documentId,
        parentId: comment.id,
      });
      setReplyContent('');
      setIsReplying(false);
      onCommentUpdate();
      toast({ description: '回复成功' });
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '回复失败',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) {
      toast({
        title: '提示',
        description: '评论内容不能为空',
        variant: 'destructive',
      });
      return;
    }

    try {
      await commentService.updateComment(comment.id, { content: editContent });
      setIsEditing(false);
      onCommentUpdate();
      toast({ description: '评论已更新' });
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '更新失败',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      await commentService.deleteComment(comment.id);
      onCommentUpdate();
      toast({ description: '评论已删除' });
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '删除失败',
        variant: 'destructive',
      });
    }
  };

  const getAuthorName = () => {
    return comment.user.name || comment.user.email.split('@')[0];
  };

  const getTimeAgo = () => {
    return formatDistanceToNow(new Date(comment.createdAt), {
      addSuffix: true,
      locale: zhCN,
    });
  };

  return (
    <div className={`space-y-3 ${currentDepth > 0 ? 'ml-8 border-l-2 pl-4 border-muted' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatar || undefined} />
          <AvatarFallback className="text-xs">
            {getAuthorName().charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{getAuthorName()}</span>
              <span className="text-xs text-muted-foreground">{getTimeAgo()}</span>
              {isAuthor && (
                <span className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary rounded">作者</span>
              )}
            </div>
            
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    编辑
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px]"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit}>
                  保存
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
          )}

          {!isEditing && (
            <div className="flex items-center gap-2">
              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
                  className="h-7 text-xs"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  回复
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {isReplying && (
        <div className="flex gap-3 ml-11">
          <div className="flex-1 space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`回复 @${getAuthorName()}...`}
              className="min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleReply}>
                <Send className="h-4 w-4 mr-1" />
                发送
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
              >
                <X className="h-4 w-4 mr-1" />
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      {hasReplies && (
        <div className="space-y-4">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              documentId={documentId}
              onCommentUpdate={onCommentUpdate}
              maxDepth={maxDepth}
              currentDepth={currentDepth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
