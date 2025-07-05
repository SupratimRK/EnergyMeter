import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Wifi, 
  WifiOff, 
  Power, 
  PowerOff,
  Thermometer,
  Signal,
  Clock,
  Settings
} from 'lucide-react';

import { deviceApi } from '../../services/api';
import { formatDateTime } from '../../utils';

const DeviceStatus = ({ data, isLoading }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const deviceInfo = {
    status: data?.status || 'unknown',
    connection: data?.connection_status || 'offline',
    temperature: data?.temperature || 25,
    signalStrength: data?.signal_strength || 75,
    lastSeen: data?.last_seen || new Date().toISOString(),
    uptime: data?.uptime || 0,
    firmwareVersion: data?.firmware_version || '1.0.0',
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'active':
        return { color: 'text-green-600', bgColor: 'bg-green-50', icon: Wifi };
      case 'disconnected':
        return { color: 'text-red-600', bgColor: 'bg-red-50', icon: WifiOff };
      case 'maintenance':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: Settings };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-50', icon: WifiOff };
    }
  };

  const statusInfo = getStatusColor(deviceInfo.connection);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await deviceApi.reconnect('Manual reconnection from dashboard');
      toast.success('Device connected successfully');
      // Refresh the component or trigger a refetch
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Failed to connect device');
      console.error('Connect error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await deviceApi.disconnect('Manual disconnection from dashboard');
      toast.success('Device disconnected successfully');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Failed to disconnect device');
      console.error('Disconnect error:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="w-20 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="w-32 h-8 bg-gray-200 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="card group hover:shadow-soft-lg transition-all duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
            <statusInfo.icon className={`w-6 h-6 ${statusInfo.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Device Status</h3>
            <p className="text-sm text-gray-600">Smart Energy Meter</p>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className={`status-indicator ${
          deviceInfo.connection === 'connected' ? 'status-active' :
          deviceInfo.connection === 'disconnected' ? 'status-danger' : 'status-warning'
        }`}>
          <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></div>
          {deviceInfo.connection.charAt(0).toUpperCase() + deviceInfo.connection.slice(1)}
        </div>
      </div>

      {/* Device Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Temperature */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Thermometer className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Temperature</div>
            <div className="font-semibold text-gray-900">{deviceInfo.temperature}°C</div>
          </div>
        </div>

        {/* Signal Strength */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Signal className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Signal</div>
            <div className="font-semibold text-gray-900">{deviceInfo.signalStrength}%</div>
          </div>
        </div>

        {/* Uptime */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-green-100 rounded-lg">
            <Clock className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Uptime</div>
            <div className="font-semibold text-gray-900">{formatUptime(deviceInfo.uptime)}</div>
          </div>
        </div>

        {/* Firmware */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Settings className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-sm text-gray-600">Firmware</div>
            <div className="font-semibold text-gray-900">v{deviceInfo.firmwareVersion}</div>
          </div>
        </div>
      </div>

      {/* Last Seen */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-1">Last Communication</div>
        <div className="text-sm font-medium text-gray-900">
          {formatDateTime(deviceInfo.lastSeen)}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-3">
        {deviceInfo.connection === 'connected' ? (
          <button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="btn-danger flex-1 flex items-center justify-center space-x-2"
          >
            {isDisconnecting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <PowerOff className="w-4 h-4" />
                <span>Disconnect</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="btn-success flex-1 flex items-center justify-center space-x-2"
          >
            {isConnecting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Power className="w-4 h-4" />
                <span>Connect</span>
              </>
            )}
          </button>
        )}
        
        <button className="btn-secondary px-4">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Health Indicator */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-600">Device Health</span>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div
                key={bar}
                className={`w-1 h-3 rounded-full ${
                  bar <= Math.floor(deviceInfo.signalStrength / 20)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>
          <span className={`font-medium ${
            deviceInfo.signalStrength > 70 ? 'text-green-600' :
            deviceInfo.signalStrength > 30 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {deviceInfo.signalStrength > 70 ? 'Excellent' :
             deviceInfo.signalStrength > 30 ? 'Good' : 'Poor'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default DeviceStatus;
