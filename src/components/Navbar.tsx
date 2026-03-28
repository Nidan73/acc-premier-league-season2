/**
 * Navbar Component
 * Navigation bar displayed on all pages
 */

import { Link, useLocation } from 'react-router-dom';
import { Home, Gavel, Trophy, Shield, Settings, Monitor } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const location = useLocation();
  const { isAdmin, auctionState } = useApp();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/auction', label: 'Auction', icon: Gavel },
    { path: '/league', label: 'League', icon: Trophy },
    { path: '/live', label: 'Live', icon: Monitor },
    { path: '/admin', label: 'Admin', icon: Settings },
  ];

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <span className="font-bold text-lg hidden sm:inline">ACC Futsal League</span>
            <span className="font-bold text-lg sm:hidden">ACCPL</span>
          </Link>
          
          {/* Live Indicator */}
          {auctionState.phase === 'BIDDING' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              <span className="text-sm font-medium">LIVE</span>
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              // Show admin badge if logged in
              const showAdminBadge = item.path === '/admin' && isAdmin;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                    ${active 
                      ? 'bg-white/20 font-semibold' 
                      : 'hover:bg-white/10'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="hidden md:inline">{item.label}</span>
                  {showAdminBadge && (
                    <Shield size={14} className="text-green-300" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
