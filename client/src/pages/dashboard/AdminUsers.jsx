import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, User as UserIcon, AlertTriangle } from 'lucide-react';

export const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [editingTrust, setEditingTrust] = useState(null);
  const [tempTrustScore, setTempTrustScore] = useState(0);

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data;
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.patch(`/users/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
    }
  });

  const trustMutation = useMutation({
    mutationFn: async ({ id, trustScore }) => {
      await api.patch(`/users/${id}/trust`, { trustScore });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      setEditingTrust(null);
    }
  });

  const handleStatusToggle = (user) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    if (confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'reactivate'} ${user.name}?`)) {
      statusMutation.mutate({ id: user._id, status: newStatus });
    }
  };

  const handleTrustSave = (id) => {
    trustMutation.mutate({ id, trustScore: parseInt(tempTrustScore, 10) || 0 });
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge variant="warning">Admin</Badge>;
      case 'creator':
        return <Badge variant="primary">Creator</Badge>;
      case 'donor':
      default:
        return <Badge variant="success">Donor</Badge>;
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h2 className="text-h2">User Management</h2>
          <p className="text-body text-text-secondary mt-1">View and manage all registered donors, creators, and admins.</p>
        </div>

        <Card className="overflow-hidden border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-background/50 border-b border-border">
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider text-center">Trust Score</th>
                  <th className="px-6 py-4 text-sm font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-10 bg-border/50 animate-pulse rounded-lg w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-border/50 animate-pulse rounded-full w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-border/50 animate-pulse rounded-full w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-border/50 animate-pulse rounded w-16 mx-auto"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-border/50 animate-pulse rounded-lg w-32 ml-auto"></div></td>
                    </tr>
                  ))
                ) : users?.length > 0 ? (
                  users.map(user => (
                    <tr key={user._id} className={`transition-colors ${user.status === 'suspended' ? 'bg-highlight/5 opacity-75' : 'hover:bg-background/30'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center overflow-hidden shrink-0">
                            {user.avatar?.url ? (
                              <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <UserIcon className="w-5 h-5 text-text-secondary" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-text-primary flex items-center gap-2">
                              {user.name}
                              {user.status === 'suspended' && <AlertTriangle className="w-4 h-4 text-highlight" />}
                            </div>
                            <div className="text-sm text-text-secondary">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'creator' ? (
                          <div className="flex items-center gap-1.5">
                            {user.isVerified ? (
                              <><ShieldCheck className="w-4 h-4 text-accent" /><span className="text-sm text-text-primary">Verified</span></>
                            ) : (
                              <span className="text-sm text-text-secondary">Unverified</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-text-secondary">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.role === 'creator' ? (
                          editingTrust === user._id ? (
                            <div className="flex items-center justify-center gap-2">
                              <input 
                                type="number" 
                                className="w-16 px-2 py-1 border border-border rounded text-sm bg-background text-center"
                                value={tempTrustScore}
                                onChange={(e) => setTempTrustScore(e.target.value)}
                              />
                              <button onClick={() => handleTrustSave(user._id)} className="text-accent hover:text-accent-hover text-xs font-bold">Save</button>
                              <button onClick={() => setEditingTrust(null)} className="text-text-secondary hover:text-text-primary text-xs">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <span className="font-bold text-lg">{user.trustScore}</span>
                              <button 
                                onClick={() => { setEditingTrust(user._id); setTempTrustScore(user.trustScore); }}
                                className="text-xs text-primary hover:underline"
                              >
                                Edit
                              </button>
                            </div>
                          )
                        ) : (
                          <span className="text-sm text-text-secondary">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {user.role !== 'admin' && (
                          <Button 
                            variant="outline" 
                            className={`text-xs py-1.5 px-3 ${user.status === 'suspended' ? 'border-accent text-accent hover:bg-accent/10' : 'border-highlight text-highlight hover:bg-highlight/10'}`}
                            onClick={() => handleStatusToggle(user)}
                            disabled={statusMutation.isLoading}
                          >
                            {user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-text-secondary">
                      No users found.
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
