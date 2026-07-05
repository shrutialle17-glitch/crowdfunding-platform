import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { AlertOctagon, CheckCircle } from 'lucide-react';

export const AdminReports = () => {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const res = await api.get('/reports');
      return res.data.data;
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, action }) => {
      await api.patch(`/reports/${id}/resolve`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reports']);
    }
  });

  const handleResolve = (id, action) => {
    if (confirm(`Are you sure you want to ${action} this report?`)) {
      resolveMutation.mutate({ id, action });
    }
  };

  const getTargetBadge = (type) => {
    switch (type) {
      case 'campaign':
        return <Badge variant="primary">Campaign</Badge>;
      case 'user':
        return <Badge variant="warning">User</Badge>;
      case 'comment':
        return <Badge variant="outline">Comment</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-h2">Content Moderation</h2>
          <p className="text-body text-text-secondary mt-1">Review user reports and moderate platform content.</p>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-border/50 rounded-2xl w-full"></div>
            <div className="h-32 bg-border/50 rounded-2xl w-full"></div>
          </div>
        ) : reports?.length > 0 ? (
          <div className="space-y-4">
            {reports.map(report => (
              <Card key={report._id} className={`p-6 border border-border ${report.status === 'resolved' ? 'bg-background opacity-60' : 'bg-surface'}`}>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <AlertOctagon className={`w-5 h-5 ${report.status === 'resolved' ? 'text-text-secondary' : report.reason?.includes('SYSTEM_FRAUD_FLAG') || report.reason?.includes('ABUSE_PATTERN') ? 'text-highlight' : 'text-warning'}`} />
                      <span className="font-semibold text-text-primary">Reported {getTargetBadge(report.targetType)}</span>
                      {report.reason?.includes('SYSTEM_FRAUD_FLAG') && <Badge variant="highlight">System Flag</Badge>}
                      {report.reason?.includes('HIGH_VELOCITY') && <Badge variant="warning">High Velocity</Badge>}
                      {report.reason?.includes('ABUSE_PATTERN') && <Badge variant="highlight">Abuse Pattern</Badge>}
                      {report.status === 'resolved' && <Badge variant="success">Resolved</Badge>}
                    </div>
                    
                    <p className="text-sm text-text-primary mb-2">
                      <span className="font-medium">Reason:</span> {report.reason?.replace('SYSTEM_FRAUD_FLAG: ', '').replace('HIGH_VELOCITY: ', '').replace('ABUSE_PATTERN: ', '')}
                    </p>
                    
                    <p className="text-xs text-text-secondary">
                      Reported by {report.reporter?.name || 'Unknown User'} on {new Date(report.createdAt).toLocaleDateString()}
                      <br />
                      Target ID: <span className="font-mono bg-background px-1 rounded">{report.targetId}</span>
                    </p>
                  </div>
                  {report.status !== 'resolved' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      {report.targetType === 'campaign' && (
                        <Button 
                          variant="outline"
                          className="text-sm border-highlight text-highlight hover:bg-highlight/10"
                          onClick={() => handleResolve(report._id, 'suspend_campaign')}
                          disabled={resolveMutation.isLoading}
                        >
                          Suspend Campaign
                        </Button>
                      )}
                      {report.targetType === 'user' && (
                        <Button 
                          variant="outline"
                          className="text-sm border-highlight text-highlight hover:bg-highlight/10"
                          onClick={() => handleResolve(report._id, 'suspend_user')}
                          disabled={resolveMutation.isLoading}
                        >
                          Suspend User
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        className="text-sm border-warning text-warning hover:bg-warning/10"
                        onClick={() => handleResolve(report._id, 'delete_content')}
                        disabled={resolveMutation.isLoading}
                      >
                        Delete Content
                      </Button>
                      <Button 
                        variant="outline"
                        className="text-sm text-text-secondary hover:text-text-primary"
                        onClick={() => handleResolve(report._id, 'dismiss')}
                        disabled={resolveMutation.isLoading}
                      >
                        Dismiss Report
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border border-dashed border-border bg-transparent">
            <CheckCircle className="w-12 h-12 text-success/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No pending reports!</h3>
            <p className="text-text-secondary">The community is happy and safe.</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
