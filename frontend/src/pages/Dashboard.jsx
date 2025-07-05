import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Battery,
  Gauge,
  Clock,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  BarChart3
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts';

import { useApi, useRealTimeData } from '../hooks';
import { realtimeApi, balanceApi, historicalApi } from '../services/api';

const Dashboard = () => {
  const [selectedMetric, setSelectedMetric] = useState('power');
  const [timeRange, setTimeRange] = useState('24h');
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  const { data: realtimeData, isLoading, refetch: refetchRealtime } = useApi(realtimeApi.getCurrent, []);
  const { data: balanceData, refetch: refetchBalance } = useApi(balanceApi.getBalance, []);
  const { data: historicalData, refetch: refetchHistorical } = useApi(historicalApi.getHistorical, []);
  const { connectionStatus } = useRealTimeData();

  // Auto-refresh data every interval (configurable via env)
  useEffect(() => {
    const refreshInterval = parseInt(import.meta.env.VITE_REFRESH_INTERVAL) || 30000;
    const interval = setInterval(() => {
      refetchRealtime();
      refetchHistorical();
      setLastUpdate(Date.now());
    }, refreshInterval);

    console.log(`Dashboard auto-refresh set to ${refreshInterval}ms`);
    return () => clearInterval(interval);
  }, [refetchRealtime, refetchHistorical]);

  // Process API data for charts
  const processHistoricalData = () => {
    if (!historicalData?.data || historicalData.data.length === 0) {
      // Fallback to mock data if API data is not available
      console.log('Using fallback data - no API data available');
      return Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        consumption: 2.5 + Math.sin(i / 4) * 0.8 + Math.random() * 0.3,
        cost: 15 + Math.sin(i / 4) * 5 + Math.random() * 2,
        efficiency: 85 + Math.sin(i / 6) * 8 + Math.random() * 3,
      }));
    }

    // Process real API data - get last 24 data points
    const recentData = historicalData.data.slice(-24);
    console.log('Processing API data:', recentData.length, 'records');
    
    return recentData.map((reading, i) => {
      const energy = parseFloat(reading.consumption?.energy?.replace('kWh', '') || '0');
      const costString = reading.consumption?.cost || '0';
      const cost = parseFloat(costString.replace(/[^\d.-]/g, '') || '0');
      const powerFactor = reading.readings?.power_factor_avg || 0.85;
      
      return {
        hour: new Date(reading.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }),
        consumption: energy,
        cost: cost,
        efficiency: powerFactor * 100,
      };
    });
  };

  // Function to get current energy rate based on time
  const getCurrentRate = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 0 && currentHour < 6) {
      return { rate: 4.50, name: 'Off-Peak', color: 'text-green-600', bgColor: 'from-green-50 to-green-100' };
    } else if (currentHour >= 6 && currentHour < 18) {
      return { rate: 6.00, name: 'Normal', color: 'text-blue-600', bgColor: 'from-blue-50 to-blue-100' };
    } else {
      return { rate: 8.50, name: 'Peak', color: 'text-red-600', bgColor: 'from-red-50 to-red-100' };
    }
  };

  // Function to get next rate change
  const getNextRateChange = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 0 && currentHour < 6) {
      return { nextHour: 6, nextRate: 'Normal (₹6.00)', timeUntil: 6 - currentHour };
    } else if (currentHour >= 6 && currentHour < 18) {
      return { nextHour: 18, nextRate: 'Peak (₹8.50)', timeUntil: 18 - currentHour };
    } else {
      return { nextHour: 24, nextRate: 'Off-Peak (₹4.50)', timeUntil: 24 - currentHour };
    }
  };

  const currentRate = getCurrentRate();
  const nextRateChange = getNextRateChange();

  const processCostData = () => {
    if (!historicalData?.data) {
      // Fallback to mock data with correct rates
      return Array.from({ length: 24 }, (_, i) => {
        const hour = i;
        const isOffPeak = hour >= 0 && hour < 6;
        const isPeak = hour >= 18;
        const isNormal = hour >= 6 && hour < 18;
        
        let rate = 6.00; // Normal rate
        let rateLabel = 'Normal';
        
        if (isOffPeak) {
          rate = 4.50;
          rateLabel = 'Off-Peak';
        } else if (isPeak) {
          rate = 8.50;
          rateLabel = 'Peak';
        }
        
        const baseConsumption = 2 + Math.sin(i * 0.3) + Math.random() * 0.5;
        const cost = baseConsumption * rate;
        
        return {
          hour: `${i}:00`,
          cost: cost,
          rate: rateLabel,
          savings: isPeak ? (baseConsumption * (8.50 - 4.50)) : 0, // Savings if shifted to off-peak
        };
      });
    }

    // Process real API data for cost analysis
    const recentData = historicalData.data.slice(-24);
    return recentData.map(reading => {
      const timestamp = new Date(reading.timestamp);
      const hour = timestamp.getHours();
      const isOffPeak = hour >= 0 && hour < 6;
      const isPeak = hour >= 18;
      const isNormal = hour >= 6 && hour < 18;
      
      let rateLabel = 'Normal';
      if (isOffPeak) rateLabel = 'Off-Peak';
      else if (isPeak) rateLabel = 'Peak';
      
      const cost = parseFloat(reading.consumption?.cost?.replace(/[^\d.-]/g, '') || '0');
      const energy = parseFloat(reading.consumption?.energy?.replace('kWh', '') || '0');
      
      return {
        hour: timestamp.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
        }),
        cost: cost,
        rate: rateLabel,
        savings: isPeak && energy > 0 ? energy * (8.50 - 4.50) : 0, // Potential savings if shifted to off-peak
      };
    });
  };

  // Use processed data
  const hourlyConsumption = processHistoricalData();
  const hourlyCost = processCostData();

  // Debug data loading status
  console.log('Dashboard Data Status:', {
    historicalDataExists: !!historicalData,
    historicalDataLength: historicalData?.data?.length || 0,
    hourlyConsumptionLength: hourlyConsumption.length,
    hourlyCostLength: hourlyCost.length,
    sampleConsumption: hourlyConsumption.slice(0, 3),
    sampleCost: hourlyCost.slice(0, 3)
  });

  const realTimeMetrics = [
    {
      id: 'power',
      label: 'Active Power',
      value: realtimeData?.data?.active_power || '2.45 kW',
      change: '+2.3%',
      trend: 'up',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      level: Math.min(Math.round(parseFloat(realtimeData?.data?.active_power?.replace('kW', '') || '2.45') / 4.0 * 100 * 10) / 10, 100), // Max 4kW, rounded to 1 decimal
      maxValue: '4.0 kW'
    },
    {
      id: 'voltage',
      label: 'Voltage',
      value: realtimeData?.data?.voltage || '230.5 V',
      change: '+0.1%',
      trend: 'stable',
      icon: Activity,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
      level: Math.min(Math.round(parseFloat(realtimeData?.data?.voltage?.replace('V', '') || '230.5') / 250 * 100 * 10) / 10, 100), // Max 250V, rounded to 1 decimal
      maxValue: '250 V'
    },
    {
      id: 'current',
      label: 'Current',
      value: realtimeData?.data?.current || '10.6 A',
      change: '+1.8%',
      trend: 'up',
      icon: Gauge,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      level: Math.min(Math.round(parseFloat(realtimeData?.data?.current?.replace('A', '') || '10.6') / 20 * 100 * 10) / 10, 100), // Max 20A, rounded to 1 decimal
      maxValue: '20 A'
    },
    {
      id: 'energy',
      label: 'Daily Energy',
      value: '12.4 kWh',
      change: '-0.5%',
      trend: 'down',
      icon: Battery,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'from-amber-50 to-amber-100',
      level: 31, // This would need daily calculation from historical data
      maxValue: '40 kWh'
    },
  ];

  const efficiencyData = [
    { name: 'Excellent', value: 35, color: '#10b981' },
    { name: 'Good', value: 45, color: '#3b82f6' },
    { name: 'Average', value: 15, color: '#f59e0b' },
    { name: 'Poor', value: 5, color: '#ef4444' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-4 border border-white/20 shadow-xl">
          <p className="text-sm font-semibold text-neutral-700 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
              {entry.name.includes('Cost') || entry.name.includes('cost') ? ' ₹' : 
               entry.name.includes('consumption') || entry.name.includes('Power') || entry.name.includes('kWh') ? ' kWh' : 
               entry.name.includes('efficiency') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      className="space-y-8 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Energy Dashboard</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <p className="text-neutral-600 font-medium">Real-time monitoring and insights for your smart meter</p>
            <div className="flex items-center space-x-2 text-xs text-neutral-500 mt-1 sm:mt-0">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'Connected' ? 'bg-green-500' : 
                connectionStatus === 'Connecting' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`}></div>
              <span>
                Last updated: {new Date(lastUpdate).toLocaleTimeString()} 
                {historicalData?.data ? ` | ${historicalData.data.length} records` : ' | No data'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <button 
            onClick={() => {
              refetchRealtime();
              refetchHistorical();
              setLastUpdate(Date.now());
            }}
            className="p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-neutral-200/50 hover:bg-white hover:border-neutral-300 transition-all duration-300 group shadow-lg hover:shadow-xl"
            title="Refresh Data"
          >
            <RotateCcw className="w-5 h-5 text-neutral-600 group-hover:text-blue-600 transition-colors duration-300" />
          </button>
        </div>
      </motion.div>

      {/* Real-time Metrics */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        {realTimeMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.id}
              className={`metric-card bg-gradient-to-br ${metric.bgColor} border-0 cursor-pointer transition-all duration-300 ${
                selectedMetric === metric.id ? 'ring-2 ring-blue-400 scale-105' : ''
              }`}
              onClick={() => setSelectedMetric(metric.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${metric.color} shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  metric.trend === 'up' ? 'bg-emerald-100 text-emerald-700' :
                  metric.trend === 'down' ? 'bg-red-100 text-red-700' :
                  'bg-neutral-100 text-neutral-700'
                }`}>
                  {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                   metric.trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                   <Activity className="w-3 h-3" />}
                  <span>{metric.change}</span>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-bold text-neutral-800 mb-1">{metric.value}</p>
                <p className="text-sm font-medium text-neutral-600 mb-3">{metric.label}</p>
                
                {/* Progress Bar */}
                <div className="relative">
                  <div className="flex justify-between text-xs text-neutral-500 mb-1">
                    <span>0</span>
                    <span>{metric.maxValue}</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <motion.div 
                      className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.level}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 text-center">
                    {metric.level.toFixed(1)}% of capacity
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Power Consumption Chart */}
        <motion.div 
          className="xl:col-span-2 chart-container"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-800">Power Consumption</h3>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Real-time</button>
                <button className="px-3 py-1 text-xs font-medium rounded-full text-neutral-600 hover:bg-neutral-100">Historical</button>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyConsumption} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#64748b" 
                  fontSize={12}
                  fontWeight={500}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  fontWeight={500}
                  domain={[0, 'dataMax + 1']}
                  tickFormatter={(value) => `${value.toFixed(1)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                  name="Power Consumption (kWh)"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Peak Hours Analysis */}
        <motion.div 
          className="chart-container"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-800">Energy Rate Structure</h3>
            <div className="text-lg font-bold text-blue-600">Time-Based Pricing</div>
          </div>
          
          <div className="space-y-4">
            {/* Rate Structure */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-600">Peak Hours (18:00-23:59)</span>
                <span className="text-sm font-bold text-red-600">₹8.50/kWh</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div className="h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full" style={{ width: '85%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-600">Normal Hours (06:00-18:00)</span>
                <span className="text-sm font-bold text-blue-600">₹6.00/kWh</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div className="h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '60%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-600">Off-Peak Hours (00:00-06:00)</span>
                <span className="text-sm font-bold text-green-600">₹4.50/kWh</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3">
                <div className="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            {/* Usage Distribution */}
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <h4 className="text-sm font-semibold text-blue-800 mb-3">Current Usage Pattern</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-800">35%</div>
                  <div className="text-xs text-red-600">Peak</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-800">45%</div>
                  <div className="text-xs text-blue-600">Normal</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-800">20%</div>
                  <div className="text-xs text-green-600">Off-Peak</div>
                </div>
              </div>
            </div>
            
            {/* Savings Tip */}
            <div className="mt-4 p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-xs font-medium text-amber-800">
                  Shift usage to off-peak hours and save up to 47% on costs!
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Cost Analysis Chart */}
        <motion.div 
          className="xl:col-span-2 chart-container"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-800">24-Hour Cost Analysis</h3>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Cost</button>
                <button className="px-3 py-1 text-xs font-medium rounded-full text-neutral-600 hover:bg-neutral-100">Savings</button>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyCost} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#64748b" 
                  fontSize={12}
                  fontWeight={500}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  fontWeight={500}
                  domain={[0, 'dataMax + 2']}
                  tickFormatter={(value) => `₹${value.toFixed(1)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#costGradient)"
                  name="Hourly Cost (₹)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Efficiency Pie Chart */}
        <motion.div 
          className="chart-container"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-800">Efficiency Score</h3>
            <div className="text-2xl font-bold text-gradient">87%</div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={efficiencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {efficiencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            {efficiencyData.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-xs font-medium text-neutral-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats - Full Width */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={itemVariants}
      >
          <div className="metric-card bg-gradient-to-br from-emerald-50 to-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-800">₹1,247</p>
                <p className="text-sm font-medium text-emerald-600">This month</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">15% under budget</span>
            </div>
          </div>

          <div className={`metric-card bg-gradient-to-br ${currentRate.bgColor}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${currentRate.color.replace('text-', 'text-').replace('-600', '-800')}`}>
                  ₹{currentRate.rate}
                </p>
                <p className={`text-sm font-medium ${currentRate.color}`}>per kWh</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className={`w-4 h-4 ${currentRate.color}`} />
              <span className={`text-sm font-medium ${currentRate.color.replace('-600', '-700')}`}>
                {currentRate.name} rate active
              </span>
            </div>
          </div>

          {/* Next Rate Change */}
          <div className="metric-card bg-gradient-to-br from-amber-50 to-amber-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-amber-800">{nextRateChange.timeUntil}h</p>
                <p className="text-sm font-medium text-amber-600">Until rate change</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">
                Next: {nextRateChange.nextRate}
              </span>
            </div>
          </div>

          <div className="metric-card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-800">324.8</p>
                <p className="text-sm font-medium text-purple-600">kWh today</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">5.2% increase</span>
            </div>
          </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
