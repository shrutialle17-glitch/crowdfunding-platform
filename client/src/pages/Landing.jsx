import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Button } from '../components/ui/Button';
import { CampaignCard } from '../components/campaign/CampaignCard';
import { ArrowRight, ShieldCheck, HeartHandshake, TrendingUp, Globe } from 'lucide-react';

export const Landing = () => {
  const { data: trending } = useQuery({
    queryKey: ['trending-campaigns'],
    queryFn: async () => {
      const res = await api.get('/campaigns/trending');
      return res.data.data;
    }
  });

  const fadeUpParams = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
        <img 
          src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=2500&auto=format&fit=crop" 
          alt="Hero Background" 
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-surface/85 backdrop-blur-[2px] z-0 pointer-events-none" />
        
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
              The Transparent Crowdfunding Platform
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-7xl font-heading font-extrabold text-text-primary tracking-tight mb-8 max-w-4xl mx-auto leading-tight"
            {...fadeUpParams}
          >
            Fund the ideas that <span className="text-primary">change the world</span>.
          </motion.h1>
          
          <motion.p 
            className="text-base sm:text-lg lg:text-xl text-text-secondary max-w-2xl mx-auto mb-10"
            {...fadeUpParams}
            transition={{ delay: 0.2 }}
          >
            Join thousands of verified creators and passionate donors making a real impact. 100% transparent, 100% secure.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4"
            {...fadeUpParams}
            transition={{ delay: 0.3 }}
          >
            <Link to="/create">
              <Button className="w-full sm:w-auto px-8 py-4 text-lg">Start a Campaign</Button>
            </Link>
            <Link to="/explore">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg bg-white">Explore Causes</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust & Social Proof */}
      <section className="py-16 bg-background border-y border-border">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border">
            <motion.div {...fadeUpParams} transition={{ delay: 0.1 }}>
              <p className="text-4xl font-bold text-primary mb-2">₹10M+</p>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">Funds Raised</p>
            </motion.div>
            <motion.div {...fadeUpParams} transition={{ delay: 0.2 }}>
              <p className="text-4xl font-bold text-text-primary mb-2">50k+</p>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">Active Donors</p>
            </motion.div>
            <motion.div {...fadeUpParams} transition={{ delay: 0.3 }}>
              <p className="text-4xl font-bold text-text-primary mb-2">1,200+</p>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">Successful Projects</p>
            </motion.div>
            <motion.div {...fadeUpParams} transition={{ delay: 0.4 }}>
              <p className="text-4xl font-bold text-accent mb-2">100%</p>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">Verified Creators</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trending Campaigns */}
      <section className="py-24 bg-surface">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <motion.div {...fadeUpParams}>
              <h2 className="text-4xl font-heading font-bold mb-4">Trending Now</h2>
              <p className="text-text-secondary text-lg max-w-xl">Support the most popular causes capturing the community's attention right now.</p>
            </motion.div>
            <Link to="/explore" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:text-primary-hover transition-colors">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trending ? trending.slice(0, 3).map((campaign, idx) => (
              <motion.div key={campaign._id} {...fadeUpParams} transition={{ delay: idx * 0.1 }}>
                <CampaignCard campaign={campaign} />
              </motion.div>
            )) : (
              // Skeletons
              [1,2,3].map(i => <div key={i} className="h-96 bg-border/50 rounded-2xl animate-pulse" />)
            )}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
             <Link to="/explore">
              <Button variant="outline" className="w-full">View All Campaigns</Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* How it works */}
      <section className="py-24 bg-background">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <motion.h2 className="text-4xl font-heading font-bold mb-16" {...fadeUpParams}>
            How KindFund Works
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-border -z-10" />

            <motion.div className="flex flex-col items-center" {...fadeUpParams} transition={{ delay: 0.1 }}>
              <div className="w-24 h-24 bg-surface border border-border rounded-full flex items-center justify-center mb-6 shadow-warm-sm">
                <Globe className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Tell Your Story</h3>
              <p className="text-text-secondary">Create a campaign, set your goals, and explain exactly how the funds will be utilized.</p>
            </motion.div>

            <motion.div className="flex flex-col items-center" {...fadeUpParams} transition={{ delay: 0.2 }}>
              <div className="w-24 h-24 bg-surface border border-border rounded-full flex items-center justify-center mb-6 shadow-warm-sm">
                <ShieldCheck className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Get Verified</h3>
              <p className="text-text-secondary">Our Trust & Safety team reviews your KYC documents to ensure platform integrity and build donor trust.</p>
            </motion.div>

            <motion.div className="flex flex-col items-center" {...fadeUpParams} transition={{ delay: 0.3 }}>
              <div className="w-24 h-24 bg-surface border border-border rounded-full flex items-center justify-center mb-6 shadow-warm-sm">
                <TrendingUp className="w-10 h-10 text-highlight" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Raise & Impact</h3>
              <p className="text-text-secondary">Receive donations, hit your milestones, and post updates to your supporters as you change the world.</p>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};
