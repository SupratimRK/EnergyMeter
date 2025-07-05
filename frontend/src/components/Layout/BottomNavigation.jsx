import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BarChart3, 
  CreditCard, 
  Smartphone, 
  Settings
} from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Balance', href: '/balance', icon: CreditCard },
    { name: 'Device', href: '/device', icon: Smartphone },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50">
      <div 
        className="glass-card border-0 shadow-2xl"
        style={{
          borderRadius: '24px 24px 0 0',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '12px 16px 24px'
        }}
      >
        <div className="grid grid-cols-5 gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
                           (item.href === '/dashboard' && location.pathname === '/');
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`relative flex flex-col items-center justify-center space-y-1 p-3 rounded-2xl text-xs font-semibold transition-all duration-300 touch-target ${
                  isActive
                    ? 'text-white'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {/* Background for active item */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg"
                    layoutId="bottomNavBackground"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Glow effect for active item */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-md"
                    layoutId="bottomNavGlow"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                {/* Icon and label */}
                <div className="relative z-10 flex flex-col items-center space-y-1">
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${
                    isActive ? 'text-white scale-110' : 'text-neutral-500'
                  }`} />
                  <span className={`transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-neutral-500'
                  }`}>
                    {item.name}
                  </span>
                </div>
              </NavLink>
            );
          })}
        </div>
        
        {/* Home indicator */}
        <div className="flex justify-center mt-2">
          <div className="w-32 h-1 bg-neutral-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
