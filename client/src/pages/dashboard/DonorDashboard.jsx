import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { CampaignCard } from '../../components/campaign/CampaignCard';

export const DonorDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['donor-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/donor');
      return res.data.data;
    }
  });

  const { data: savedCampaigns, isLoading: loadingBookmarks } = useQuery({
    queryKey: ['saved-campaigns'],
    queryFn: async () => {
      const res = await api.get('/users/me/bookmarks');
      return res.data.data;
    }
  });

  if (isLoading) return <DashboardLayout role="donor"><div className="animate-pulse h-96 bg-border/50 rounded-3xl" /></DashboardLayout>;
  if (!data) return null;

  const handleDownloadReceipt = async (donationId, receiptId) => {
    try {
      const response = await api.get(`/donations/${donationId}/receipt`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${receiptId || donationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download receipt', error);
      alert('Failed to download receipt. Please try again.');
    }
  };


  return (
    <DashboardLayout role="donor">
      <h1 className="text-h2 mb-2">My Impact</h1>
      <p className="text-body text-text-secondary mb-8">Here's how you've helped change the world.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6">
          <p className="text-caption mb-1">Total Donated</p>
          <p className="text-h2 text-primary font-bold">₹{data.totalDonated.toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <p className="text-caption mb-1">Campaigns Supported</p>
          <p className="text-h2 font-bold">{data.campaignsSupported}</p>
        </Card>
        <Card className="p-6 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-caption mb-1">Community Impact Score</p>
            <div className="flex items-end gap-2">
              <p className="text-h2 text-accent font-bold">{data.impactScore}</p>
              <p className="text-caption pb-1">/ 100</p>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-h3">Recent Donations</h2>
          {data.recentDonations?.length > 0 ? (
            <div className="space-y-4">
              {data.recentDonations.map(donation => (
                <Card key={donation._id} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <img src={donation.campaign.coverImage?.url || '/placeholder.jpg'} alt="Campaign" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/campaigns/${donation.campaign._id}`} className="hover:text-primary transition-colors">
                      <h4 className="text-body font-semibold truncate">{donation.campaign.title}</h4>
                    </Link>
                    <p className="text-caption">{new Date(donation.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-body font-bold">₹{donation.amount.toLocaleString()}</p>
                    <button
                      onClick={() => handleDownloadReceipt(donation._id, donation.receiptId)}
                      className="text-xs text-primary hover:underline cursor-pointer"
                    >
                      Receipt
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-text-secondary">
              No donations yet. <Link to="/explore" className="text-primary hover:underline">Explore campaigns</Link>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-h3">My Badges</h2>
          <Card className="p-6 flex flex-wrap gap-2">
            {data.badges?.length > 0 ? (
              data.badges.map(badge => (
                <Badge key={badge} variant="warning" className="px-3 py-1 text-sm border border-highlight/20">{badge}</Badge>
              ))
            ) : (
              <p className="text-sm text-text-secondary w-full text-center py-4">Make your first donation to earn a badge!</p>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <h2 className="text-h3">Saved Campaigns</h2>
        {loadingBookmarks ? (
          <div className="animate-pulse h-48 bg-border/50 rounded-3xl" />
        ) : savedCampaigns?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedCampaigns.map(campaign => (
              <CampaignCard key={campaign._id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-text-secondary">
            No saved campaigns yet. <Link to="/explore" className="text-primary hover:underline">Explore campaigns</Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};
