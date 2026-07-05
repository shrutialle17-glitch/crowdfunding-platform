import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../api/axios';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const campaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  shortDescription: z.string().min(10).max(200),
  fullStory: z.string().min(100, 'Story must be at least 100 characters'),
  category: z.enum(['Education', 'Health & Medical', 'Disaster Relief', 'Animal Welfare', 'Environment', 'Community Development', 'Arts & Culture', 'Children & Youth', 'Elderly Care', 'Sports']),
  fundingGoal: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1000, 'Minimum goal is ₹1000'),
  deadline: z.string().refine((val) => new Date(val) > new Date(), 'Deadline must be in the future'),
  location: z.string().min(2, 'Location is required'),
});

const CATEGORIES = ['Education', 'Health & Medical', 'Disaster Relief', 'Animal Welfare', 'Environment', 'Community Development', 'Arts & Culture', 'Children & Youth', 'Elderly Care', 'Sports'];

export const EditCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coverImage, setCoverImage] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const res = await api.get(`/campaigns/${id}`);
      return res.data.data;
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(campaignSchema),
  });

  useEffect(() => {
    if (campaign) {
      reset({
        title: campaign.title,
        shortDescription: campaign.shortDescription,
        fullStory: campaign.fullStory,
        category: campaign.category,
        fundingGoal: campaign.fundingGoal.toString(),
        deadline: new Date(campaign.deadline).toISOString().split('T')[0],
        location: campaign.location,
      });
      // We can't pre-fill files easily, so we leave it empty unless they want to change it.
    }
  }, [campaign, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Because we use multer on the backend for images, and we might not update the image here:
      // If we are just updating text, we might just send JSON. But campaignController.updateCampaign 
      // is currently just a simple findByIdAndUpdate. If we want to support image updates, it'd need more logic.
      // For now, we'll send a JSON patch request.

      const res = await api.put(`/campaigns/${id}`, {
        ...data,
        fundingGoal: Number(data.fundingGoal),
        deadline: new Date(data.deadline)
      });
      
      alert('Campaign updated successfully');
      navigate(`/creator/campaigns`);
    } catch (error) {
      console.error(error);
      alert('Failed to update campaign. Check console.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="max-w-7xl mx-auto py-12 px-6 animate-pulse h-96 bg-surface rounded-3xl" />;
  if (!campaign) return <div className="text-center py-12">Campaign not found</div>;

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <h1 className="text-h1 mb-2">Edit Campaign</h1>
      <p className="text-body text-text-secondary mb-8">Update your campaign details.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-surface p-8 rounded-3xl shadow-warm-md border border-border">
        
        <div className="space-y-6">
          <h2 className="text-h3 border-b border-border pb-2">Basic Info</h2>
          
          <Input label="Campaign Title" {...register('title')} error={errors.title?.message} />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Short Description</label>
            <textarea 
              className={`px-3 py-2 bg-background border ${errors.shortDescription ? 'border-red-500' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]`}
              {...register('shortDescription')}
            />
            {errors.shortDescription && <span className="text-xs text-red-500">{errors.shortDescription.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Category</label>
              <select 
                className={`px-3 py-2 bg-background border ${errors.category ? 'border-red-500' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary`}
                {...register('category')}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="text-xs text-red-500">{errors.category.message}</span>}
            </div>
            <Input label="Location" {...register('location')} error={errors.location?.message} />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-h3 border-b border-border pb-2">Funding Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Funding Goal (₹)" type="number" {...register('fundingGoal')} error={errors.fundingGoal?.message} />
            <Input label="Campaign Deadline" type="date" {...register('deadline')} error={errors.deadline?.message} />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-h3 border-b border-border pb-2">Story</h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Full Story</label>
            <textarea 
              className={`px-3 py-2 bg-background border ${errors.fullStory ? 'border-red-500' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary min-h-[200px]`}
              {...register('fullStory')}
            />
            {errors.fullStory && <span className="text-xs text-red-500">{errors.fullStory.message}</span>}
          </div>
        </div>

        <div className="pt-6 border-t border-border flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/creator/campaigns')}>Cancel</Button>
          <Button type="submit" className="px-8 py-3" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
