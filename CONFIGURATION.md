# Configuration Guide

This document explains all configurable parameters for the Energy Meter Simulation system.

## Data Update Frequencies

The system uses various intervals for different types of data updates:

### Backend (Simulation Server)

All intervals are configured in milliseconds in the `.env` file:

| Setting | Default | Description |
|---------|---------|-------------|
| `REALTIME_INTERVAL` | 2000 | Real-time data generation (every 2 seconds) |
| `HISTORICAL_INTERVAL` | 1800000 | Historical data aggregation (every 30 minutes) |
| `BALANCE_UPDATE_INTERVAL` | 10000 | Balance updates (every 10 seconds) |
| `WEBSOCKET_HEARTBEAT_INTERVAL` | 10000 | WebSocket heartbeat (every 10 seconds) |

### Frontend

All intervals are configured in milliseconds in the frontend `.env` file:

| Setting | Default | Description |
|---------|---------|-------------|
| `VITE_REFRESH_INTERVAL` | 30000 | Dashboard auto-refresh (every 30 seconds) |
| `VITE_REALTIME_UPDATE_INTERVAL` | 2000 | Real-time UI updates (every 2 seconds) |
| `VITE_BALANCE_CHECK_INTERVAL` | 10000 | Balance status checks (every 10 seconds) |

## Alert Thresholds

Configure when the system triggers alerts:

| Setting | Default | Description |
|---------|---------|-------------|
| `LOW_BALANCE_THRESHOLD` | 20.00 | Low balance warning (₹) |
| `CRITICAL_BALANCE_THRESHOLD` | 5.00 | Critical balance alert (₹) |
| `HIGH_CONSUMPTION_THRESHOLD` | 5.0 | High consumption alert (kWh/hour) |
| `VOLTAGE_HIGH_THRESHOLD` | 240 | High voltage alert (V) |
| `VOLTAGE_LOW_THRESHOLD` | 200 | Low voltage alert (V) |

## Data Retention

Configure how long data is kept:

| Setting | Default | Description |
|---------|---------|-------------|
| `REALTIME_DATA_RETENTION_DAYS` | 1 | Real-time data retention (days) |
| `HISTORICAL_DATA_RETENTION_DAYS` | 365 | Historical data retention (days) |
| `TRANSACTION_DATA_RETENTION_DAYS` | 365 | Transaction history retention (days) |
| `ALERTS_DATA_RETENTION_DAYS` | 30 | Alert logs retention (days) |

## Performance Recommendations

### For Development
- `REALTIME_INTERVAL`: 2000ms (2 seconds)
- `FRONTEND_REFRESH_INTERVAL`: 30000ms (30 seconds)

### For Production
- `REALTIME_INTERVAL`: 5000ms (5 seconds) - Reduce server load
- `FRONTEND_REFRESH_INTERVAL`: 60000ms (1 minute) - Reduce API calls

### For Testing/Demo
- `REALTIME_INTERVAL`: 1000ms (1 second) - More responsive
- `FRONTEND_REFRESH_INTERVAL`: 10000ms (10 seconds) - More updates

## Current Configuration Summary

Based on the current setup:

1. **Real-time Data**: Generated every 2 seconds
2. **Historical Aggregation**: Every 30 minutes
3. **Balance Updates**: Every 10 seconds
4. **Frontend Refresh**: Every 30 seconds
5. **WebSocket Heartbeat**: Every 10 seconds

## Energy Rate Structure

The system uses time-based energy rates:
- **Off-Peak (00:00-06:00)**: ₹4.50/kWh
- **Normal (06:00-18:00)**: ₹6.00/kWh
- **Peak (18:00-23:59)**: ₹8.50/kWh

## How to Change Settings

1. **Backend Settings**: Edit `simulation-server/.env`
2. **Frontend Settings**: Edit `frontend/.env`
3. **Restart Services**: After changing .env files, restart both backend and frontend

## Environment Variables Priority

The system uses this priority order:
1. Environment variables (from .env files)
2. Default values (hardcoded fallbacks)

This ensures the system always works even if .env files are missing.
