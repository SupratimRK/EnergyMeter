# 🔌 Prepaid Energy Meter Simulation Server

## 🎯 Project Overview

This is a comprehensive simulation server for a prepaid IoT-based smart home energy meter system. It provides realistic energy consumption data, balance management, and all the necessary APIs for building a complete energy meter solution.

## ✅ Completed Features

### Core Simulation
- **Real-time Data Generation**: Voltage, current, power factor, frequency, energy consumption
- **Realistic Load Patterns**: Time-based consumption patterns (peak/off-peak hours)
- **Balance Management**: Automatic deduction based on consumption and energy rates
- **Historical Data**: 30-minute interval data storage for 7+ days

### API Endpoints (REST)
- **Real-time Data**: `/api/realtime` - Current meter readings
- **Historical Data**: `/api/historical` - 30-min intervals, daily/weekly summaries
- **Balance Management**: `/api/balance` - Current balance, recharge, transactions
- **Device Management**: `/api/device` - Status, connect/disconnect, health
- **Configuration**: `/api/config` - Energy rates, webhooks, alerts

### WebSocket Support
- **Live Streaming**: `ws://localhost:3000/realtime/stream`
- **Real-time Updates**: Live meter data pushed to connected clients
- **Event Broadcasting**: System events and alerts

### Advanced Features
- **Multi-rate Pricing**: Peak/off-peak/normal rates with time-based switching
- **Alert System**: Low balance, high consumption, voltage anomalies
- **Webhook Integration**: Configurable webhooks for external system integration
- **Transaction History**: Complete audit trail of all balance operations
- **Device Health Monitoring**: Connection status, temperature, signal strength
- **Automatic Maintenance**: Data cleanup, database optimization

### Database (SQLite)
- **Comprehensive Schema**: 10+ tables for all data types
- **Performance Optimized**: Indexes for common queries
- **Data Retention**: Configurable retention policies
- **Sample Data**: Pre-seeded with realistic historical data

## 🏗️ Architecture

```
simulation-server/
├── src/
│   ├── config/          # Database and app configuration
│   ├── models/          # Data models and database operations
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic (simulation, alerts, webhooks)
│   └── middleware/      # Custom middleware (rate limiting, validation)
├── scripts/             # Database initialization and seeding
├── database/            # SQLite database files
├── server.js            # Main server file
└── test-dashboard.html  # WebSocket test interface
```

## 🚀 Current Status

**✅ FULLY FUNCTIONAL** - The server is running and all components are working:

1. **Database**: Initialized with schema and sample data
2. **Simulation**: Generating realistic energy data every 2 seconds
3. **APIs**: All REST endpoints responding correctly
4. **WebSocket**: Real-time streaming operational
5. **Balance System**: Automatic deduction and recharge functionality
6. **Alerts**: System monitoring and notifications

## 📊 Live Data Examples

### Real-time Readings
```json
{
  "voltage": "220.77V",
  "current": "12.84A", 
  "power_factor": 0.897,
  "active_power": "2.543kW",
  "frequency": "50.15Hz",
  "current_balance": "₹124.28"
}
```

### Energy Rates
- **Off-Peak**: ₹4.50/kWh (00:00-06:00)
- **Normal**: ₹6.00/kWh (06:00-18:00) 
- **Peak**: ₹8.50/kWh (18:00-23:59)

## 🔧 Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Initialize Database**:
   ```bash
   npm run init-db
   npm run seed-data
   ```

3. **Start Server**:
   ```bash
   npm start
   ```

4. **Test APIs**:
   - Health: http://localhost:3000/health
   - Real-time: http://localhost:3000/api/realtime
   - Balance: http://localhost:3000/api/balance

5. **Test WebSocket**:
   - Open `test-dashboard.html` in a browser
   - WebSocket URL: `ws://localhost:3000/realtime/stream`

## 🎯 Next Steps for Frontend Development

### Immediate (Week 1-2)
1. **Dashboard UI**: Create main dashboard showing real-time data
2. **Balance Management**: Recharge interface and transaction history
3. **Historical Charts**: Energy consumption graphs and analytics
4. **Mobile Responsive**: Ensure mobile-friendly design

### Advanced (Week 3-4)
1. **User Authentication**: Login/logout functionality
2. **Multiple Meters**: Support for multiple meter monitoring
3. **Advanced Analytics**: Daily/weekly/monthly reports
4. **Notifications**: Browser notifications for alerts
5. **Payment Integration**: Online recharge with payment gateway

### Production Ready (Week 5-6)
1. **Hardware Integration**: Replace simulation with real IoT data
2. **Multi-tenant**: Support multiple customers
3. **Performance Optimization**: Caching, database tuning
4. **Security**: HTTPS, API authentication, rate limiting
5. **Deployment**: Docker containers, cloud deployment

## 🔌 Hardware Integration Plan

When ready to replace simulation with actual hardware:

1. **Keep Same APIs**: Frontend won't need changes
2. **Update Data Sources**: Replace simulation service with IoT data ingestion
3. **Add Device Management**: Firmware updates, remote configuration
4. **Enhance Security**: Device authentication, encrypted communication

## 📋 API Documentation

Complete API documentation available at:
- **Interactive Docs**: http://localhost:3000/api
- **Examples**: See `API_EXAMPLES.md`
- **WebSocket Events**: See server logs for real-time events

## 🎨 Frontend Framework Suggestions

**Recommended Tech Stack**:
- **React/Vue.js**: For interactive dashboard
- **Chart.js/D3.js**: For energy consumption visualizations  
- **Material-UI/Tailwind**: For modern UI components
- **WebSocket Client**: For real-time data updates
- **PWA Features**: For mobile app-like experience

## 💡 Key Features for Frontend

1. **Real-time Dashboard**: Live meter readings with auto-refresh
2. **Energy Analytics**: Interactive charts and consumption patterns
3. **Balance Management**: Quick recharge and transaction history
4. **Alert Center**: Notifications and system alerts
5. **Device Control**: Remote connect/disconnect functionality
6. **Historical Reports**: Exportable consumption reports
7. **Rate Calculator**: Cost prediction based on usage patterns
8. **Mobile App**: Progressive Web App or React Native

## 🔒 Security Considerations

- API rate limiting implemented
- Input validation on all endpoints
- CORS protection configured
- SQL injection protection via parameterized queries
- WebSocket connection limits

## 📈 Scalability Features

- Connection pooling ready
- Database indexing optimized
- Background job scheduling
- Webhook system for external integrations
- Modular architecture for easy scaling

---

**Status**: ✅ **READY FOR FRONTEND DEVELOPMENT**

The simulation server is fully operational and provides all the backend functionality needed to build a complete prepaid energy meter solution. You can now focus on creating an amazing user interface while the server handles all the complex energy simulation and data management!
