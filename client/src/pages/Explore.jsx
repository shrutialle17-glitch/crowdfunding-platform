import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { CampaignCard } from '../components/campaign/CampaignCard';
import { Input } from '../components/ui/Input';
import { Search } from 'lucide-react';
import { RecentActivityFeed } from '../components/RecentActivityFeed';

const CATEGORIES = ['All', 'Education', 'Health & Medical', 'Disaster Relief', 'Animal Welfare', 'Environment', 'Community Development', 'Arts & Culture', 'Children & Youth', 'Elderly Care', 'Sports'];

export const Explore = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns', { search, category, sort }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'All') params.append('category', category);
      if (sort !== 'newest') params.append('sort', sort);

      const res = await api.get(`/campaigns?${params.toString()}`);
      return res.data.data;
    }
  });

  return (
    <div className="w-full max-w-[1920px] px-6 lg:px-12 mx-auto py-8">
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h1 className="text-h2 mb-2">Explore Campaigns</h1>
          <p className="text-body text-text-secondary">Discover and support causes that matter.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="newest">Newest First</option>
            <option value="most_funded">Most Funded</option>
            <option value="ending_soon">Ending Soon</option>
          </select>
        </div>
      </div>

      <div className="mb-8">
        <RecentActivityFeed />
      </div>

      <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${category === cat ? 'bg-primary text-white' : 'bg-surface border border-border text-text-secondary hover:bg-border'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[400px] bg-border/50 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : data?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map(campaign => (
            <CampaignCard key={campaign._id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface rounded-3xl border border-border">
          <h3 className="text-h3 mb-2">No campaigns found</h3>
          <p className="text-body text-text-secondary">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  );
};
