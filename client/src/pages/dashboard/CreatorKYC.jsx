import React, { useState } from 'react';
import api from '../../api/axios';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CreatorKYC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [idDoc, setIdDoc] = useState([]);
  const [selfie, setSelfie] = useState([]);
  const [addressProof, setAddressProof] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (idDoc.length === 0 || selfie.length === 0 || addressProof.length === 0) {
      alert('Please upload all required documents.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('idDocument', idDoc[0]);
      formData.append('selfie', selfie[0]);
      formData.append('addressProof', addressProof[0]);

      await api.post('/kyc/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('KYC submitted successfully! Waiting for admin approval.');
      navigate('/creator');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error?.message || 'Failed to submit KYC.');
    } finally {
      setLoading(false);
    }
  };

  if (user?.isVerified) {
    return (
      <DashboardLayout role="creator">
        <div className="space-y-6">
          <h2 className="text-h2">Identity Verification</h2>
          <Card className="p-12 text-center border border-success/30 bg-success/5">
            <ShieldCheck className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-success mb-2">Account Verified</h3>
            <p className="text-text-secondary">Your identity has been successfully verified. You have full access to platform features.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="creator">
      <div className="space-y-6">
        <div>
          <h2 className="text-h2">Identity Verification (KYC)</h2>
          <p className="text-body text-text-secondary mt-1">Submit your documents to verify your identity and build trust with donors.</p>
        </div>

        <Card className="p-6 border border-warning/30 bg-warning/5 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-warning mb-1">Verification Required</h4>
            <p className="text-sm text-warning/80">Unverified creators have lower trust scores and may face limits on withdrawals. Completing KYC takes less than 5 minutes.</p>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-8 bg-surface p-8 rounded-3xl shadow-warm-md border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold">1. Government ID</h3>
              <p className="text-sm text-text-secondary mb-4">Upload a clear photo of your passport, driver's license, or national ID card.</p>
              <ImageUploader 
                label="Upload ID" 
                files={idDoc} 
                setFiles={setIdDoc} 
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">2. Selfie Match</h3>
              <p className="text-sm text-text-secondary mb-4">Upload a clear selfie of yourself holding the ID you provided.</p>
              <ImageUploader 
                label="Upload Selfie" 
                files={selfie} 
                setFiles={setSelfie} 
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">3. Proof of Address</h3>
              <p className="text-sm text-text-secondary mb-4">Upload a recent utility bill, bank statement, or official document showing your name and address.</p>
              <ImageUploader 
                label="Upload Address Proof" 
                files={addressProof} 
                setFiles={setAddressProof} 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
            <Button type="submit" className="px-8 py-3 text-lg" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Documents'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
