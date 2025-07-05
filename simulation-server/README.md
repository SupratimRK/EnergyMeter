# Prepaid Energy Meter Simulation Server

A comprehensive simulation server for prepaid IoT-based smart home energy meters. This server simulates real-time energy consumption, balance management, and provides APIs for integration with frontend applications.

## Features

### Core Features
- **Real-time Data Simulation**: Voltage, current, power factor, active power
- **Prepaid Balance Management**: Balance tracking, deduction, and recharge
- **Historical Data Storage**: 30-minute interval data for the last 7 days
- **RESTful API**: Complete API endpoints for all operations
- **WebSocket Support**: Real-time updates for connected clients
- **Webhook Integration**: Configurable webhooks for events

### Advanced Features
- **Smart Rate Management**: Different rates for peak/off-peak hours
- **Load Management**: Automatic disconnect/reconnect based on balance
- **Alert System**: Low balance, overconsumption, and system alerts
- **Transaction History**: Complete record of recharges and consumption
- **Device Status Monitoring**: Connection status, meter health
- **Consumption Analytics**: Daily, weekly, and monthly reports
- **User Management**: Multiple meter support

## API Endpoints

### Real-time Data
- `GET /api/realtime` - Get current meter readings
- `GET /api/realtime/stream` - WebSocket endpoint for live updates

### Historical Data
- `GET /api/historical` - Get historical data (30-min intervals)
- `GET /api/historical/daily` - Daily consumption summary
- `GET /api/historical/weekly` - Weekly consumption summary

### Balance Management
- `GET /api/balance` - Get current balance
- `POST /api/recharge` - Add balance to meter
- `GET /api/transactions` - Get transaction history

### Device Management
- `GET /api/device/status` - Get device status
- `POST /api/device/disconnect` - Disconnect supply
- `POST /api/device/reconnect` - Reconnect supply

### Configuration
- `GET /api/config/rates` - Get current energy rates
- `PUT /api/config/rates` - Update energy rates
- `GET /api/config/webhooks` - Get webhook configuration
- `PUT /api/config/webhooks` - Configure webhooks

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize database:
   ```bash
   npm run init-db
   ```

3. Seed sample data (optional):
   ```bash
   npm run seed-data
   ```

4. Start the server:
   ```bash
   npm start
   ```

   For development:
   ```bash
   npm run dev
   ```

## Configuration

The server runs on port 3000 by default. You can configure the following environment variables:

- `PORT` - Server port (default: 3000)
- `DB_PATH` - SQLite database path (default: ./database/meter.db)
- `WEBHOOK_TIMEOUT` - Webhook timeout in ms (default: 5000)

## Database Schema

The server uses SQLite with the following main tables:
- `meters` - Meter information and configuration
- `realtime_data` - Current meter readings
- `historical_data` - 30-minute interval historical data
- `transactions` - Balance recharge history
- `consumption_logs` - Detailed consumption tracking
- `alerts` - System alerts and notifications
- `webhooks` - Webhook configuration

## WebSocket Events

- `realtime_update` - Real-time meter data
- `balance_update` - Balance change notification
- `alert` - System alerts
- `device_status` - Device connection status

## Simulation Details

The simulation generates realistic data:
- **Voltage**: 220V ±10% with minor fluctuations
- **Current**: Variable based on load simulation
- **Power Factor**: 0.8-0.95 range
- **Energy Consumption**: Realistic household consumption patterns
- **Balance Deduction**: Based on actual consumption and configured rates

## Future Integration

This simulation server is designed to be easily replaced with actual hardware:
- API endpoints remain the same
- Database schema supports real device data
- Webhook system ready for IoT device integration
- Authentication framework prepared for production use
