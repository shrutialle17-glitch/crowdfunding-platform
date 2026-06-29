import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      // Return empty array if not logged in
      try {
        const res = await api.get('/notifications');
        return res.data.data;
      } catch {
        return [];
      }
    },
    // In a real app, we might poll this or use websockets
  });

  const markReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markReadMutation.mutate();
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={handleOpen}
        className="relative p-2 text-text-secondary hover:text-primary transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-surface animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-surface rounded-2xl shadow-warm-lg border border-border overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{unreadCount} new</span>}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications?.length > 0 ? (
                notifications.map(notif => (
                  <div key={notif._id} className={`p-4 border-b border-border hover:bg-background/50 transition-colors ${notif.isRead ? 'opacity-70' : 'bg-primary/5'}`}>
                    <p className="text-sm font-semibold mb-1">{notif.title}</p>
                    <p className="text-xs text-text-secondary line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-text-secondary mt-2">{new Date(notif.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-sm text-text-secondary">
                  No notifications yet.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
