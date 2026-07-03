import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { User as UserIcon, Heart, Star } from 'lucide-react';

export const CreatorSupporters = () => {
  const { data: supporters, isLoading } = useQuery({
    queryKey: ['creator-supporters'],
    queryFn: async () => {
      const res = await api.get('/dashboard/creator/supporters');
      return res.data.data;
    }
  });

  return (
    <DashboardLayout role="creator">
      <div className="space-y-6">
        <div>
          <h2 className="text-h2">My Supporters</h2>
          <p className="text-body text-text-secondary mt-1">A detailed directory of the generous people backing your campaigns.</p>
        </div>

        <Card className="overflow-hidden border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-background/50 border-b border-border">
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Supporter</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Total Donated</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider text-center">Contributions</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Last Donated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-10 bg-border/50 animate-pulse rounded-lg w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-border/50 animate-pulse rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-border/50 animate-pulse rounded-full w-12 mx-auto"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-border/50 animate-pulse rounded w-24"></div></td>
                    </tr>
                  ))
                ) : supporters?.length > 0 ? (
                  supporters.map((supp, index) => (
                    <tr key={supp.id} className={`transition-colors hover:bg-background/30 ${index < 3 ? 'bg-primary/5' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center overflow-hidden shrink-0">
                            {supp.avatar?.url && !supp.isAnonymous ? (
                              <img src={supp.avatar.url} alt={supp.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="w-5 h-5 text-text-secondary" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary flex items-center gap-2">
                              {supp.name}
                              {supp.isAnonymous && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Hidden</Badge>}
                              {!supp.isAnonymous && index < 3 && <Star className="w-4 h-4 text-accent fill-accent" />}
                            </div>
                            <div className="text-sm text-text-secondary">{supp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary">₹{supp.totalDonated.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center bg-background border border-border px-3 py-1 rounded-full text-sm font-medium">
                          {supp.contributionsCount} {supp.contributionsCount === 1 ? 'time' : 'times'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {new Date(supp.lastDonated).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-text-secondary">
                      <Heart className="w-12 h-12 text-border mx-auto mb-4" />
                      <p className="text-lg font-medium text-text-primary">No supporters yet.</p>
                      <p className="mt-1">Share your campaigns to start gathering support!</p>
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
