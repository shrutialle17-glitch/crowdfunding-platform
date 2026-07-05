import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Megaphone, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const updateSchema = z.object({
  title: z.string().min(3, 'Title is required').max(100),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  campaignId: z.string().min(1, 'Please select a campaign')
});

export const CreatorUpdates = () => {
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState('');

  const { data: dashboardData } = useQuery({
    queryKey: ['creator-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/creator');
      return res.data.data;
    }
  });

  const campaigns = dashboardData?.campaigns || [];

  const { data: updates, isLoading: loadingUpdates } = useQuery({
    queryKey: ['updates', selectedCampaign],
    queryFn: async () => {
      if (!selectedCampaign) return [];
      const res = await api.get(`/updates/${selectedCampaign}`);
      return res.data.data;
    },
    enabled: !!selectedCampaign
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(updateSchema)
  });

  const postMutation = useMutation({
    mutationFn: async (data) => {
      await api.post('/updates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['updates', selectedCampaign]);
      reset({ campaignId: selectedCampaign, title: '', content: '' });
      alert('Update posted successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.error?.message || 'Failed to post update');
    }
  });

  const onSubmit = (data) => {
    postMutation.mutate(data);
  };

  return (
    <DashboardLayout role="creator">
      <div className="space-y-6">
        <div>
          <h2 className="text-h2">Campaign Updates</h2>
          <p className="text-body text-text-secondary mt-1">Keep your supporters in the loop by posting progress updates.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" /> Post New Update
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Select Campaign</label>
                  <select 
                    className="px-3 py-2 bg-background border border-border rounded-xl"
                    {...register('campaignId')}
                    onChange={(e) => {
                      setSelectedCampaign(e.target.value);
                      register('campaignId').onChange(e);
                    }}
                  >
                    <option value="">-- Choose Campaign --</option>
                    {campaigns.map(c => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                  {errors.campaignId && <span className="text-xs text-red-500">{errors.campaignId.message}</span>}
                </div>

                <Input label="Update Title" {...register('title')} error={errors.title?.message} />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Message</label>
                  <textarea 
                    className="px-3 py-2 bg-background border border-border rounded-xl min-h-[120px]"
                    placeholder="What's new?"
                    {...register('content')}
                  />
                  {errors.content && <span className="text-xs text-red-500">{errors.content.message}</span>}
                </div>

                <Button type="submit" className="w-full" disabled={postMutation.isLoading || !selectedCampaign}>
                  {postMutation.isLoading ? 'Posting...' : 'Publish Update'}
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6 border border-border min-h-[400px]">
              <h3 className="font-semibold mb-4">Past Updates</h3>
              {!selectedCampaign ? (
                <div className="text-center text-text-secondary py-12">
                  Select a campaign to view its updates.
                </div>
              ) : loadingUpdates ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-20 bg-border/50 rounded-xl"></div>
                  <div className="h-20 bg-border/50 rounded-xl"></div>
                </div>
              ) : updates?.length > 0 ? (
                <div className="space-y-4">
                  {updates.map(update => (
                    <div key={update._id} className="p-4 rounded-xl bg-background border border-border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-text-primary">{update.title}</h4>
                        <span className="text-xs text-text-secondary flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(update.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary whitespace-pre-wrap">{update.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-text-secondary py-12">
                  No updates posted for this campaign yet.
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
