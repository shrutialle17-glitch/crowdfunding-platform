import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../api/axios';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ImageUploader } from '../components/ui/ImageUploader';
import { useNavigate } from 'react-router-dom';

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

const TEMPLATES = {
  education: {
    title: 'Help Fund Rural Education Initiatives',
    shortDescription: 'Providing essential school supplies and infrastructure to underprivileged students in rural communities.',
    fullStory: 'Education is the key to breaking the cycle of poverty. In many rural areas, children lack basic supplies like notebooks, pencils, and even a safe building to learn in. By contributing to this campaign, you will directly help us build a better future for these bright minds. Funds will be used for construction, textbooks, and teacher salaries.',
    category: 'Education'
  },
  medical: {
    title: 'Urgent Medical Support for Emergency Surgery',
    shortDescription: 'Raising funds for life-saving surgery and post-operative care.',
    fullStory: 'We are reaching out in a time of great need. A beloved member of our community has been diagnosed with a critical condition requiring immediate surgical intervention. The costs of the procedure, hospital stay, and rehabilitation are overwhelming. Every contribution helps relieve this financial burden and gives them a fighting chance.',
    category: 'Health & Medical'
  },
  disaster: {
    title: 'Emergency Relief for Flood Victims',
    shortDescription: 'Immediate assistance providing food, shelter, and medical aid to displaced families.',
    fullStory: 'Recent catastrophic floods have devastated our region, leaving hundreds of families without homes, clean water, or basic necessities. We are mobilizing an emergency response to deliver food rations, clean drinking water, temporary shelter, and medical supplies to those most affected. Your urgent support can save lives today.',
    category: 'Disaster Relief'
  }
};

