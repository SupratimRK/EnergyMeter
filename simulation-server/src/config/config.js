module.exports = {
    // Server configuration
    PORT: process.env.PORT || 3000,
    
    // Database configuration
    DB_PATH: process.env.DB_PATH || './database/meter.db',
    
    // Default meter configuration
    DEFAULT_METER: {
        METER_ID: 'METER_001',
        LOCATION: 'Home - Living Room',
        CUSTOMER_NAME: 'Supratim Mondal',
        CUSTOMER_ID: 'CUST_001',
        INITIAL_BALANCE: 100.00
    },
    
    // Simulation parameters
    SIMULATION: {
        // Voltage simulation (220V ±10%)
        VOLTAGE: {
            NOMINAL: 220,
            MIN: 198,
            MAX: 242,
            FLUCTUATION: 2
        },
        
        // Current simulation (varies with load)
        CURRENT: {
            MIN: 0.5,
            MAX: 20,
            IDLE: 1.0
        },
        
        // Power factor range
        POWER_FACTOR: {
            MIN: 0.8,
            MAX: 0.95
        },
        
        // Frequency (50Hz ±1%)
        FREQUENCY: {
            NOMINAL: 50,
            MIN: 49.5,
            MAX: 50.5
        },
        
        // Load patterns (hourly multipliers)
        LOAD_PATTERN: {
            0: 0.3,  // 12 AM - low usage
            1: 0.2,
            2: 0.2,
            3: 0.2,
            4: 0.2,
            5: 0.3,
            6: 0.7,  // 6 AM - morning peak starts
            7: 0.9,
            8: 1.0,
            9: 0.6,
            10: 0.5,
            11: 0.6,
            12: 0.8, // 12 PM - afternoon peak
            13: 0.7,
            14: 0.6,
            15: 0.6,
            16: 0.7,
            17: 0.8,
            18: 1.0, // 6 PM - evening peak
            19: 1.2, // Peak hour
            20: 1.1,
            21: 0.9,
            22: 0.7,
            23: 0.5
        },
        
        // Update intervals (configurable via environment variables)
        REALTIME_INTERVAL: parseInt(process.env.REALTIME_INTERVAL) || 2000, // 2 seconds
        HISTORICAL_INTERVAL: parseInt(process.env.HISTORICAL_INTERVAL) || 30 * 60 * 1000, // 30 minutes
        BALANCE_UPDATE_INTERVAL: parseInt(process.env.BALANCE_UPDATE_INTERVAL) || 10000, // 10 seconds
        WEBSOCKET_HEARTBEAT_INTERVAL: parseInt(process.env.WEBSOCKET_HEARTBEAT_INTERVAL) || 10000 // 10 seconds
    },
    
    // Energy rates (INR per kWh)
    ENERGY_RATES: [
        {
            name: 'Off-Peak',
            rate: 4.50,
            startTime: '00:00',
            endTime: '06:00'
        },
        {
            name: 'Normal',
            rate: 6.00,
            startTime: '06:00',
            endTime: '18:00'
        },
        {
            name: 'Peak',
            rate: 8.50,
            startTime: '18:00',
            endTime: '23:59'
        }
    ],
    
    // Alert thresholds (configurable via environment variables)
    ALERTS: {
        LOW_BALANCE_THRESHOLD: parseFloat(process.env.LOW_BALANCE_THRESHOLD) || 20.00,
        CRITICAL_BALANCE_THRESHOLD: parseFloat(process.env.CRITICAL_BALANCE_THRESHOLD) || 5.00,
        HIGH_CONSUMPTION_THRESHOLD: parseFloat(process.env.HIGH_CONSUMPTION_THRESHOLD) || 5.0, // kWh per hour
        VOLTAGE_HIGH_THRESHOLD: parseFloat(process.env.VOLTAGE_HIGH_THRESHOLD) || 240,
        VOLTAGE_LOW_THRESHOLD: parseFloat(process.env.VOLTAGE_LOW_THRESHOLD) || 200
    },
    
    // Webhook configuration (configurable via environment variables)
    WEBHOOKS: {
        TIMEOUT: parseInt(process.env.WEBHOOK_TIMEOUT) || 5000,
        RETRY_ATTEMPTS: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS) || 3,
        RETRY_DELAY: parseInt(process.env.WEBHOOK_RETRY_DELAY) || 1000
    },
    
    // Data retention (configurable via environment variables)
    DATA_RETENTION: {
        REALTIME_DAYS: parseInt(process.env.REALTIME_DATA_RETENTION_DAYS) || 1,
        HISTORICAL_DAYS: parseInt(process.env.HISTORICAL_DATA_RETENTION_DAYS) || 365,
        TRANSACTION_DAYS: parseInt(process.env.TRANSACTION_DATA_RETENTION_DAYS) || 365,
        ALERTS_DAYS: parseInt(process.env.ALERTS_DATA_RETENTION_DAYS) || 30
    }
};
