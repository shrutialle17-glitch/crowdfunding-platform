import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Badge } from '../components/ui/Badge';
import { TrustBadge } from '../components/ui/TrustBadge';

export const Leaderboard = () => {
  const [type, setType] = useState('donors');
  const [period, setPeriod] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', type, period],
    queryFn: async () => {
      const res = await api.get(`/leaderboard?type=${type}&period=${period}`);
      return res.data.data;
    }
  });

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h1 className="text-h1 mb-4">KindFund Leaderboard</h1>
        <p className="text-body text-text-secondary max-w-2xl mx-auto">Celebrating the top contributors and creators making a difference in our community.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 bg-surface p-2 rounded-2xl border border-border">
        <div className="flex bg-background rounded-xl p-1 w-full sm:w-auto">
          <button 
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${type === 'donors' ? 'bg-primary text-white shadow' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setType('donors')}
          >
            Top Donors
          </button>
          <button 
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${type === 'creators' ? 'bg-primary text-white shadow' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setType('creators')}
          >
            Top Creators
          </button>
        </div>

        <div className="flex bg-background rounded-xl p-1 w-full sm:w-auto">
          <button 
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${period === 'month' ? 'bg-surface border border-border shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setPeriod('month')}
          >
            This Month
          </button>
          <button 
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${period === 'all' ? 'bg-surface border border-border shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            onClick={() => setPeriod('all')}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="bg-surface rounded-3xl border border-border shadow-warm-md overflow-hidden">
        {isLoading ? (
          <div className="animate-pulse space-y-4 p-8">
            <div className="h-16 bg-border/50 rounded-2xl" />
            <div className="h-16 bg-border/50 rounded-2xl" />
            <div className="h-16 bg-border/50 rounded-2xl" />
          </div>
        ) : data?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="py-4 px-6 font-semibold text-text-secondary text-sm">Rank</th>
                  <th className="py-4 px-6 font-semibold text-text-secondary text-sm">{type === 'donors' ? 'Donor' : 'Creator'}</th>
                  <th className="py-4 px-6 font-semibold text-text-secondary text-sm text-right">{type === 'donors' ? 'Total Donated' : 'Total Raised'}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((user, index) => (
                  <tr key={user._id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                    <td className="py-6 px-6">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/20' : 
                        index === 1 ? 'bg-[#C0C0C0] text-black shadow-lg shadow-[#C0C0C0]/20' : 
                        index === 2 ? 'bg-[#CD7F32] text-white shadow-lg shadow-[#CD7F32]/20' : 
                        'bg-background border border-border text-text-secondary'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-border border border-border shrink-0">
                          {user.avatar?.url ? (
                            <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-secondary font-bold">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary text-base">{user.name}</div>
                          {type === 'creators' && (
                            <div className="mt-1">
                              <TrustBadge score={user.trustScore} isVerified={user.isVerified} />
                            </div>
                          )}
                          {type === 'donors' && user.badges?.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {user.badges.slice(0, 3).map((b, i) => (
                                <Badge key={i} variant="success" className="text-[10px] px-1.5 py-0">{b}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6 text-right font-bold text-accent text-lg">
                      ₹{user.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-text-secondary">
            No data available for this period.
          </div>
        )}
      </div>
    </div>
  );
};
