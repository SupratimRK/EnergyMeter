# API Usage Examples

This document provides examples of how to use the Prepaid Energy Meter Simulation API.

## Base URL
```
http://localhost:3000
```

## Authentication
Currently, no authentication is required for the simulation server. In production, you would implement proper authentication and authorization.

## API Examples

### 1. Get Real-time Data
```bash
# Get current meter readings
curl http://localhost:3000/api/realtime

# Response:
{
  "success": true,
  "data": {
    "meter_id": "METER_001",
    "timestamp": "2025-07-05T06:20:44.000Z",
    "voltage": "220.77V",
    "current": "12.84A",
    "power_factor": 0.897,
    "active_power": "2.543kW",
    "reactive_power": "1.252kVAR",
    "apparent_power": "2.835kVA",
    "frequency": "50.15Hz",
    "energy_consumed": "0.0014kWh",
    "current_balance": "₹99.28"
  }
}
```

### 2. Get Balance Information
```bash
# Get current balance
curl http://localhost:3000/api/balance

# Response:
{
  "success": true,
  "data": {
    "meter_id": "METER_001",
    "current_balance": "₹99.28",
    "last_updated": "2025-07-05T06:21:10.000Z",
    "status": "active"
  }
}
```

### 3. Recharge Balance
```bash
# Add balance to meter
curl -X POST http://localhost:3000/api/balance/recharge \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50.00,
    "description": "Online recharge",
    "payment_method": "UPI"
  }'

# Response:
{
  "success": true,
  "message": "Recharge completed successfully",
  "data": {
    "transaction_id": "uuid-here",
    "meter_id": "METER_001",
    "amount_added": "₹50.00",
    "balance_before": "₹99.28",
    "balance_after": "₹149.28",
    "timestamp": "2025-07-05T06:25:00.000Z"
  }
}
```

### 4. Get Historical Data
```bash
# Get last 7 days historical data (30-minute intervals)
curl http://localhost:3000/api/historical

# Get daily summary
curl "http://localhost:3000/api/historical/daily?date=2025-07-05"

# Get weekly summary
curl http://localhost:3000/api/historical/weekly
```

### 5. Get Transaction History
```bash
# Get all transactions
curl http://localhost:3000/api/balance/transactions

# Get only recharge transactions
curl "http://localhost:3000/api/balance/transactions?type=recharge"

# Get last 10 transactions
curl "http://localhost:3000/api/balance/transactions?limit=10"
```

### 6. Device Management
```bash
# Get device status
curl http://localhost:3000/api/device/status

# Disconnect meter
curl -X POST http://localhost:3000/api/device/disconnect \
  -H "Content-Type: application/json" \
  -d '{"reason": "Maintenance required"}'

# Reconnect meter
curl -X POST http://localhost:3000/api/device/reconnect \
  -H "Content-Type: application/json" \
  -d '{"reason": "Maintenance completed"}'
```

### 7. Configuration Management
```bash
# Get current energy rates
curl http://localhost:3000/api/config/rates

# Update energy rates
curl -X PUT http://localhost:3000/api/config/rates \
  -H "Content-Type: application/json" \
  -d '{
    "rates": [
      {
        "name": "Off-Peak",
        "rate_per_kwh": 4.50,
        "start_time": "00:00",
        "end_time": "06:00"
      },
      {
        "name": "Normal",
        "rate_per_kwh": 6.00,
        "start_time": "06:00", 
        "end_time": "18:00"
      },
      {
        "name": "Peak",
        "rate_per_kwh": 8.50,
        "start_time": "18:00",
        "end_time": "23:59"
      }
    ]
  }'
```

### 8. Webhook Configuration
```bash
# Create a webhook
curl -X POST http://localhost:3000/api/config/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Balance Alert Webhook",
    "url": "https://your-app.com/webhook/energy-meter",
    "events": ["balance_low", "balance_critical", "recharge_completed"],
    "secret_key": "your-secret-key"
  }'

# Test a webhook
curl -X POST http://localhost:3000/api/config/webhooks/1/test
```

### 9. Health Check
```bash
# Check server health
curl http://localhost:3000/health

# Response:
{
  "success": true,
  "message": "Energy Meter Simulation Server is running",
  "timestamp": "2025-07-05T06:30:00.000Z",
  "uptime": 600,
  "version": "1.0.0",
  "simulation_status": {
    "isRunning": true,
    "activeMeters": 1,
    "uptimeMs": 600000
  }
}
```

## WebSocket Connection

### Real-time Data Streaming
```javascript
// JavaScript WebSocket connection
const ws = new WebSocket('ws://localhost:3000/realtime/stream');

ws.onopen = function(event) {
  console.log('Connected to energy meter stream');
};

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
  
  if (data.type === 'realtime_update') {
    // Update your UI with the meter data
    updateMeterDisplay(data.data);
  }
};

ws.onclose = function(event) {
  console.log('Disconnected from energy meter stream');
};
```

## Error Responses

All API endpoints return errors in a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Data Formats

### Meter Reading Data
```json
{
  "voltage": "220.50V",      // Voltage in Volts
  "current": "10.25A",       // Current in Amperes
  "power_factor": 0.85,      // Power factor (0-1)
  "active_power": "1.85kW",  // Active power in kW
  "frequency": "50.02Hz",    // Frequency in Hz
  "energy_consumed": "0.0015kWh"  // Energy in kWh
}
```

### Balance Data
```json
{
  "current_balance": "₹125.50",  // Balance in Indian Rupees
  "status": "active",            // active, low_balance
  "last_updated": "2025-07-05T06:30:00.000Z"
}
```

### Transaction Data
```json
{
  "transaction_id": "uuid",
  "type": "recharge",           // recharge, consumption
  "amount": "+₹50.00",         // Positive for recharge, negative for consumption
  "balance_before": "₹100.00",
  "balance_after": "₹150.00",
  "timestamp": "2025-07-05T06:30:00.000Z"
}
```

## Rate Limiting

The API implements basic rate limiting:
- 100 requests per 15-minute window per IP address
- WebSocket connections are limited to 10 per IP address

## Next Steps

1. **Frontend Development**: Use these APIs to build a web dashboard
2. **Mobile App**: Create a mobile app using the same APIs
3. **Hardware Integration**: Replace simulation with actual IoT device data
4. **Authentication**: Implement JWT-based authentication
5. **Multi-tenant**: Support multiple customers and meters
6. **Payment Integration**: Integrate with payment gateways for recharges
7. **Analytics**: Add advanced analytics and reporting features
