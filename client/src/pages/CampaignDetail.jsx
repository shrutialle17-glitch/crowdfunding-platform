import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { DonationModal } from '../components/campaign/DonationModal';
import { CommentsSection } from '../components/campaign/CommentsSection';
import { QRShareModal } from '../components/campaign/QRShareModal';
import { CampaignCard } from '../components/campaign/CampaignCard';
import { TrustBadge } from '../components/ui/TrustBadge';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Clock, Share2, Heart, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';

const COLORS = ['#C65D3B', '#7D9D72', '#243B53', '#D4A017', '#8FAE83', '#E0B23A'];

export const CampaignDetail = () => {

  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('story');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [optimisticBookmark, setOptimisticBookmark] = useState(null);
  const [optimisticFollow, setOptimisticFollow] = useState(null);
  const [optimisticLike, setOptimisticLike] = useState(null);
  const [optimisticLikesCount, setOptimisticLikesCount] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: campaign, isLoading, refetch } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const res = await api.get(`/campaigns/${id}`);
      return res.data.data;
    }
  });

  const { data: related } = useQuery({
    queryKey: ['related-campaigns', id],
    queryFn: async () => {
      const res = await api.get(`/campaigns/${id}/related`);
      return res.data.data;
    },
    enabled: !!campaign
  });

  const { data: updates, isLoading: loadingUpdates } = useQuery({
    queryKey: ['campaign-updates', id],
    queryFn: async () => {
      const res = await api.get(`/updates/${id}`);
      return res.data.data;
    }
  });

  const toggleBookmark = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/users/me/bookmarks/${campaign?._id}`);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['donor-dashboard']);
      setOptimisticBookmark(data.isBookmarked);
    }
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/campaigns/${campaign?._id}/like`);
      return res.data.data;
    },
    onSuccess: (data) => {
      setOptimisticLike(data.isLiked);
      setOptimisticLikesCount(data.likes);
    }
  });

  const toggleFollow = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/users/${campaign?.creator?._id}/follow`);
      return res.data.data;
    },
    onSuccess: (data) => {
      setOptimisticFollow(data.isFollowing);
    }
  });

  if (isLoading) return <div className="max-w-[1600px] mx-auto py-12 px-6"><div className="animate-pulse h-96 bg-border/50 rounded-3xl"></div></div>;
  if (!campaign) return <div className="text-center py-20 text-h3">Campaign not found</div>;

  const isBookmarked = optimisticBookmark !== null ? optimisticBookmark : user?.bookmarkedCampaigns?.includes(campaign._id);
  const isFollowing = optimisticFollow !== null ? optimisticFollow : user?.followedCreators?.includes(campaign.creator?._id);
  const isLiked = optimisticLike !== null ? optimisticLike : user?.likedCampaigns?.includes(campaign._id);
  const likesCount = optimisticLikesCount !== null ? optimisticLikesCount : (campaign.likes || 0);

  const handleBookmark = () => {
    if (!user) return navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    toggleBookmark.mutate();
  };

  const handleLike = () => {
    if (!user) return navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    toggleLike.mutate();
  };

  const handleFollow = () => {
    if (!user) return navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    toggleFollow.mutate();
  };

  const handleShare = () => {
    setIsQRModalOpen(true);
  };

  const percentFunded = Math.min(Math.round((campaign.amountRaised / campaign.fundingGoal) * 100), 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

  const calculateHealthScore = () => {
    if (!campaign) return 0;
    let score = 50;
    score += (percentFunded * 0.3);
    if (daysLeft > 30) score += 10;
    else if (daysLeft > 15) score += 5;
    else score += 2;
    if (updates && updates.length > 0) {
      score += Math.min(updates.length * 2, 10);
    }
    return Math.min(Math.round(score), 100);
  };
  const healthScore = calculateHealthScore();

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <Badge variant="primary">{campaign.category}</Badge>
      </div>
      <h1 className="text-h1 mb-4">{campaign.title}</h1>
      <p className="text-h4 text-text-secondary font-normal mb-8 max-w-3xl">{campaign.shortDescription}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Image */}
          <div className="rounded-3xl overflow-hidden shadow-warm-md h-[400px] md:h-[500px]">
            <img src={campaign.coverImage?.url || '/placeholder.jpg'} alt="Cover" className="w-full h-full object-cover" />
          </div>

          {/* Tabs */}
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
        <div className="space-y-6">
          <div className="bg-surface p-8 rounded-3xl shadow-warm-lg border border-border sticky top-24">
            <ProgressBar progress={percentFunded} className="h-3 mb-6" />

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-h2 text-primary font-bold">₹{campaign.amountRaised.toLocaleString()}</span>
              <span className="text-body text-text-secondary">raised</span>
            </div>

            <p className="text-body text-text-secondary mb-6">of ₹{campaign.fundingGoal.toLocaleString()} goal</p>

            <div className="flex justify-between items-center mb-6 bg-background rounded-xl p-4 border border-border">
              <span className="text-sm font-medium text-text-secondary">Campaign Health Score</span>
              <div className="flex items-center gap-1.5">
                <span className={`text-lg font-bold ${healthScore >= 70 ? 'text-success' : healthScore >= 40 ? 'text-warning' : 'text-highlight'}`}>
                  {healthScore}
                </span>
                <span className="text-xs text-text-secondary">/ 100</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 text-center py-6 border-y border-border">
              <div>
                <p className="text-h3 font-semibold">{campaign.milestones?.filter(m => m.reachedAt)?.length || 0}</p>
                <p className="text-caption">Milestones hit</p>
              </div>
              <div>
                <p className="text-h3 font-semibold">{daysLeft}</p>
                <p className="text-caption">Days to go</p>
              </div>
            </div>

            <Button
              className="w-full py-4 text-lg mb-4"
              onClick={() => {
                if (!user) {
                  navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
                } else {
                  setIsModalOpen(true);
                }
              }}
            >
              Back this project
            </Button>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Button
                  variant={isLiked ? "primary" : "outline"}
                  className="flex-1 gap-2"
                  onClick={handleLike}
                  disabled={toggleLike.isPending}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                  {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                </Button>
                <Button
                  variant={isBookmarked ? "primary" : "outline"}
                  className="flex-1 gap-2"
                  onClick={handleBookmark}
                  disabled={toggleBookmark.isPending}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white' : ''}`} />
                  {isBookmarked ? 'Saved' : 'Save'}
                </Button>
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>

            <p className="text-xs text-center text-text-secondary mt-6">
              All mock donations are protected by KindFund Trust & Safety.
            </p>
          </div>

          {/* Creator Info */}
          <div className="bg-surface p-6 rounded-3xl border border-border flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-border overflow-hidden">
              {campaign.creator?.avatar?.url ? (
                <img src={campaign.creator.avatar.url} alt={campaign.creator.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-secondary font-bold text-xl">
                  {campaign.creator?.name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-caption">Organized by</p>
              <h3 className="text-h4">{campaign.creator?.name}</h3>
              <div className="mt-1">
                <TrustBadge score={campaign.creator?.trustScore || 0} isVerified={campaign.creator?.isVerified} />
              </div>
            </div>

            {user?.id !== campaign.creator?._id && (
              <Button
                variant={isFollowing ? "outline" : "primary"}
                size="sm"
                className="shrink-0"
                onClick={handleFollow}
                disabled={toggleFollow.isPending}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Related Campaigns */}
      {related?.length > 0 && (
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="text-h2 mb-8">You may also like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(relCampaign => (
              <CampaignCard key={relCampaign._id} campaign={relCampaign} />
            ))}
          </div>
        </div>
      )}

      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaign={campaign}
        onSuccess={() => refetch()}
      />

      <QRShareModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        url={window.location.href}
        title={campaign.title}
      />
    </div>
  );
};