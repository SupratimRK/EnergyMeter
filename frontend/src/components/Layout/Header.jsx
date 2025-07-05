import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  Sun, 
  Moon,
  Wifi,
  WifiOff,
  ChevronDown,
  Settings,
  LogOut,
  Command
} from 'lucide-react';

import { useRealTimeData } from '../../hooks';
import { formatTime } from '../../utils';

const Header = ({ onMenuClick, theme, onThemeChange }) => {
  const { connectionStatus } = useRealTimeData();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const userButtonRef = React.useRef(null);

  const handleUserMenuToggle = () => {
    if (!isUserMenuOpen && userButtonRef.current) {
      const rect = userButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && userButtonRef.current && !userButtonRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'Connected':
        return <Wifi className="w-4 h-4 text-emerald-500" />;
      case 'Connecting':
        return <Wifi className="w-4 h-4 text-amber-500 animate-pulse" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const getConnectionBadgeColor = () => {
    switch (connectionStatus) {
      case 'Connected':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Connecting':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  return (
    <motion.header 
      className="glass-card border-b-0 border-x-0 border-t-0 px-4 lg:px-6 py-4"
      style={{
        borderRadius: '0 0 24px 24px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Menu button for sidebar */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-3 rounded-2xl hover:bg-white/70 transition-all duration-300 touch-target group"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5 text-neutral-600 group-hover:text-neutral-800 transition-colors" />
          </button>

          {/* App title on mobile */}
          <div className="sm:hidden">
            <h1 className="text-lg font-bold text-gradient">EnergyMeter</h1>
          </div>

          {/* Search bar - desktop */}
          <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search meters, transactions, analytics..."
              className="w-96 pl-12 pr-6 py-3 bg-white/80 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm font-medium placeholder-neutral-400 transition-all duration-300"
              style={{
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="flex items-center space-x-1 px-2 py-1 bg-neutral-100 rounded-lg">
                <Command className="w-3 h-3 text-neutral-500" />
                <span className="text-xs text-neutral-500 font-medium">K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Status and Time */}
        <div className="hidden xl:flex items-center space-x-6">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl border text-sm font-medium ${getConnectionBadgeColor()}`}>
            {getConnectionIcon()}
            <span>{connectionStatus}</span>
          </div>
          
          <div className="text-sm text-neutral-600 font-medium">
            Last updated: {formatTime(new Date())}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-3">

          {/* Search button - mobile */}
          <button
            className="sm:hidden p-3 rounded-2xl hover:bg-white/70 transition-all duration-300 touch-target"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-neutral-600" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            className="p-3 rounded-2xl hover:bg-white/70 transition-all duration-300 touch-target group"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-neutral-600 group-hover:text-neutral-800 transition-colors" />
            ) : (
              <Sun className="w-5 h-5 text-neutral-600 group-hover:text-neutral-800 transition-colors" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-3 rounded-2xl hover:bg-white/70 transition-all duration-300 touch-target group" aria-label="Notifications">
            <Bell className="w-5 h-5 text-neutral-600 group-hover:text-neutral-800 transition-colors" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xs text-white font-bold">3</span>
            </div>
          </button>

          {/* User menu */}
          <div className="hidden sm:block relative">
            <button 
              ref={userButtonRef}
              onClick={handleUserMenuToggle}
              className="flex items-center space-x-3 p-3 rounded-2xl hover:bg-white/70 transition-all duration-300 touch-target group"
            >
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden lg:block text-sm font-semibold text-neutral-700 group-hover:text-neutral-800">Supratim Mondal</span>
              <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && createPortal(
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="fixed w-64 bg-white border border-gray-200 shadow-xl rounded-2xl"
                  style={{ 
                    top: dropdownPosition.top,
                    right: dropdownPosition.right,
                    zIndex: 99999,
                    borderRadius: '16px'
                  }}
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="text-sm font-semibold text-gray-900">Supratim Mondal</div>
                    <div className="text-xs text-gray-500">Customer ID: #12345</div>
                    <div className="text-xs text-gray-500 break-all">supratim.mondal@email.com</div>
                  </div>
                  
                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-700">
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 transition-all duration-200 text-sm font-medium text-red-600">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>,
              document.body
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 overflow-hidden"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Search meters, transactions..."
                className="w-full pl-12 pr-4 py-3 bg-white/80 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm font-medium placeholder-neutral-400"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
