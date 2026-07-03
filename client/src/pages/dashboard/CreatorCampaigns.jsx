import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Target, ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CreatorCampaigns = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['creator-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/creator');
      return res.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['creator-dashboard']);
    },
    onError: (error) => {
      alert(error.response?.data?.error?.message || 'Failed to delete campaign');
    }
  });

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const campaigns = data?.campaigns || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Active</Badge>;
      case 'pending':
        return <Badge variant="warning">Under Review</Badge>;
      case 'rejected':
        return <Badge variant="highlight">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout role="creator">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-h2">My Campaigns</h2>
            <p className="text-body text-text-secondary mt-1">Manage and track your active fundraising campaigns.</p>
          </div>
          <Link to="/create">
            <Button>Start New Campaign</Button>
          </Link>
        </div>

        <Card className="overflow-hidden border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-background/50 border-b border-border">
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Funding Goal</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-10 bg-border/50 animate-pulse rounded-lg w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-border/50 animate-pulse rounded-full w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-border/50 animate-pulse rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-border/50 animate-pulse rounded w-24"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-border/50 animate-pulse rounded-lg w-24 ml-auto"></div></td>
                    </tr>
                  ))
                ) : campaigns.length > 0 ? (
                  campaigns.map(campaign => {
                    const percentFunded = Math.min(100, Math.round((campaign.amountRaised / campaign.fundingGoal) * 100));
                    return (
                      <tr key={campaign._id} className="transition-colors hover:bg-background/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-border flex items-center justify-center overflow-hidden shrink-0">
                              {campaign.coverImage?.url ? (
                                <img src={campaign.coverImage.url} alt={campaign.title} className="w-full h-full object-cover" />
                              ) : (
                                <Target className="w-6 h-6 text-text-secondary" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-text-primary line-clamp-1">{campaign.title}</div>
                              <div className="text-sm text-text-secondary">{campaign.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(campaign.status)}
                        </td>
                        <td className="px-6 py-4 min-w-[200px]">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-bold text-primary">₹{campaign.amountRaised.toLocaleString()}</span>
                            <span className="text-text-secondary text-xs">of ₹{campaign.fundingGoal.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{ width: `${percentFunded}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-text-secondary mt-1 text-right">{percentFunded}% funded</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {new Date(campaign.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <div className="flex justify-end gap-2">
                            <Link to={`/campaigns/${campaign._id}`}>
                              <Button variant="outline" className="text-xs py-1.5 px-3">
                                View
                              </Button>
                            </Link>
                            <Link to={`/creator/campaigns/${campaign._id}/edit`}>
                              <Button variant="outline" className="text-xs py-1.5 px-3 border-primary text-primary hover:bg-primary/10">
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              className="text-xs py-1.5 px-3 border-highlight text-highlight hover:bg-highlight/10"
                              onClick={() => handleDelete(campaign._id)}
                              disabled={deleteMutation.isLoading}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-text-secondary">
                      <Target className="w-12 h-12 text-border mx-auto mb-4" />
                      <p className="text-lg font-medium text-text-primary">No campaigns yet.</p>
                      <p className="mt-1 mb-4">Start your first fundraising campaign to see it here.</p>
                      <Link to="/create"><Button>Start Campaign</Button></Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
