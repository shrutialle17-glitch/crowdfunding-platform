import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Star } from 'lucide-react';

export const AdminApprovals = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/admin');
      return res.data.data;
    }
  });

  const handleApprove = async (id) => {
    try {
      await api.patch(`/campaigns/${id}/approve`);
      refetch();
    } catch (e) {
      alert('Error approving campaign');
    }
  };

  const handleReject = async (id) => {
    try {
      const reason = prompt('Enter rejection reason:');
      if (reason) {
        await api.patch(`/campaigns/${id}/reject`, { reason });
        refetch();
      }
    } catch (e) {
      alert('Error rejecting campaign');
    }
  };

  const handleToggleFeature = async (id) => {
    try {
      await api.patch(`/campaigns/${id}/feature`);
      refetch();
    } catch (e) {
      alert(e.response?.data?.error?.message || 'Error featuring campaign');
    }
  };

  if (isLoading) return <DashboardLayout role="admin"><div className="animate-pulse h-96 bg-border/50 rounded-3xl" /></DashboardLayout>;
  if (!data) return null;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-h2">Pending Approvals</h2>
          <p className="text-body text-text-secondary mt-1">Review and approve new campaigns before they go live.</p>
        </div>
        <div className="space-y-4">
          {data.pendingCampaigns?.length > 0 ? (
            data.pendingCampaigns.map(camp => (
              <Card key={camp._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-body font-semibold truncate">{camp.title}</h4>
                    <Badge variant="primary">{camp.category}</Badge>
                  </div>
                  <p className="text-sm text-text-secondary">By {camp.creator?.name} • Goal: ₹{camp.fundingGoal.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => handleReject(camp._id)}>Reject</Button>
                  <Button onClick={() => handleApprove(camp._id)}>Approve</Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-text-secondary">No campaigns pending approval.</Card>
          )}
        </div>

        <div className="pt-8 border-t border-border">
          <div>
            <h2 className="text-h2">Active Campaigns</h2>
            <p className="text-body text-text-secondary mt-1 mb-6">Manage approved campaigns and set featured statuses (Max 6 featured).</p>
          </div>
          <div className="space-y-4">
            {data.approvedCampaigns?.length > 0 ? (
              data.approvedCampaigns.map(camp => (
                <Card key={camp._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-body font-semibold truncate">{camp.title}</h4>
                      <Badge variant="success">Approved</Badge>
                      {camp.featured && <Badge variant="warning">Featured</Badge>}
                    </div>
                    <p className="text-sm text-text-secondary">By {camp.creator?.name} • Goal: ₹{camp.fundingGoal.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant={camp.featured ? "outline" : "primary"}
                      className="gap-2"
                      onClick={() => handleToggleFeature(camp._id)}
                    >
                      <Star className={`w-4 h-4 ${camp.featured ? 'fill-warning text-warning' : ''}`} />
                      {camp.featured ? 'Unfeature' : 'Feature'}
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center text-text-secondary">No active campaigns.</Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
