import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import api from '../../api/axios';

const PRESET_AMOUNTS = [500, 1000, 5000];

export const DonationModal = ({ isOpen, onClose, campaign, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // form, success
  const [receiptId, setReceiptId] = useState(null);

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || amount < 100) return;

    setLoading(true);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await api.post(`/campaigns/${campaign._id}/donate`, {
        amount: Number(amount),
        isAnonymous
      });

      setReceiptId(res.data.data._id); // Assuming we can use this to download later
      setStep('success');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      alert('Mock payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface w-full max-w-md rounded-3xl shadow-warm-lg border border-border overflow-hidden relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-text-secondary hover:bg-border rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>

          {step === 'form' ? (
            <div className="p-8">
              <h2 className="text-h3 mb-2">Back this project</h2>
              <p className="text-body text-text-secondary mb-6">You're supporting <strong>{campaign.title}</strong></p>

              <form onSubmit={handleDonate} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-text-primary mb-3 block">Select Amount</label>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {PRESET_AMOUNTS.map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${Number(amount) === preset ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-secondary hover:border-primary/50'}`}
                      >
                        ₹{preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <Input
                    type="number"
                    min="100"
                    placeholder="Custom amount (Min ₹100)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-secondary">Donate anonymously</span>
                </label>

                <div className="pt-4">
                  <Button type="submit" className="w-full py-4 text-lg" disabled={loading || !amount || amount < 100}>
                    {loading ? 'Processing...' : `Donate ₹${amount ? Number(amount).toLocaleString() : '0'}`}
                  </Button>
                  <p className="text-xs text-center text-text-secondary mt-4">
                    This is a mock transaction. No real payment will be processed.
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-h2 mb-2">Thank you!</h2>
              <p className="text-body text-text-secondary mb-8">Your mock donation was successful. Your support makes a difference.</p>

              <div className="space-y-3">
                <Button
                  onClick={() => window.open(`http://localhost:5000/api/v1/donations/${receiptId}/receipt`, '_blank')}
                  variant="outline"
                  className="w-full py-3"
                >
                  Download Receipt
                </Button>
                <Button onClick={onClose} className="w-full py-3">
                  Return to Campaign
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
