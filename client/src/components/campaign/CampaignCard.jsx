import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';

export const CampaignCard = ({ campaign }) => {
  const percentFunded = Math.min(Math.round((campaign.amountRaised / campaign.fundingGoal) * 100), 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <Link to={`/campaigns/${campaign._id}`} className="block group">
      <Card className="h-full flex flex-col transition-shadow hover:shadow-warm-md">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={campaign.coverImage?.url || '/placeholder.jpg'} 
            alt={campaign.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="primary">{campaign.category}</Badge>
            {campaign.featured && <Badge variant="warning">Featured</Badge>}
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-h4 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {campaign.title}
          </h3>
          <p className="text-body text-text-secondary line-clamp-2 mb-4 flex-1">
            {campaign.shortDescription}
          </p>

          <div className="space-y-4 mt-auto">
            <ProgressBar progress={percentFunded} />
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-h3 text-primary font-bold">₹{campaign.amountRaised.toLocaleString()}</p>
                <p className="text-caption">raised of ₹{campaign.fundingGoal.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-body font-medium">{percentFunded}%</p>
                <p className="text-caption">funded</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-caption pt-4 border-t border-border">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {campaign.location}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {daysLeft} days left</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
