import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Save,
  User,
  CreditCard,
  Smartphone
} from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      lowBalance: true,
      highConsumption: true,
      deviceOffline: true,
      maintenanceReminders: false,
      weeklyReports: true,
    },
    preferences: {
      theme: 'light',
      language: 'en',
      currency: 'INR',
      timeFormat: '24h',
    },
    alerts: {
      lowBalanceThreshold: 50,
      highConsumptionThreshold: 80,
      disconnectionWarning: true,
    }
  });

  const handleNotificationChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleAlertChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      alerts: {
        ...prev.alerts,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // Save settings logic here
    toast.success('Settings saved successfully!');
  };

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-12 h-6 rounded-full p-1 transition-colors ${
        enabled ? 'bg-green-500' : 'bg-gray-300'
      }`}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'transform translate-x-6' : ''
        }`}
      />
    </button>
  );

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Customize your energy meter dashboard experience</p>
        </div>
        
        <button 
          onClick={handleSave}
          className="btn-primary flex items-center space-x-2 mt-4 sm:mt-0"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">Configure when and how you receive alerts</p>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {key === 'lowBalance' && 'Get notified when balance is running low'}
                      {key === 'highConsumption' && 'Alerts for unusual energy consumption'}
                      {key === 'deviceOffline' && 'Notify when device goes offline'}
                      {key === 'maintenanceReminders' && 'Scheduled maintenance reminders'}
                      {key === 'weeklyReports' && 'Weekly consumption summary reports'}
                    </div>
                  </div>
                  <ToggleSwitch 
                    enabled={value} 
                    onChange={(newValue) => handleNotificationChange(key, newValue)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Alert Thresholds</h3>
                <p className="text-sm text-gray-600">Set custom thresholds for alerts</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Balance Threshold (₹)
                </label>
                <input
                  type="number"
                  value={settings.alerts.lowBalanceThreshold}
                  onChange={(e) => handleAlertChange('lowBalanceThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  High Consumption Threshold (% above average)
                </label>
                <input
                  type="number"
                  value={settings.alerts.highConsumptionThreshold}
                  onChange={(e) => handleAlertChange('highConsumptionThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Disconnection Warning</div>
                  <div className="text-sm text-gray-600">Warn before automatic disconnection</div>
                </div>
                <ToggleSwitch 
                  enabled={settings.alerts.disconnectionWarning} 
                  onChange={(value) => handleAlertChange('disconnectionWarning', value)}
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
                <p className="text-sm text-gray-600">Customize your dashboard appearance</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select
                  value={settings.preferences.theme}
                  onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={settings.preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="bn">Bengali</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={settings.preferences.currency}
                  onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
                <select
                  value={settings.preferences.timeFormat}
                  onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="12h">12 Hour</option>
                  <option value="24h">24 Hour</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="font-medium text-gray-900">Supratim Mondal</div>
              <div className="text-sm text-gray-600">Customer ID: #12345</div>
            </div>

            <button className="btn-secondary w-full mt-4">
              Edit Profile
            </button>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Payment Methods</div>
                  <div className="text-sm text-gray-600">Manage cards & UPI</div>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Smartphone className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Mobile App</div>
                  <div className="text-sm text-gray-600">Download our app</div>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                <Globe className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">API Access</div>
                  <div className="text-sm text-gray-600">Developer settings</div>
                </div>
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
            
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                Need help? Contact our support team.
              </div>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Email:</span> support@energymeter.com
                </div>
                <div className="text-sm">
                  <span className="font-medium">Phone:</span> +91 12345 67890
                </div>
                <div className="text-sm">
                  <span className="font-medium">Hours:</span> 24/7 Support
                </div>
              </div>

              <button className="btn-primary w-full text-sm">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
