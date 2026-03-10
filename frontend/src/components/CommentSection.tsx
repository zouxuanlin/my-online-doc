import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toaster';
import { commentService, type Comment } from '@/services/comment.service';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  documentId: string;
}

export default function CommentSection({ documentId }: CommentSectionProps) {
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [documentId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await commentService.getComments(documentId);
      setComments(data.comments || []);
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '加载评论失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: '提示',
        description: '请输入评论内容',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      await commentService.createComment({
        content: newComment,
        documentId,
      });
      setNewComment('');
      loadComments();
      toast({ description: '评论成功' });
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '评论失败',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="border-t p-6">
      <h2 className="text-lg font-semibold mb-6">评论</h2>
      
      {/* 发表评论输入框 */}
      <div className="space-y-3 mb-6">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的评论..."
          className="min-h-[100px]"
          disabled={submitting}
        />
        <div className="flex justify-end">
          <Button onClick={handleCreateComment} disabled={submitting}>
            <Send className="h-4 w-4 mr-2" />
            {submitting ? '发布中...' : '发布评论'}
          </Button>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无评论，快来发表第一条评论吧！
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              documentId={documentId}
              onCommentUpdate={loadComments}
            />
          ))
        )}
      </div>
    </div>
  );
}
