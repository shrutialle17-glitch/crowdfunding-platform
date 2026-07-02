import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Badge } from '../components/ui/Badge';

const COLORS = ['#C65D3B', '#7D9D72', '#243B53', '#D4A017', '#8FAE83', '#E0B23A'];

export const CampaignDetail = () => {

  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('story');
  const { data: campaign, isLoading, refetch } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const res = await api.get(`/campaigns/${id}`);
      return res.data.data;
    }
  });

  if (isLoading) return <div className="max-w-[1600px] mx-auto py-12 px-6"><div className="animate-pulse h-96 bg-border/50 rounded-3xl"></div></div>;
  if (!campaign) return <div className="text-center py-20 text-h3">Campaign not found</div>;

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <Badge variant="primary">{campaign.category}</Badge>
      </div>
      <h1 className="text-h1 mb-4">{campaign.title}</h1>
      <p className="text-h4 text-text-secondary font-normal mb-8 max-w-3xl">{campaign.shortDescription}</p>
      <div className="rounded-3xl overflow-hidden shadow-warm-md h-[400px] md:h-[500px]">
        <img src={campaign.coverImage?.url || '/placeholder.jpg'} alt="Cover" className="w-full h-full object-cover" />
      </div>
    </div>
  );
};