import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QRShareModal = ({ isOpen, onClose, url, title }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && url) {
      QRCode.toDataURL(url, { width: 200, margin: 2, color: { dark: '#243B53', light: '#FFFFFF' } })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error(err));
    }
  }, [isOpen, url]);

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface w-full max-w-sm rounded-3xl shadow-warm-lg border border-border p-6 relative text-center"
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-text-secondary hover:bg-border rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-h4 mb-2">Share Campaign</h3>
          <p className="text-sm text-text-secondary mb-6">{title}</p>

          {qrCodeUrl && (
            <div className="mx-auto w-48 h-48 rounded-2xl overflow-hidden border border-border mb-6 flex items-center justify-center bg-white p-2">
              <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
            </div>
          )}

          <div className="flex items-center gap-2 bg-background border border-border rounded-xl p-2 pl-4">
            <span className="text-sm text-text-secondary truncate flex-1">{url}</span>
            <button
              onClick={copyLink}
              className="bg-surface p-2 rounded-lg border border-border hover:bg-border transition-colors text-text-primary"
            >
              {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
