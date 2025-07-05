import React from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { TrendingUp, Calendar, Zap } from 'lucide-react';

import { useApi } from '../../hooks';
import { historicalApi } from '../../services/api';
import { parseNumericValue } from '../../utils';

const ConsumptionOverview = () => {
  const { data: weeklyData, isLoading, error } = useApi(historicalApi.getWeekly, []);

  // Mock data for demonstration - in real app, this would come from API
  const consumptionByHour = [
    { hour: '6AM', consumption: 2.1 },
    { hour: '9AM', consumption: 3.5 },
    { hour: '12PM', consumption: 4.2 },
    { hour: '3PM', consumption: 3.8 },
    { hour: '6PM', consumption: 5.1 },
    { hour: '9PM', consumption: 4.6 },
  ];

  const consumptionByCategory = [
    { name: 'Peak Hours', value: 35, color: '#ef4444' },
    { name: 'Normal Hours', value: 45, color: '#3b82f6' },
    { name: 'Off-Peak Hours', value: 20, color: '#10b981' },
  ];

  // Fallback data for when API fails
  const fallbackWeeklyData = [
    { day: 'Mon', consumption: 12.5, cost: 87.5 },
    { day: 'Tue', consumption: 15.2, cost: 106.4 },
    { day: 'Wed', consumption: 11.8, cost: 82.6 },
    { day: 'Thu', consumption: 14.1, cost: 98.7 },
    { day: 'Fri', consumption: 16.3, cost: 114.1 },
    { day: 'Sat', consumption: 13.7, cost: 95.9 },
    { day: 'Sun', consumption: 10.9, cost: 76.3 },
  ];

  const weeklyConsumption = weeklyData?.data?.daily_breakdown?.map(day => ({
    day: new Date(day.date).toLocaleDateString('en', { weekday: 'short' }),
    consumption: parseNumericValue(day.energy_consumed),
    cost: parseNumericValue(day.cost),
  })) || (error ? fallbackWeeklyData : []);

  const totalWeeklyConsumption = weeklyConsumption.reduce((sum, day) => sum + day.consumption, 0);
  const totalWeeklyCost = weeklyConsumption.reduce((sum, day) => sum + day.cost, 0);
  const averageDailyConsumption = totalWeeklyConsumption / (weeklyConsumption.length || 1);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)} kWh
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gray-200 rounded"></div>
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
        <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-200 rounded"></div>
          <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-red-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Consumption Overview</h3>
            <p className="text-sm text-red-600">Unable to load data</p>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">Failed to load consumption data</p>
          <p className="text-sm text-gray-400">{error}</p>
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
        <div className="p-2 bg-purple-50 rounded-lg">
          <TrendingUp className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Consumption Overview</h3>
          <p className="text-sm text-gray-600">Weekly summary</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">
            {totalWeeklyConsumption.toFixed(1)} kWh
          </div>
          <div className="text-xs text-blue-600">This Week</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {averageDailyConsumption.toFixed(1)} kWh
          </div>
          <div className="text-xs text-green-600">Daily Avg</div>
        </div>
      </div>

      {/* Consumption by Time Pie Chart */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Usage by Rate Period</span>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={consumptionByCategory}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {consumptionByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Usage']}
                labelStyle={{ color: '#374151' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-1 gap-1 mt-2">
          {consumptionByCategory.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-600">{item.name}</span>
              </div>
              <span className="font-medium text-gray-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Peak Hours Indicator */}
      <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex items-center space-x-2 mb-1">
          <Zap className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-800">Peak Usage Alert</span>
        </div>
        <div className="text-xs text-orange-700">
          Your highest consumption is during peak hours (6-9 PM).
          Consider shifting usage to save costs.
        </div>
      </div>

      {/* Weekly Bar Chart */}
      {weeklyConsumption.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Daily Consumption (kWh)</div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyConsumption}>
                <XAxis 
                  dataKey="day" 
                  fontSize={10}
                  tick={{ fill: '#6b7280' }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="consumption" 
                  fill="#3b82f6" 
                  radius={[2, 2, 0, 0]}
                  name="Consumption"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Cost Summary */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Weekly Cost</span>
          <span className="font-semibold text-gray-900">₹{totalWeeklyCost.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-gray-600">Est. Monthly</span>
          <span className="font-semibold text-gray-900">₹{(totalWeeklyCost * 4.33).toFixed(2)}</span>
        </div>
      </div>

      {/* Efficiency Rating */}
      <div className="mt-3 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">Efficiency Rating</span>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <div
                key={star}
                className={`w-2 h-2 rounded-full ${
                  star <= 4 ? 'bg-green-500' : 'bg-gray-300'
                }`}
              ></div>
            ))}
            <span className="text-xs font-medium text-gray-900 ml-1">4/5</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConsumptionOverview;
