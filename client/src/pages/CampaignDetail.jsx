import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CommentsSection } from '../components/campaign/CommentsSection';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

const COLORS = ['#C65D3B', '#7D9D72', '#243B53', '#D4A017', '#8FAE83', '#E0B23A'];

export const CampaignDetail = () => {

  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('story');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const { data: campaign, isLoading, refetch } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const res = await api.get(`/campaigns/${id}`);
      return res.data.data;
    }
  });

  const { data: updates, isLoading: loadingUpdates } = useQuery({
    queryKey: ['campaign-updates', id],
    queryFn: async () => {
      const res = await api.get(`/updates/${id}`);
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

      <div className="flex gap-6 border-b border-border mb-8">
        <button
          className={`pb-4 font-semibold ${activeTab === 'story' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
          onClick={() => setActiveTab('story')}
        >
          Full Story
        </button>
        <button
          className={`pb-4 font-semibold ${activeTab === 'updates' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
          onClick={() => setActiveTab('updates')}
        >
          Updates {updates?.length > 0 && <span className="ml-1 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{updates.length}</span>}
        </button>
        <button
          className={`pb-4 font-semibold ${activeTab === 'comments' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments
        </button>
      </div>

      {activeTab === 'story' && (
        <div className="space-y-12">
          <section>
            <h2 className="text-h2 mb-6">About the campaign</h2>
            <div className="prose max-w-none text-body text-text-primary whitespace-pre-wrap">
              {campaign.fullStory}
            </div>
          </section>

          {campaign.fundUtilization?.length > 0 && (
            <section className="bg-surface p-8 rounded-3xl border border-border shadow-warm-sm">
              <h2 className="text-h2 mb-6">Fund Utilization</h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={campaign.fundUtilization}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="percentage"
                        nameKey="category"
                      >
                        {campaign.fundUtilization.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-3">
                  {campaign.fundUtilization.map((util, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-medium text-text-secondary">{util.category}</span>
                      </div>
                      <span className="font-bold text-text-primary">{util.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {campaign.timeline?.length > 0 && (
            <section>
              <h2 className="text-h2 mb-6">Timeline</h2>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                {campaign.timeline.map((event, idx) => (
                  <div key={idx} className="relative flex items-center justify-between group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface bg-primary text-white shadow shrink-0 z-10">
                      <span className="text-xs font-bold">{idx + 1}</span>
                    </div>
                    <div className="w-[calc(100%-4rem)] p-6 rounded-2xl border border-border bg-surface shadow-sm">
                      <time className="text-xs font-bold text-accent mb-2 block tracking-wider uppercase">{new Date(event.date).toLocaleDateString()}</time>
                      <h4 className="text-h4 mb-2">{event.title}</h4>
                      <p className="text-sm text-text-secondary">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {campaign.faqs?.length > 0 && (
            <section>
              <h2 className="text-h2 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {campaign.faqs.map((faq, idx) => (
                  <div key={idx} className="border border-border rounded-2xl overflow-hidden bg-surface">
                    <button
                      className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                    >
                      <span className="font-semibold text-text-primary">{faq.question}</span>
                      {openFaqIndex === idx ? <ChevronUp className="w-5 h-5 text-text-secondary" /> : <ChevronDown className="w-5 h-5 text-text-secondary" />}
                    </button>
                    {openFaqIndex === idx && (
                      <div className="px-6 pb-6 pt-0 text-text-secondary text-body border-t border-border mt-2">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {activeTab === 'updates' && (
        <section>
          <div className="space-y-6">
            {loadingUpdates ? (
              <div className="animate-pulse space-y-4"><div className="h-20 bg-border/50 rounded-xl" /><div className="h-20 bg-border/50 rounded-xl" /></div>
            ) : updates?.length > 0 ? (
              updates.map(update => (
                <div key={update._id} className="p-6 rounded-2xl bg-surface border border-border">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-h4">{update.title}</h3>
                    <span className="text-sm text-text-secondary">{new Date(update.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-text-secondary whitespace-pre-wrap">{update.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-text-secondary bg-surface rounded-2xl border border-border">
                No updates posted yet.
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'comments' && (
        <section>
          <CommentsSection campaignId={campaign._id} />
        </section>
      )}
    </div>
  );
};