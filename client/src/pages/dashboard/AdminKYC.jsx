import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User as UserIcon, FileText, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export const AdminKYC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/admin');
      return res.data.data;
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, reason }) => {
      await api.patch(`/kyc/${id}/review`, { status, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-dashboard']);
    }
  });

  const handleReview = (id, status) => {
    let reason = '';
    if (status === 'rejected') {
      reason = prompt('Enter rejection reason for the creator:');
      if (!reason) return; // Cancelled
    }
    reviewMutation.mutate({ id, status, reason });
  };

  const pendingKYC = data?.pendingKYC || [];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-h2">KYC Queue</h2>
          <p className="text-body text-text-secondary mt-1">Review creator identity documents and organizational details to grant verified status.</p>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-border/50 rounded-2xl w-full"></div>
            <div className="h-48 bg-border/50 rounded-2xl w-full"></div>
          </div>
        ) : pendingKYC.length > 0 ? (
          <div className="space-y-6">
            {pendingKYC.map(submission => (
              <Card key={submission._id} className="p-6 border border-border bg-surface">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center overflow-hidden shrink-0">
                        {submission.user?.avatar?.url ? (
                          <img src={submission.user.avatar.url} alt={submission.user.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-6 h-6 text-text-secondary" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-h4">{submission.user?.name || 'Unknown User'}</h3>
                        <p className="text-sm text-text-secondary">{submission.user?.email}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-text-secondary mb-4">
                      Submitted on: {new Date(submission.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <a href={submission.idDocument?.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 bg-background border border-border rounded-xl hover:border-primary transition-colors group">
                        <FileText className="w-5 h-5 text-text-secondary group-hover:text-primary" />
                        <span className="text-sm font-medium">ID Document</span>
                        <ExternalLink className="w-3 h-3 text-text-secondary opacity-50 group-hover:opacity-100" />
                      </a>
                      <a href={submission.selfie?.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 bg-background border border-border rounded-xl hover:border-primary transition-colors group">
                        <UserIcon className="w-5 h-5 text-text-secondary group-hover:text-primary" />
                        <span className="text-sm font-medium">Selfie Match</span>
                        <ExternalLink className="w-3 h-3 text-text-secondary opacity-50 group-hover:opacity-100" />
                      </a>
                      <a href={submission.addressProof?.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 bg-background border border-border rounded-xl hover:border-primary transition-colors group">
                        <FileText className="w-5 h-5 text-text-secondary group-hover:text-primary" />
                        <span className="text-sm font-medium">Address Proof</span>
                        <ExternalLink className="w-3 h-3 text-text-secondary opacity-50 group-hover:opacity-100" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col justify-end gap-3 shrink-0 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                    <Button 
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-success hover:bg-success-dark text-white border-none"
                      onClick={() => handleReview(submission._id, 'approved')}
                      disabled={reviewMutation.isLoading}
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve KYC
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 border-highlight text-highlight hover:bg-highlight/10"
                      onClick={() => handleReview(submission._id, 'rejected')}
                      disabled={reviewMutation.isLoading}
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border border-dashed border-border bg-transparent">
            <CheckCircle className="w-12 h-12 text-success/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">All caught up!</h3>
            <p className="text-text-secondary">There are no pending KYC verifications in the queue.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
