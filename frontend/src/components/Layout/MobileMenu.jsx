import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { 
  X, 
  Home, 
  BarChart3, 
  CreditCard, 
  Smartphone, 
  Settings,
  Bell,
  User,
  LogOut
} from 'lucide-react';

const MobileMenu = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Balance', href: '/balance', icon: CreditCard },
    { name: 'Device', href: '/device', icon: Smartphone },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const userActions = [
    { name: 'Notifications', icon: Bell, badge: 3 },
    { name: 'Profile', icon: User },
    { name: 'Logout', icon: LogOut },
  ];

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const menuVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 sm:hidden"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl z-50 sm:hidden"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* User Profile Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Supratim Mondal</div>
                  <div className="text-xs text-gray-500">Customer ID: #12345</div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Navigation
              </div>
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* User Actions */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Account
              </div>
              {userActions.map((action) => (
                <button
                  key={action.name}
                  onClick={onClose}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <action.icon className="w-5 h-5" />
                  <span>{action.name}</span>
                </button>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Quick Info
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Balance</span>
                  <span className="text-sm font-semibold text-green-600">₹125.50</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Today's Usage</span>
                  <span className="text-sm font-semibold text-blue-600">2.4 kWh</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Connection</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-900">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200">
              <div className="text-center">
                <div className="text-xs text-gray-500">Energy Meter Dashboard</div>
                <div className="text-xs text-gray-400">v1.0.0</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
