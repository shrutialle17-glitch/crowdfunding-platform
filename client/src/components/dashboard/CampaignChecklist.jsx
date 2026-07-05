import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Link } from 'react-router-dom';

export const CampaignChecklist = ({ campaign, user }) => {
  const isKycComplete = user?.isVerified;
  const hasCampaign = !!campaign;
  const isApproved = campaign?.status === 'approved';
  const hasFirstDonation = campaign?.amountRaised > 0;
  const hasUpdates = false; // Simplified for now, could pass down updates count

  const steps = [
    {
      title: 'Complete Identity Verification (KYC)',
      description: 'Build trust with donors by verifying your identity.',
      isComplete: isKycComplete,
      link: '/creator/kyc',
      actionText: 'Complete KYC'
    },
    {
      title: 'Launch a Campaign',
      description: 'Create your first campaign and tell your story.',
      isComplete: hasCampaign,
      link: '/create',
      actionText: 'Start Campaign'
    },
    {
      title: 'Get Admin Approval',
      description: 'Wait for our Trust & Safety team to review your campaign.',
      isComplete: isApproved,
      link: null,
      actionText: 'Pending Review'
    },
    {
      title: 'Receive First Donation',
      description: 'Share your campaign link to get your first supporter!',
      isComplete: hasFirstDonation,
      link: hasCampaign ? `/campaigns/${campaign._id}` : null,
      actionText: 'View Campaign'
    }
  ];

  const completedSteps = steps.filter(s => s.isComplete).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  return (
    <Card className="p-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-h4 mb-1">Launch Checklist</h3>
          <p className="text-sm text-text-secondary">Your journey to successful fundraising.</p>
        </div>
        <div className="text-right">
          <span className="text-h3 font-bold text-primary">{progress}%</span>
          <p className="text-xs text-text-secondary">Completed</p>
        </div>
      </div>
      
      <div className="w-full bg-border/50 h-2 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={idx} className={`flex items-start gap-4 p-4 rounded-2xl border ${step.isComplete ? 'border-success/30 bg-success/5' : 'border-border bg-surface'} transition-colors`}>
            {step.isComplete ? (
              <CheckCircle2 className="w-6 h-6 text-success shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-6 h-6 text-text-secondary shrink-0 mt-0.5" />
            )}
            
            <div className="flex-1">
              <h4 className={`font-semibold ${step.isComplete ? 'text-text-primary' : 'text-text-primary'}`}>{step.title}</h4>
              <p className="text-sm text-text-secondary mb-2">{step.description}</p>
              
              {!step.isComplete && step.link ? (
                <Link to={step.link} className="text-sm font-medium text-primary hover:underline">
                  {step.actionText} →
                </Link>
              ) : !step.isComplete ? (
                <span className="text-sm font-medium text-text-secondary">{step.actionText}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
