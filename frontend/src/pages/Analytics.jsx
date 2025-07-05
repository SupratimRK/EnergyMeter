import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Download,
  Filter,
  Activity,
  Zap,
  DollarSign,
  BarChart2 as BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { useApi } from '../hooks';
import { historicalApi } from '../services/api';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState('consumption');

  const { data: historicalData, isLoading } = useApi(historicalApi.getHistorical, []);
  const { data: weeklyData } = useApi(historicalApi.getWeekly, []);

  // Process real API data for analytics
  const processAnalyticsData = () => {
    if (!historicalData?.data || historicalData.data.length === 0) {
      // Fallback data if API is not available
      return Array.from({ length: 30 }, (_, i) => ({
        day: `Day ${i + 1}`,
        consumption: Math.random() * 20 + 10,
        cost: Math.random() * 140 + 70,
        efficiency: Math.random() * 20 + 80,
      }));
    }

    // Process last 30 records from API
    const recentData = historicalData.data.slice(-30);
    return recentData.map((reading, i) => {
      const energy = parseFloat(reading.consumption?.energy?.replace('kWh', '') || '0');
      const cost = parseFloat(reading.consumption?.cost?.replace(/[^\d.-]/g, '') || '0');
      const powerFactor = reading.readings?.power_factor_avg || 0.85;
      
      return {
        day: new Date(reading.timestamp).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        consumption: energy,
        cost: cost,
        efficiency: powerFactor * 100,
        timestamp: reading.timestamp
      };
    });
  };

  const processHourlyData = () => {
    if (!historicalData?.data || historicalData.data.length === 0) {
      // Fallback data
      return Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        consumption: Math.random() * 5 + 1,
        demand: Math.random() * 3 + 0.5,
      }));
    }

    // Get last 24 hours of data
    const recentData = historicalData.data.slice(-24);
    return recentData.map(reading => {
      const energy = parseFloat(reading.consumption?.energy?.replace('kWh', '') || '0');
      const timestamp = new Date(reading.timestamp);
      
      return {
        hour: timestamp.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }),
        consumption: energy,
        demand: energy * 1.2, // Simulate demand data
      };
    });
  };

  // Use processed data
  const consumptionData = processAnalyticsData();
  const hourlyData = processHourlyData();

  // Calculate usage distribution from real data
  const calculateUsageDistribution = () => {
    if (!historicalData?.data || historicalData.data.length === 0) {
      return [
        { name: 'Peak Hours (18:00-23:59)', value: 35, color: '#ef4444' },
        { name: 'Normal Hours (06:00-18:00)', value: 45, color: '#3b82f6' },
        { name: 'Off-Peak Hours (00:00-06:00)', value: 20, color: '#10b981' },
      ];
    }

    let peakConsumption = 0;
    let normalConsumption = 0;
    let offPeakConsumption = 0;

    historicalData.data.forEach(reading => {
      const hour = new Date(reading.timestamp).getHours();
      const energy = parseFloat(reading.consumption?.energy?.replace('kWh', '') || '0');
      
      if (hour >= 18 || hour <= 5) {
        if (hour >= 18) peakConsumption += energy; // Peak hours
        else offPeakConsumption += energy; // Off-peak hours
      } else {
        normalConsumption += energy; // Normal hours
      }
    });

    const total = peakConsumption + normalConsumption + offPeakConsumption;
    if (total === 0) return [
      { name: 'Peak Hours (18:00-23:59)', value: 35, color: '#ef4444' },
      { name: 'Normal Hours (06:00-18:00)', value: 45, color: '#3b82f6' },
      { name: 'Off-Peak Hours (00:00-06:00)', value: 20, color: '#10b981' },
    ];

    return [
      { 
        name: 'Peak Hours (18:00-23:59)', 
        value: Math.round((peakConsumption / total) * 100), 
        color: '#ef4444',
        consumption: peakConsumption.toFixed(2)
      },
      { 
        name: 'Normal Hours (06:00-18:00)', 
        value: Math.round((normalConsumption / total) * 100), 
        color: '#3b82f6',
        consumption: normalConsumption.toFixed(2)
      },
      { 
        name: 'Off-Peak Hours (00:00-06:00)', 
        value: Math.round((offPeakConsumption / total) * 100), 
        color: '#10b981',
        consumption: offPeakConsumption.toFixed(2)
      },
    ];
  };

  const usageDistribution = calculateUsageDistribution();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 border border-white/20 shadow-xl">
          <p className="text-sm font-semibold text-neutral-700 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
              {entry.name.includes('cost') || entry.name.includes('Cost') ? ' ₹' : 
               entry.name.includes('consumption') || entry.name.includes('demand') ? ' kWh' : 
               entry.name.includes('efficiency') ? '%' : ''}
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Detailed insights into energy consumption and trends</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading analytics data...</span>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Consumption</p>
              <p className="text-2xl font-bold text-gray-900">
                {historicalData?.data ? 
                  `${historicalData.data.reduce((sum, reading) => 
                    sum + parseFloat(reading.consumption?.energy?.replace('kWh', '') || '0'), 0
                  ).toFixed(1)} kWh` : 
                  '324.8 kWh'
                }
              </p>
              <p className="text-sm text-green-600">Last 30 readings</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">
                {historicalData?.data ? 
                  `₹${historicalData.data.reduce((sum, reading) => 
                    sum + parseFloat(reading.consumption?.cost?.replace(/[^\d.-]/g, '') || '0'), 0
                  ).toFixed(0)}` : 
                  '₹2,271'
                }
              </p>
              <p className="text-sm text-blue-600">Last 30 readings</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg. Daily Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {historicalData?.data && historicalData.data.length > 0 ? 
                  `${(historicalData.data.reduce((sum, reading) => 
                    sum + parseFloat(reading.consumption?.energy?.replace('kWh', '') || '0'), 0
                  ) / Math.max(historicalData.data.length, 1)).toFixed(1)} kWh` : 
                  '10.8 kWh'
                }
              </p>
              <p className="text-sm text-gray-600">Per reading period</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg. Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">
                {historicalData?.data && historicalData.data.length > 0 ? 
                  `${(historicalData.data.reduce((sum, reading) => 
                    sum + (reading.readings?.power_factor_avg || 0.85), 0
                  ) / historicalData.data.length * 100).toFixed(0)}%` : 
                  '87%'
                }
              </p>
              <p className="text-sm text-green-600">Power factor based</p>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Rate Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            Energy Rate Structure
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h4 className="font-semibold text-red-800">Peak Hours</h4>
                <p className="text-sm text-red-600">18:00 - 23:59 (6:00 PM - 11:59 PM)</p>
                <p className="text-xs text-red-500 mt-1">Highest usage period</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-800">₹8.50</p>
                <p className="text-sm text-red-600">per kWh</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div>
                <h4 className="font-semibold text-blue-800">Normal Hours</h4>
                <p className="text-sm text-blue-600">06:00 - 18:00 (6:00 AM - 6:00 PM)</p>
                <p className="text-xs text-blue-500 mt-1">Standard daytime rate</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-800">₹6.00</p>
                <p className="text-sm text-blue-600">per kWh</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <h4 className="font-semibold text-green-800">Off-Peak Hours</h4>
                <p className="text-sm text-green-600">00:00 - 06:00 (12:00 AM - 6:00 AM)</p>
                <p className="text-xs text-green-500 mt-1">Lowest rate - save money!</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-800">₹4.50</p>
                <p className="text-sm text-green-600">per kWh</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Calculation Logic</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Formula:</h4>
              <p className="text-lg font-mono bg-white p-2 rounded border text-gray-800">
                Cost = Energy × Rate
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Energy (kWh) × Current Rate (₹/kWh) = Total Cost (₹)
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
              <ol className="text-sm text-blue-700 space-y-2">
                <li className="flex">
                  <span className="font-medium text-blue-600 mr-2">1.</span>
                  Energy consumption is measured continuously
                </li>
                <li className="flex">
                  <span className="font-medium text-blue-600 mr-2">2.</span>
                  Rate is applied based on current time
                </li>
                <li className="flex">
                  <span className="font-medium text-blue-600 mr-2">3.</span>
                  Cost is calculated and deducted from balance
                </li>
              </ol>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 font-medium">💡 Money-Saving Tip</p>
              <p className="text-sm text-yellow-700 mt-1">
                Shift heavy appliance usage to off-peak hours (midnight to 6 AM) and save up to <strong>47%</strong> on electricity costs!
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                Peak (₹8.50) vs Off-Peak (₹4.50) = 47% savings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Overview */}
      {weeklyData?.data?.daily_breakdown && weeklyData.data.daily_breakdown.length > 0 ? (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Weekly Overview - {weeklyData.data.summary.period}
            </h3>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>

          {/* Weekly Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">TOTAL</span>
              </div>
              <p className="text-2xl font-bold text-blue-800">
                {weeklyData.data.summary.total_energy}
              </p>
              <p className="text-sm text-blue-600">Energy consumed</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-xs text-green-600 font-medium">TOTAL</span>
              </div>
              <p className="text-2xl font-bold text-green-800">
                {weeklyData.data.summary.total_cost}
              </p>
              <p className="text-sm text-green-600">Cost incurred</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span className="text-xs text-purple-600 font-medium">DAILY AVG</span>
              </div>
              <p className="text-2xl font-bold text-purple-800">
                {weeklyData.data.summary.average_daily_energy}
              </p>
              <p className="text-sm text-purple-600">Energy per day</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <span className="text-xs text-amber-600 font-medium">DAILY AVG</span>
              </div>
              <p className="text-2xl font-bold text-amber-800">
                {weeklyData.data.summary.average_daily_cost}
              </p>
              <p className="text-sm text-amber-600">Cost per day</p>
            </div>
          </div>

          {/* Weekly Insights */}
          <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
            <h4 className="text-md font-semibold text-indigo-800 mb-3">💡 Weekly Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-indigo-700">
                  <strong>Highest consumption:</strong>{' '}
                  {weeklyData.data.daily_breakdown.reduce((max, day) => {
                    const energy = parseFloat(day.energy_consumed.replace('kWh', ''));
                    const maxEnergy = parseFloat(max.energy_consumed.replace('kWh', ''));
                    return energy > maxEnergy ? day : max;
                  }, weeklyData.data.daily_breakdown[0]).energy_consumed} on{' '}
                  {new Date(weeklyData.data.daily_breakdown.reduce((max, day) => {
                    const energy = parseFloat(day.energy_consumed.replace('kWh', ''));
                    const maxEnergy = parseFloat(max.energy_consumed.replace('kWh', ''));
                    return energy > maxEnergy ? day : max;
                  }, weeklyData.data.daily_breakdown[0]).date).toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
              </div>
              <div>
                <p className="text-indigo-700">
                  <strong>Most expensive day:</strong>{' '}
                  {weeklyData.data.daily_breakdown.reduce((max, day) => {
                    const cost = parseFloat(day.cost.replace('₹', ''));
                    const maxCost = parseFloat(max.cost.replace('₹', ''));
                    return cost > maxCost ? day : max;
                  }, weeklyData.data.daily_breakdown[0]).cost} on{' '}
                  {new Date(weeklyData.data.daily_breakdown.reduce((max, day) => {
                    const cost = parseFloat(day.cost.replace('₹', ''));
                    const maxCost = parseFloat(max.cost.replace('₹', ''));
                    return cost > maxCost ? day : max;
                  }, weeklyData.data.daily_breakdown[0]).date).toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : weeklyData === undefined ? (
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Loading Weekly Overview</h3>
              <p className="text-gray-500">Fetching your weekly consumption data...</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Hourly Consumption</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setChartType('consumption')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  chartType === 'consumption' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Consumption
              </button>
              <button 
                onClick={() => setChartType('cost')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  chartType === 'cost' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cost
              </button>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey={chartType} 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Usage Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usageDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {usageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-4 space-x-4">
            {usageDistribution.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-sm text-gray-600">{entry.name}: {entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Efficiency Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Peak Usage Analysis</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium text-red-800">Peak Hour</p>
                <p className="text-sm text-red-600">7:00 PM - 8:00 PM</p>
              </div>
              <p className="text-lg font-bold text-red-800">4.2 kWh</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">Average Hour</p>
                <p className="text-sm text-blue-600">2:00 PM - 3:00 PM</p>
              </div>
              <p className="text-lg font-bold text-blue-800">2.8 kWh</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Low Hour</p>
                <p className="text-sm text-green-600">3:00 AM - 4:00 AM</p>
              </div>
              <p className="text-lg font-bold text-green-800">0.8 kWh</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
