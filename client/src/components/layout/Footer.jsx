import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Footer = () => {
  const location = useLocation();
  const isMinimal = location.pathname === '/login' || location.pathname === '/register';

  if (isMinimal) {
    return (
      <footer className="py-6 text-center text-sm text-text-secondary border-t border-border mt-auto">
        &copy; {new Date().getFullYear()} KindFund
      </footer>
    );
  }

  return (
    <footer className="bg-surface border-t border-border pt-16 pb-8 mt-auto">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-h3 text-primary font-heading font-bold mb-4">KindFund</h2>
            <p className="text-body text-text-secondary max-w-md">
              Empowering communities through transparent, trustworthy crowdfunding. Join us in making a difference, one campaign at a time.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Explore</h4>
            <ul className="space-y-3">
              <li><Link to="/explore" className="text-text-secondary hover:text-primary transition-colors">Browse Campaigns</Link></li>
              <li><Link to="/leaderboard" className="text-text-secondary hover:text-primary transition-colors">Leaderboard</Link></li>
              <li><Link to="/transparency" className="text-text-secondary hover:text-primary transition-colors">Transparency</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-text-secondary hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-text-secondary hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link to="/terms" className="text-text-secondary hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-secondary">&copy; {new Date().getFullYear()} KindFund. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-text-secondary hover:text-primary transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
