import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Power,
  Wifi,
  Battery,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Thermometer,
  Calendar
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import { useApi } from '../hooks';
import { deviceApi, historicalApi } from '../services/api';

const Device = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: deviceStatus, isLoading, refetch } = useApi(deviceApi.getStatus, []);
  const { data: deviceConfig } = useApi(deviceApi.getConfig, []);
  const { data: historicalData } = useApi(historicalApi.getHistorical, []);

  // Mock device data with fallbacks
  const deviceInfo = {
    id: deviceStatus?.deviceId || 'MTR-001',
    name: 'Smart Energy Meter',
    model: 'SEM-2024',
    firmware: deviceStatus?.firmware || 'v2.1.4',
    lastSeen: deviceStatus?.lastSeen || new Date().toISOString(),
    status: deviceStatus?.status || 'online',
    signalStrength: deviceStatus?.signalStrength || 85,
    batteryLevel: deviceStatus?.batteryLevel || 92,
    temperature: deviceStatus?.temperature || 28.5,
    uptime: deviceStatus?.uptime || '15 days, 6 hours'
  };

  // Sample performance data
  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    voltage: 220 + Math.random() * 20 - 10,
    current: 5 + Math.random() * 3,
    power: 1000 + Math.random() * 500,
    frequency: 50 + Math.random() * 2 - 1
  }));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh device data:', error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const handleRestart = () => {
    // Mock restart functionality
    alert('Device restart command sent successfully!');
  };

  const handleFactoryReset = () => {
    if (window.confirm('Are you sure you want to factory reset the device? This action cannot be undone.')) {
      alert('Factory reset command sent successfully!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50';
      case 'offline': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle className="w-5 h-5" />;
      case 'offline': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}
              {entry.name === 'voltage' ? 'V' : 
               entry.name === 'current' ? 'A' : 
               entry.name === 'power' ? 'W' : 
               entry.name === 'frequency' ? 'Hz' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
          <p className="text-gray-600 mt-1">Monitor and control your smart energy meter</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Device Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Device Information</h3>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deviceInfo.status)}`}>
                {getStatusIcon(deviceInfo.status)}
                {deviceInfo.status.charAt(0).toUpperCase() + deviceInfo.status.slice(1)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Device ID</p>
                  <p className="font-medium text-gray-900">{deviceInfo.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-medium text-gray-900">{deviceInfo.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Firmware Version</p>
                  <p className="font-medium text-gray-900">{deviceInfo.firmware}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Seen</p>
                  <p className="font-medium text-gray-900">
                    {new Date(deviceInfo.lastSeen).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Signal Strength</p>
                    <p className="font-medium text-gray-900">{deviceInfo.signalStrength}%</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Battery className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Battery Level</p>
                    <p className="font-medium text-gray-900">{deviceInfo.batteryLevel}%</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="font-medium text-gray-900">{deviceInfo.temperature}°C</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Uptime</p>
                    <p className="font-medium text-gray-900">{deviceInfo.uptime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleRestart}
                className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Power className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Restart Device</p>
                  <p className="text-sm text-gray-600">Reboot the device</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Device Settings</p>
                  <p className="text-sm text-gray-600">Configure device parameters</p>
                </div>
              </button>
              
              <button 
                onClick={handleFactoryReset}
                className="w-full flex items-center gap-3 p-3 text-left border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Factory Reset</p>
                  <p className="text-sm text-red-600">Reset to default settings</p>
                </div>
              </button>
            </div>
          </div>

          {/* System Health */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">CPU Usage</span>
                  <span className="font-medium">23%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Memory Usage</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Storage Used</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Voltage & Current</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="voltage" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  name="voltage"
                />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                  name="current"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Power Consumption</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="power" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="power"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Events</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">Device Connected</p>
              <p className="text-sm text-green-700">Successfully established connection</p>
              <p className="text-xs text-green-600 mt-1">2 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Data Sync Completed</p>
              <p className="text-sm text-blue-700">Latest consumption data synchronized</p>
              <p className="text-xs text-blue-600 mt-1">15 minutes ago</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Low Battery Warning</p>
              <p className="text-sm text-yellow-700">Battery level below 95%</p>
              <p className="text-xs text-yellow-600 mt-1">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Device;
