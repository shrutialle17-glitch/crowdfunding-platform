import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Button } from '../ui/Button';
import { TrustBadge } from '../ui/TrustBadge';
import { MessageSquare, Send } from 'lucide-react';

export const CommentsSection = ({ campaignId }) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', campaignId],
    queryFn: async () => {
      const res = await api.get(`/campaigns/${campaignId}/comments`);
      return res.data.data;
    }
  });

  const postMutation = useMutation({
    mutationFn: async (content) => {
      const res = await api.post(`/campaigns/${campaignId}/comments`, { content });
      return res.data.data;
    },
    onSuccess: () => {
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', campaignId] });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    postMutation.mutate(newComment);
  };

  if (isLoading) return <div className="animate-pulse h-32 bg-border/30 rounded-2xl"></div>;

  return (
    <section className="bg-surface rounded-3xl p-6 border border-border shadow-warm-sm">
      <h3 className="text-h3 flex items-center gap-2 mb-6"><MessageSquare className="w-5 h-5 text-primary" /> Community Comments ({comments?.length || 0})</h3>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Leave a supportive comment..."
          className="flex-1 px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          disabled={postMutation.isPending}
        />
        <Button type="submit" disabled={postMutation.isPending} className="px-6 rounded-xl flex items-center gap-2">
          {postMutation.isPending ? 'Posting...' : <><Send className="w-4 h-4" /> Post</>}
        </Button>
      </form>

      <div className="space-y-6">
        {comments?.length > 0 ? comments.map(comment => (
          <div key={comment._id} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-border shrink-0 overflow-hidden">
              {comment.author?.avatar?.url ? (
                <img src={comment.author.avatar.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-text-secondary">{comment.author?.name?.charAt(0) || '?'}</div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{comment.author?.name || 'Anonymous'}</span>
                <TrustBadge score={comment.author?.trustScore || 0} isVerified={comment.author?.isVerified} className="scale-90 origin-left" />
                <span className="text-xs text-text-secondary ml-auto">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-text-primary bg-background p-3 rounded-tr-xl rounded-b-xl border border-border inline-block">
                {comment.content}
              </p>
            </div>
          </div>
        )) : (
          <p className="text-center text-text-secondary text-sm italic py-4">No comments yet. Be the first to show your support!</p>
        )}
      </div>
    </section>
  );
};
