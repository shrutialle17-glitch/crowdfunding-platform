import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Card } from './ui/Card';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentActivityFeed = () => {
  const { data: recentDonations, refetch } = useQuery({
    queryKey: ['recent-donations'],
    queryFn: async () => {
      const res = await api.get('/donations/recent');
      return res.data.data;
    },
    // Poll every 30 seconds
    refetchInterval: 30000,
  });

  if (!recentDonations || recentDonations.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-h4">Recent Activity</h3>
      </div>
      
      <div className="space-y-4">
        {recentDonations.map((donation) => (
          <div key={donation._id} className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-border overflow-hidden shrink-0 border border-border">
              {donation.donor?.avatar?.url ? (
                <img src={donation.donor.avatar.url} alt={donation.donor.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary font-bold text-sm bg-surface">
                  {donation.donor?.name?.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-bold text-text-primary">{donation.donor?.name || 'Anonymous'}</span> donated{' '}
                <span className="font-bold text-accent">₹{donation.amount.toLocaleString()}</span> to
              </p>
              <Link to={`/campaigns/${donation.campaign?._id}`} className="text-sm font-medium text-primary hover:underline truncate block">
                {donation.campaign?.title}
              </Link>
              <p className="text-xs text-text-secondary mt-1">
                {new Date(donation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
