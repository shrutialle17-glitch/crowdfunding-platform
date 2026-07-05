import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, Users, Target, Activity } from 'lucide-react';

export const CreatorAnalytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['creator-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/creator');
      return res.data.data;
    }
  });

  if (isLoading) return <DashboardLayout role="creator"><div className="animate-pulse h-96 bg-border/50 rounded-3xl" /></DashboardLayout>;
  if (!data) return null;

  // Process data for a hypothetical bar chart showing campaign performance
  const campaignPerformance = data.campaigns?.map(c => ({
    name: c.title.substring(0, 15) + '...',
    raised: c.amountRaised,
    goal: c.fundingGoal
  })) || [];

  return (
    <DashboardLayout role="creator">
      <div className="space-y-6">
        <div>
          <h2 className="text-h2">Analytics & Reports</h2>
          <p className="text-body text-text-secondary mt-1">Deep dive into your supporter demographics and funding trends.</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-primary/20 bg-primary/5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-caption mb-1">Total Raised</p>
              <p className="text-h3 text-primary font-bold">₹{data.totalRaised.toLocaleString()}</p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-text-secondary" />
            </div>
            <div>
              <p className="text-caption mb-1">Total Supporters</p>
              <p className="text-h3 font-bold">{data.totalSupporters}</p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-text-secondary" />
            </div>
            <div>
              <p className="text-caption mb-1">Average Donation</p>
              <p className="text-h3 font-bold">
                ₹{data.totalSupporters > 0 ? Math.round(data.totalRaised / data.totalSupporters).toLocaleString() : 0}
              </p>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 text-text-secondary" />
            </div>
            <div>
              <p className="text-caption mb-1">Active Campaigns</p>
              <p className="text-h3 font-bold">{data.activeCampaignsCount}</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Funding Over Time Area Chart */}
          <Card className="p-6">
            <h3 className="text-h4 mb-6">Funding Over Time</h3>
            <div className="h-80">
              {data.chartData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCumul" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C65D3B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#C65D3B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E5DF" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(198, 93, 59, 0.1)' }}
                      formatter={(value) => [`₹${value}`, 'Cumulative Raised']}
                    />
                    <Area type="monotone" dataKey="cumulative" stroke="#C65D3B" strokeWidth={3} fillOpacity={1} fill="url(#colorCumul)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary">No data available yet</div>
              )}
            </div>
          </Card>

          {/* Campaign Performance Bar Chart */}
          <Card className="p-6">
            <h3 className="text-h4 mb-6">Campaign Performance vs Goal</h3>
            <div className="h-80">
              {campaignPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E5DF" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                      formatter={(value) => [`₹${value}`, '']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="raised" name="Amount Raised" fill="#C65D3B" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="goal" name="Funding Goal" fill="#E8E5DF" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary">No campaigns yet</div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
};
