import React from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  Sun, 
  Moon,
  Wifi,
  WifiOff
} from 'lucide-react';

import { useRealTimeData } from '../../hooks';
import { formatTime } from '../../utils';

const Header = ({ onMenuClick, onMobileMenuClick, theme, onThemeChange }) => {
  const { connectionStatus } = useRealTimeData();

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'Connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'Connecting':
        return <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <motion.header 
      className="bg-white shadow-soft border-b border-gray-200 px-4 lg:px-6 py-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Menu button for sidebar - visible on tablet and below */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden touch-manipulation"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Mobile menu button - visible on mobile only */}
          <button
            onClick={onMobileMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors sm:hidden touch-manipulation"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* App title on mobile */}
          <div className="sm:hidden">
            <h1 className="text-lg font-bold text-gray-900">Energy Meter</h1>
          </div>

          {/* Search bar - hidden on mobile, shown on larger screens */}
          <div className="hidden md:block relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search meters, transactions..."
              className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Center - Current Time - only on desktop */}
        <div className="hidden xl:flex items-center space-x-2 text-sm text-gray-600">
          <span>Last updated: {formatTime(new Date())}</span>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Connection Status - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
            {getConnectionIcon()}
            <span className="text-sm text-gray-600">{connectionStatus}</span>
          </div>

          {/* Connection Status - mobile version (icon only) */}
          <div className="md:hidden flex items-center p-2 rounded-lg">
            {getConnectionIcon()}
          </div>

          {/* Search button - mobile only */}
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
            onClick={() => {
              // Open mobile search modal
              console.log('Open mobile search');
            }}
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation" aria-label="Notifications">
            <Bell className="w-5 h-5 text-gray-600" />
            {/* Notification badge */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">3</span>
            </div>
          </button>

          {/* User menu - only on larger screens */}
          <div className="hidden sm:block relative">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden lg:block text-sm font-medium text-gray-700">Supratim Mondal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search bar - shows when search button is clicked */}
      <div className="md:hidden mt-4 hidden" id="mobile-search">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search meters, transactions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
