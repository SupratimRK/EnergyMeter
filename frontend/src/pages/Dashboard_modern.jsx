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
  Eye,
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
  
  const { data: realtimeData, isLoading } = useApi(realtimeApi.getMetrics, []);
  const { data: balanceData } = useApi(balanceApi.getBalance, []);
  const { data: historicalData } = useApi(historicalApi.getHistorical, []);
  const { connectionStatus } = useRealTimeData();

  // Mock data for enhanced visualizations
  const hourlyConsumption = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    consumption: Math.random() * 3 + 1,
    cost: Math.random() * 20 + 5,
    efficiency: Math.random() * 20 + 80,
  }));

  const weeklyData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    consumption: Math.random() * 20 + 10,
    target: 25,
    cost: Math.random() * 150 + 75,
  }));

  const realTimeMetrics = [
    {
      id: 'power',
      label: 'Active Power',
      value: realtimeData?.active_power || '2.45 kW',
      change: '+2.3%',
      trend: 'up',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
    },
    {
      id: 'voltage',
      label: 'Voltage',
      value: realtimeData?.voltage || '230.5 V',
      change: '+0.1%',
      trend: 'stable',
      icon: Activity,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50 to-emerald-100',
    },
    {
      id: 'current',
      label: 'Current',
      value: realtimeData?.current || '10.6 A',
      change: '+1.8%',
      trend: 'up',
      icon: Gauge,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
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
              {entry.name.includes('cost') ? ' ₹' : 
               entry.name.includes('consumption') ? ' kWh' : 
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
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
          <p className="text-neutral-600 font-medium">Real-time monitoring and insights for your smart meter</p>
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
          
          <button className="btn-primary flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Live View</span>
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
              transition={{ delay: index * 0.1 }}
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
                <p className="text-sm font-medium text-neutral-600">{metric.label}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Hourly Consumption Chart */}
        <motion.div 
          className="xl:col-span-2 chart-container"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-800">24-Hour Consumption</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Power</button>
              <button className="px-3 py-1 text-xs font-medium rounded-full text-neutral-600 hover:bg-neutral-100">Cost</button>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyConsumption}>
                <defs>
                  <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#64748b" 
                  fontSize={12}
                  fontWeight={500}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  fontWeight={500}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fill="url(#consumptionGradient)"
                  name="consumption"
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

      {/* Weekly Overview and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Consumption */}
        <motion.div 
          className="chart-container"
          variants={itemVariants}
        >
          <h3 className="text-xl font-bold text-neutral-800 mb-6">Weekly Overview</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="day" 
                  stroke="#64748b" 
                  fontSize={12}
                  fontWeight={500}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  fontWeight={500}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="consumption" 
                  fill="url(#barGradient)" 
                  radius={[8, 8, 0, 0]}
                  name="consumption"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="target"
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="space-y-6"
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

          <div className="metric-card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-800">18:30</p>
                <p className="text-sm font-medium text-blue-600">Peak time</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Higher rates active</span>
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
      </div>
    </motion.div>
  );
};

export default Dashboard;
