import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import BottomNavigation from './components/Layout/BottomNavigation';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Balance from './pages/Balance';
import Device from './pages/Device';
import Settings from './pages/Settings';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Hooks
import { useLocalStorage } from './hooks';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate app initialization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="flex h-screen bg-gray-50 overflow-hidden">
          {/* Sidebar - Desktop: Always visible, Mobile: Overlay when open */}
          <div className="hidden lg:block lg:flex-shrink-0">
            <div className="flex flex-col w-64 h-full">
              <Sidebar 
                isOpen={true} 
                onClose={() => {}} 
              />
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          <div className="lg:hidden">
            <Sidebar 
              isOpen={sidebarOpen} 
              onClose={() => setSidebarOpen(false)} 
            />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Header */}
            <Header 
              onMenuClick={() => setSidebarOpen(true)}
              theme={theme}
              onThemeChange={setTheme}
            />



            {/* Page content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6 pb-20 sm:pb-6">
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/balance" element={<Balance />} />
                  <Route path="/device" element={<Device />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </div>
            </main>
          </div>

          {/* Bottom Navigation - Mobile Only */}
          <BottomNavigation />

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            containerStyle={{
              zIndex: 9999,
            }}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