export const CreateCampaign = () => {
  const navigate = useNavigate();
  const [coverImage, setCoverImage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rewardTiers, setRewardTiers] = useState([]);
  const [newReward, setNewReward] = useState({ title: '', amount: '', description: '' });
  
  const [faqs, setFaqs] = useState([]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  
  const [fundUtilization, setFundUtilization] = useState([]);
  const [newUtil, setNewUtil] = useState({ category: '', percentage: '' });
  
  const [timeline, setTimeline] = useState([]);
  const [newTimeline, setNewTimeline] = useState({ title: '', date: '', description: '' });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(campaignSchema),
  });

  const applyTemplate = (templateKey) => {
    if (!templateKey) return;
    const template = TEMPLATES[templateKey];
    setValue('title', template.title);
    setValue('shortDescription', template.shortDescription);
    setValue('fullStory', template.fullStory);
    setValue('category', template.category);
  };

  const onSubmit = async (data) => {
    if (coverImage.length === 0) {
      alert('Cover image is required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => formData.append(key, data[key]));
      formData.append('coverImage', coverImage[0]);

      // Example of adding empty arrays for required fields from schema we skip in this basic form
      formData.append('rewardTiers', JSON.stringify(rewardTiers.map(rt => ({ ...rt, amount: Number(rt.amount) }))));
      formData.append('faqs', JSON.stringify(faqs));
      formData.append('fundUtilization', JSON.stringify(fundUtilization.map(u => ({ ...u, percentage: Number(u.percentage) }))));
      formData.append('timeline', JSON.stringify(timeline));

      const res = await api.post('/campaigns', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      navigate(`/campaigns/${res.data.data._id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create campaign. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto py-12 px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-h1 mb-2">Start a Campaign</h1>
          <p className="text-body text-text-secondary">Tell us about your cause and set your goals.</p>
        </div>
        <div className="flex flex-col gap-1.5 min-width: 200px;
}
">
          <label className="text-sm font-medium text-text-primary">Use a Template</label>
          <select 
            className="px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            onChange={(e) => applyTemplate(e.target.value)}
          >
            <option value="">Start from scratch</option>
            <option value="education">Education Initiative</option>
            <option value="medical">Medical Emergency</option>
            <option value="disaster">Disaster Relief</option>
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-surface p-8 rounded-3xl shadow-warm-md border border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-6">
              <h2 className="text-h3 border-b border-border pb-2">Basic Info</h2>
              
              <Input 
                label="Campaign Title" 
                placeholder="e.g. Clean Water for Village X" 
                {...register('title')} 
                error={errors.title?.message}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-primary">Short Description</label>
                <textarea 
                  className={`px-3 py-2 bg-background border ${errors.shortDescription ? 'border-red-500' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary min-height: 80px`}
                  placeholder="A brief summary of your cause..."
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

                <Input 
                  label="Location" 
                  placeholder="City, Country" 
                  {...register('location')} 
                  error={errors.location?.message}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-h3 border-b border-border pb-2">Funding Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Funding Goal (₹)" 
                  type="number"
                  placeholder="10000" 
                  {...register('fundingGoal')} 
                  error={errors.fundingGoal?.message}
                />
                <Input 
                  label="Campaign Deadline" 
                  type="date"
                  {...register('deadline')} 
                  error={errors.deadline?.message}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-h3 border-b border-border pb-2">Media & Story</h2>
              
              <ImageUploader 
                label="Cover Image" 
                files={coverImage} 
                setFiles={setCoverImage} 
                error={coverImage.length === 0 ? "Required" : null}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-primary">Full Story</label>
                <textarea 
                  className={`px-3 py-2 bg-background border ${errors.fullStory ? 'border-red-500' : 'border-border'} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary min-height: 200px;`}
                  placeholder="Explain why you are raising funds and how they will be used..."
                  {...register('fullStory')}
                />
                {errors.fullStory && <span className="text-xs text-red-500">{errors.fullStory.message}</span>}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              <h2 className="text-h3 border-b border-border pb-2">Project Timeline (Optional)</h2>
              <p className="text-sm text-text-secondary">Outline major milestones and expected completion dates.</p>
              
              {timeline.length > 0 && (
                <div className="space-y-4 mb-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <span className="text-xs font-bold">{idx + 1}</span>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-background flex flex-col justify-between items-start shadow-sm">
                        <div className="flex justify-between w-full items-start mb-1">
                          <h4 className="font-semibold text-text-primary">{event.title}</h4>
                          <Button type="button" variant="outline" className="h-6 w-6 p-0 flex items-center justify-center text-highlight border-highlight hover:bg-highlight/10 text-xs shrink-0" onClick={() => setTimeline(timeline.filter((_, i) => i !== idx))}>×</Button>
                        </div>
                        <time className="text-xs font-medium text-primary mb-2">{new Date(event.date).toLocaleDateString()}</time>
                        <p className="text-sm text-text-secondary">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background/50 p-6 rounded-2xl border border-border mt-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Milestone Title</label>
                  <input type="text" className="px-3 py-2 bg-background border border-border rounded-xl" placeholder="e.g. Phase 1 Completion" value={newTimeline.title} onChange={e => setNewTimeline({...newTimeline, title: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Target Date</label>
                  <input type="date" className="px-3 py-2 bg-background border border-border rounded-xl" value={newTimeline.date} onChange={e => setNewTimeline({...newTimeline, date: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea className="px-3 py-2 bg-background border border-border rounded-xl" placeholder="Briefly describe this milestone..." value={newTimeline.description} onChange={e => setNewTimeline({...newTimeline, description: e.target.value})} />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="button" variant="outline" onClick={() => {
                    if(newTimeline.title && newTimeline.date && newTimeline.description) {
                      // Keep sorted by date
                      const sorted = [...timeline, newTimeline].sort((a,b) => new Date(a.date) - new Date(b.date));
                      setTimeline(sorted);
                      setNewTimeline({ title: '', date: '', description: '' });
                    }
                  }}>Add Milestone</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              <h2 className="text-h3 border-b border-border pb-2">Reward Tiers (Optional)</h2>
              <p className="text-sm text-text-secondary">Offer perks to donors who contribute a certain amount.</p>
              
              {rewardTiers.length > 0 && (
                <div className="space-y-4 mb-4">
                  {rewardTiers.map((rt, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-background border border-border rounded-xl">
                      <div>
                        <span className="font-bold text-primary">₹{rt.amount}</span> - <span className="font-semibold">{rt.title}</span>
                        <p className="text-sm text-text-secondary">{rt.description}</p>
                      </div>
                      <Button type="button" variant="outline" className="text-highlight border-highlight hover:bg-highlight/10 text-xs" onClick={() => setRewardTiers(rewardTiers.filter((_, i) => i !== idx))}>Remove</Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 bg-background/50 p-6 rounded-2xl border border-border">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Minimum Amount (₹)</label>
                  <input type="number" className="px-3 py-2 bg-background border border-border rounded-xl" value={newReward.amount} onChange={e => setNewReward({...newReward, amount: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Reward Title</label>
                  <input type="text" className="px-3 py-2 bg-background border border-border rounded-xl" placeholder="e.g. VIP Thank You" value={newReward.title} onChange={e => setNewReward({...newReward, title: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Description</label>
                  <textarea className="px-3 py-2 bg-background border border-border rounded-xl" placeholder="What does the donor get?" value={newReward.description} onChange={e => setNewReward({...newReward, description: e.target.value})} />
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="outline" onClick={() => {
                    if(newReward.amount && newReward.title && newReward.description) {
                      setRewardTiers([...rewardTiers, newReward]);
                      setNewReward({ title: '', amount: '', description: '' });
                    }
                  }}>Add Reward Tier</Button>
                </div>
              </div>
            </div>

            {/* FAQs */}
            <div className="space-y-6">
              <h2 className="text-h3 border-b border-border pb-2">FAQs (Optional)</h2>
              <p className="text-sm text-text-secondary">Anticipate questions your donors might have.</p>
              
              {faqs.length > 0 && (
                <div className="space-y-4 mb-4">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="flex justify-between items-start p-4 bg-background border border-border rounded-xl">
                      <div>
                        <h4 className="font-semibold text-text-primary">Q: {faq.question}</h4>
                        <p className="text-sm text-text-secondary mt-1">A: {faq.answer}</p>
                      </div>
                      <Button type="button" variant="outline" className="text-highlight border-highlight hover:bg-highlight/10 text-xs shrink-0 ml-4" onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}>Remove</Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 bg-background/50 p-6 rounded-2xl border border-border">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Question</label>
                  <input type="text" className="px-3 py-2 bg-background border border-border rounded-xl" placeholder="e.g. How will the funds be delivered?" value={newFaq.question} onChange={e => setNewFaq({...newFaq, question: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Answer</label>
                  <textarea className="px-3 py-2 bg-background border border-border rounded-xl" placeholder="Your answer here..." value={newFaq.answer} onChange={e => setNewFaq({...newFaq, answer: e.target.value})} />
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="outline" onClick={() => {
                    if(newFaq.question && newFaq.answer) {
                      setFaqs([...faqs, newFaq]);
                      setNewFaq({ question: '', answer: '' });
                    }
                  }}>Add FAQ</Button>
                </div>
              </div>
            </div>

            {/* Fund Utilization */}
            <div className="space-y-6">
              <h2 className="text-h3 border-b border-border pb-2">Fund Utilization (Optional)</h2>
              <p className="text-sm text-text-secondary">Show donors exactly how their money will be spent.</p>
              
              {fundUtilization.length > 0 && (
                <div className="space-y-4 mb-4">
                  {fundUtilization.map((util, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-background border border-border rounded-xl">
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-accent">{util.percentage}%</span>
                        <span className="font-medium">{util.category}</span>
                      </div>
                      <Button type="button" variant="outline" className="text-highlight border-highlight hover:bg-highlight/10 text-xs" onClick={() => setFundUtilization(fundUtilization.filter((_, i) => i !== idx))}>Remove</Button>
                    </div>
                  ))}
                  <div className="text-sm font-medium text-text-secondary text-right">
                    Total: {fundUtilization.reduce((acc, curr) => acc + Number(curr.percentage), 0)}%
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 bg-background/50 p-6 rounded-2xl border border-border">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Category</label>
                  <input type="text" className="px-3 py-2 bg-background border border-border rounded-xl" placeholder="e.g. Medical Supplies" value={newUtil.category} onChange={e => setNewUtil({...newUtil, category: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Percentage (%)</label>
                  <input type="number" min="1" max="100" className="px-3 py-2 bg-background border border-border rounded-xl" placeholder="e.g. 40" value={newUtil.percentage} onChange={e => setNewUtil({...newUtil, percentage: e.target.value})} />
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="outline" onClick={() => {
                    if(newUtil.category && newUtil.percentage) {
                      setFundUtilization([...fundUtilization, newUtil]);
                      setNewUtil({ category: '', percentage: '' });
                    }
                  }}>Add Breakdown Item</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border flex justify-end mt-8">
          <Button type="submit" className="px-8 py-3 text-lg" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </div>
      </form>
    </div>
  );
};
