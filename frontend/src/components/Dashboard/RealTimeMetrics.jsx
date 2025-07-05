import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  Battery, 
  Gauge,
  TrendingUp,
  TrendingDown,
  Wifi,
  WifiOff
} from 'lucide-react';

import { formatElectricalValue, formatPowerValue, parseNumericValue } from '../../utils';

const RealTimeMetrics = ({ data, isLoading, connectionStatus }) => {
  const metrics = [
    {
      id: 'voltage',
      label: 'Voltage',
      value: data?.voltage || '0V',
      icon: Zap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'stable',
    },
    {
      id: 'current',
      label: 'Current',
      value: data?.current || '0A',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'up',
    },
    {
      id: 'power',
      label: 'Active Power',
      value: data?.active_power || '0kW',
      icon: Gauge,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'up',
    },
    {
      id: 'power_factor',
      label: 'Power Factor',
      value: data?.power_factor ? data.power_factor.toFixed(3) : '0.000',
      icon: Battery,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: 'stable',
    },
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4" />;
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'Connected':
        return <Wifi className="w-5 h-5 text-green-500" />;
      case 'Connecting':
        return <Wifi className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default:
        return <WifiOff className="w-5 h-5 text-red-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-8 bg-gray-200 rounded"></div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <motion.div 
        className="flex items-center justify-between bg-white rounded-lg p-4 shadow-soft border border-gray-100"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-2">
          {getConnectionIcon()}
          <span className="text-sm font-medium text-gray-700">
            Connection Status: {connectionStatus}
          </span>
        </div>
        {data?.timestamp && (
          <span className="text-xs text-gray-500">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </span>
        )}
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            className="metric-card group hover:shadow-soft-lg transition-all duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${metric.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              {getTrendIcon(metric.trend)}
            </div>

            {/* Value */}
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {metric.value}
              </div>
              <div className="text-sm text-gray-600">
                {metric.label}
              </div>
            </div>

            {/* Live indicator */}
            {connectionStatus === 'Connected' && (
              <div className="absolute top-2 right-2">
                <div className="relative">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="pulse-ring"></div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Additional Metrics Row */}
      {data && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {/* Reactive Power */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Reactive Power</span>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-xl font-bold text-gray-900">
              {data.reactive_power || '0kVAR'}
            </div>
          </div>

          {/* Apparent Power */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Apparent Power</span>
              <Zap className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-xl font-bold text-gray-900">
              {data.apparent_power || '0kVA'}
            </div>
          </div>

          {/* Frequency */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Frequency</span>
              <Gauge className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-xl font-bold text-gray-900">
              {data.frequency || '0Hz'}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RealTimeMetrics;
