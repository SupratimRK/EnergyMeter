import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  CreditCard, 
  Smartphone, 
  Settings, 
  Zap,
  X,
  Activity
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      description: 'Overview & metrics'
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3,
      description: 'Detailed insights'
    },
    { 
      name: 'Balance', 
      href: '/balance', 
      icon: CreditCard,
      description: 'Account & payments'
    },
    { 
      name: 'Device', 
      href: '/device', 
      icon: Smartphone,
      description: 'Meter management'
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      description: 'Configuration'
    },
  ];

  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    closed: { 
      x: '-100%',
      transition: { type: "spring", stiffness: 300, damping: 30 }
    }
  };

  const itemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside
        className="fixed inset-y-0 left-0 z-50 w-72 h-full glass-card border-r-0 lg:relative lg:translate-x-0"
        variants={sidebarVariants}
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        style={{
          borderRadius: '0 24px 24px 0',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">EnergyMeter</h1>
                  <p className="text-xs text-neutral-500 font-medium">Smart Dashboard</p>
                </div>
              </div>
              
              {/* Close button for mobile */}
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-xl hover:bg-white/50 transition-all touch-target"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 px-3">
              Navigation
            </div>
            
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                             (item.href === '/dashboard' && location.pathname === '/');
              
              return (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  transition={{ delay: index * 0.1 }}
                >
                  <NavLink
                    to={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={({ isActive: linkActive }) => {
                      const active = linkActive || isActive;
                      return `group relative flex items-center space-x-4 p-4 rounded-2xl text-sm font-medium transition-all duration-300 touch-target ${
                        active
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'text-neutral-600 hover:bg-white/70 hover:text-neutral-800'
                      }`;
                    }}
                  >
                    {/* Background Glow for Active Item */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl"
                        layoutId="activeGlow"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    <div className="relative z-10 flex items-center space-x-4 w-full">
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                        isActive ? 'text-white scale-110' : 'text-neutral-500 group-hover:scale-105'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold ${isActive ? 'text-white' : 'text-neutral-800'}`}>
                          {item.name}
                        </div>
                        <div className={`text-xs ${isActive ? 'text-white/80' : 'text-neutral-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                    
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute right-2 w-2 h-2 bg-white rounded-full shadow-lg"
                        layoutId="activeIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </NavLink>
                </motion.div>
              );
            })}
          </nav>

          {/* Meter Status Card */}
          <div className="p-4">
            <div className="metric-card bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-emerald-800">Meter Status</div>
                  <div className="text-xs text-emerald-600 font-medium">Online & Active</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-700 font-medium">Signal Strength</span>
                  <span className="font-bold text-emerald-800">95%</span>
                </div>
                <div className="w-full bg-emerald-200 rounded-full h-2.5 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2.5 rounded-full shadow-sm"
                    initial={{ width: 0 }}
                    animate={{ width: '95%' }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-medium">Real-time monitoring active</span>
                </div>
              </div>
            </div>
          </div>


        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
