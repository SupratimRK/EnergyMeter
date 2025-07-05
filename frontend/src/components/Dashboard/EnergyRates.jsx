import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, Zap } from 'lucide-react';

import { useApi } from '../../hooks';
import { configApi } from '../../services/api';

const EnergyRates = () => {
  const { data: ratesData, isLoading } = useApi(configApi.getRates, []);

  const rates = ratesData?.data?.rates || [
    { name: 'Off-Peak', rate_per_kwh: 4.50, start_time: '00:00', end_time: '06:00' },
    { name: 'Normal', rate_per_kwh: 6.00, start_time: '06:00', end_time: '18:00' },
    { name: 'Peak', rate_per_kwh: 8.50, start_time: '18:00', end_time: '23:59' },
  ];

  const getCurrentRate = () => {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    for (const rate of rates) {
      const startTime = parseInt(rate.start_time.replace(':', ''));
      const endTime = parseInt(rate.end_time.replace(':', ''));
      
      if (currentTime >= startTime && currentTime <= endTime) {
        return rate;
      }
    }
    
    return rates[1]; // Default to normal rate
  };

  const currentRate = getCurrentRate();

  const getRateColor = (rateName) => {
    switch (rateName.toLowerCase()) {
      case 'off-peak':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'peak':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 bg-yellow-50 rounded-lg">
          <DollarSign className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Energy Rates</h3>
          <p className="text-sm text-gray-600">Current pricing</p>
        </div>
      </div>

      {/* Current Rate Highlight */}
      <div className={`p-4 rounded-lg border-2 mb-4 ${getRateColor(currentRate.name)}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span className="font-semibold">Current Rate: {currentRate.name}</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              ₹{currentRate.rate_per_kwh.toFixed(2)}/kWh
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">Active until</div>
            <div className="font-medium">{currentRate.end_time}</div>
          </div>
        </div>
      </div>

      {/* All Rates */}
      <div className="space-y-3">
        {rates.map((rate, index) => (
          <motion.div
            key={rate.name}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              rate.name === currentRate.name 
                ? getRateColor(rate.name)
                : 'border-gray-200 hover:border-gray-300'
            }`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {rate.start_time} - {rate.end_time}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{rate.name}</div>
                <div className="text-lg font-bold text-gray-900">
                  ₹{rate.rate_per_kwh.toFixed(2)}/kWh
                </div>
              </div>
            </div>
            
            {rate.name === currentRate.name && (
              <div className="mt-2 flex items-center space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Currently Active</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Rate Comparison */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2">Today's Rate Comparison</div>
        <div className="grid grid-cols-3 gap-2">
          {rates.map((rate) => (
            <div key={rate.name} className="text-center">
              <div className={`text-xs font-medium ${
                rate.name === 'Off-Peak' ? 'text-green-600' :
                rate.name === 'Peak' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {rate.name}
              </div>
              <div className="text-sm font-bold text-gray-900">
                ₹{rate.rate_per_kwh.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Rate Change */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Next rate change</span>
          <span className="text-sm font-medium text-gray-900">
            {getCurrentNextRateChange(rates, currentRate)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Helper function to get next rate change
const getCurrentNextRateChange = (rates, currentRate) => {
  const now = new Date();
  const currentTime = now.getHours() * 100 + now.getMinutes();
  
  // Find the next rate after current time
  const sortedRates = [...rates].sort((a, b) => {
    const aStart = parseInt(a.start_time.replace(':', ''));
    const bStart = parseInt(b.start_time.replace(':', ''));
    return aStart - bStart;
  });
  
  for (const rate of sortedRates) {
    const startTime = parseInt(rate.start_time.replace(':', ''));
    if (startTime > currentTime) {
      return `${rate.start_time} (${rate.name})`;
    }
  }
  
  // If no rate found for today, show tomorrow's first rate
  return `${sortedRates[0].start_time} tomorrow (${sortedRates[0].name})`;
};

export default EnergyRates;
