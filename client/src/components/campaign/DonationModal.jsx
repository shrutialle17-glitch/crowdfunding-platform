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
      // 1. Create Order
      const orderRes = await api.post(`/campaigns/${campaign._id}/orders`, {
        amount: Number(amount)
      });
      
      const { order, receiptId: createdReceiptId } = orderRes.data.data;

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
        amount: order.amount, 
        currency: order.currency,
        name: "KindFund",
        description: `Donation for ${campaign.title}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await api.post(`/campaigns/${campaign._id}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: Number(amount),
              isAnonymous,
              receiptId: createdReceiptId
            });

            setReceiptId(verifyRes.data.data._id); // This is the donation ID in Mongo
            setStep('success');
            if (onSuccess) onSuccess();
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            alert('Payment verification failed. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        theme: {
          color: "#04301e" // KindFund dark forest green
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        console.error(response.error);
        alert(response.error.description);
        setLoading(false);
      });
      rzp1.open();

    } catch (error) {
      console.error(error);
      alert('Order creation failed');
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      const response = await api.get(`/donations/${receiptId}/receipt`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${receiptId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download receipt', error);
      alert('Failed to download receipt. Please try again.');
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
                    Secured by Razorpay.
                  </p>
                </div>
              </form>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6 relative"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute inset-0 border-4 border-accent rounded-full"
                />
                <svg className="w-10 h-10 text-accent relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-h2 mb-2 text-primary">Payment Successful!</h2>
              <p className="text-body text-text-secondary mb-8">Thank you for your generous donation. Your support directly helps {campaign.title}.</p>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleDownloadReceipt}
                  variant="outline" 
                  className="w-full py-3 hover:bg-primary/5 border-primary/20"
                >
                  Download Receipt
                </Button>
                <Button onClick={onClose} className="w-full py-3">
                  Return to Campaign
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
