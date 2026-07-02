import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CampaignChecklist } from '../../components/dashboard/CampaignChecklist';
import { useAuth } from '../../context/AuthContext';

export const CreatorDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['creator-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/creator');
      return res.data.data;
    }
  });

  if (isLoading) return <DashboardLayout role="creator"><div className="animate-pulse h-96 bg-border/50 rounded-3xl" /></DashboardLayout>;
  if (!data) return null;

  return (
    <DashboardLayout role="creator">
      <h1 className="text-h2 mb-2">Creator Dashboard</h1>
      <p className="text-body text-text-secondary mb-8">Overview of your campaign performance.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-primary/20 bg-primary/5">
          <p className="text-caption mb-1">Total Raised</p>
          <p className="text-h3 text-primary font-bold">₹{data.totalRaised.toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <p className="text-caption mb-1">Active Campaigns</p>
          <p className="text-h3 font-bold">{data.activeCampaignsCount}</p>
        </Card>
        <Card className="p-6">
          <p className="text-caption mb-1">Total Campaigns</p>
          <p className="text-h3 font-bold">{data.campaigns?.length || 0}</p>
        </Card>
        <Card className="p-6">
          <p className="text-caption mb-1">Total Supporters</p>
          <p className="text-h3 font-bold">{data.totalSupporters}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-h4 mb-6">Cumulative Funding</h3>
            <div className="h-72">
              {data.chartData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData}>
                    <defs>
                      <linearGradient id="colorCumul" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C65D3B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#C65D3B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E5DF" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val}`} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(198, 93, 59, 0.1)' }}
                      formatter={(value) => [`₹${value}`, 'Raised']}
                    />
                    <Area type="monotone" dataKey="cumulative" stroke="#C65D3B" strokeWidth={3} fillOpacity={1} fill="url(#colorCumul)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary">No data available yet</div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <CampaignChecklist campaign={data.campaigns?.[0]} user={user} />
          
          <div>
            <h3 className="text-h4 mb-4">Recent Supporters</h3>
            <div className="space-y-4">
            {data.recentSupporters?.length > 0 ? (
              data.recentSupporters.map(supp => (
                <Card key={supp._id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-border overflow-hidden shrink-0">
                    {supp.donor?.avatar?.url ? <img src={supp.donor.avatar.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-secondary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{supp.donor?.name || 'Anonymous'}</p>
                    <p className="text-xs text-text-secondary truncate">{supp.campaign?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">+₹{supp.amount}</p>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-sm text-text-secondary">No supporters yet.</Card>
            )}
          </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
