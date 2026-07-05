import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity } from 'lucide-react';

const COLORS = ['#C65D3B', '#7D9D72', '#243B53', '#D4A017', '#8FAE83', '#E0B23A'];

export const AdminDashboard = () => {
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

  if (isLoading) return <DashboardLayout role="admin"><div className="animate-pulse h-96 bg-border/50 rounded-3xl" /></DashboardLayout>;
  if (!data) return null;

  return (
    <DashboardLayout role="admin">
      <h1 className="text-h2 mb-2">Platform Overview</h1>
      <p className="text-body text-text-secondary mb-8">Admin metrics and pending approvals.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <p className="text-caption mb-1">Total Users</p>
          <p className="text-h3 font-bold">{data.totalUsers}</p>
        </Card>
        <Card className="p-6">
          <p className="text-caption mb-1">Total Volume</p>
          <p className="text-h3 font-bold text-accent">₹{data.totalVolume.toLocaleString()}</p>
        </Card>
        <Card className="p-6">
          <p className="text-caption mb-1">Pending Campaigns</p>
          <p className="text-h3 font-bold text-highlight">{data.pendingCampaigns?.length || 0}</p>
        </Card>
        <Card className="p-6">
          <p className="text-caption mb-1">Total Campaigns</p>
          <p className="text-h3 font-bold">{data.campaignsByStatus?.reduce((acc, curr) => acc + curr.count, 0) || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        <div className="xl:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-h4 mb-6">30-Day Volume</h3>
            <div className="h-72">
              {data.volumeChart?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.volumeChart}>
                    <defs>
                      <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7D9D72" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#7D9D72" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E5DF" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val}`} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(125, 157, 114, 0.1)' }} />
                    <Area type="monotone" dataKey="amount" stroke="#7D9D72" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary">No data available</div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 h-full">
            <h3 className="text-h4 mb-6">Category Split</h3>
            <div className="h-64 relative">
              {data.categoryDistribution?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="_id"
                    >
                      {data.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary">No data available</div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {data.categoryDistribution?.map((entry, index) => (
                <div key={entry._id} className="flex items-center gap-2 text-xs text-text-secondary">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry._id} ({entry.count})
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="p-6">
          <h3 className="text-h4 mb-6">Top Donors Leaderboard</h3>
          {data.topDonors?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-4 font-semibold text-text-secondary text-sm">Rank</th>
                    <th className="py-4 font-semibold text-text-secondary text-sm">Donor Name</th>
                    <th className="py-4 font-semibold text-text-secondary text-sm text-right">Total Donated</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topDonors.map((donor, index) => (
                    <tr key={donor._id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                      <td className="py-4 text-sm">
                        <Badge variant={index === 0 ? 'warning' : 'outline'}>#{index + 1}</Badge>
                      </td>
                      <td className="py-4 font-medium">{donor.name}</td>
                      <td className="py-4 text-right font-bold text-accent">₹{donor.totalDonated.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-text-secondary py-8">No donations recorded yet.</div>
          )}
        </Card>
      </div>

      <div className="mt-8">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-h4">Admin Activity Log</h3>
          </div>
          {data.adminLogs?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-background/50">
                    <th className="py-4 px-4 font-semibold text-text-secondary text-sm">Date</th>
                    <th className="py-4 px-4 font-semibold text-text-secondary text-sm">Admin</th>
                    <th className="py-4 px-4 font-semibold text-text-secondary text-sm">Action</th>
                    <th className="py-4 px-4 font-semibold text-text-secondary text-sm">Target ID</th>
                    <th className="py-4 px-4 font-semibold text-text-secondary text-sm">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {data.adminLogs.map((log) => (
                    <tr key={log._id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                      <td className="py-4 px-4 text-sm text-text-secondary">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-border overflow-hidden shrink-0">
                            {log.adminId?.avatar?.url ? (
                              <img src={log.adminId.avatar.url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-surface">
                                {log.adminId?.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium">{log.adminId?.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="text-xs">{log.action}</Badge>
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-text-secondary">
                        {log.targetId}
                      </td>
                      <td className="py-4 px-4 text-sm text-text-secondary">
                        {log.details || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-text-secondary py-8">No admin activity recorded.</div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};
