const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
    constructor() {
        this.db = null;
        this.dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/meter.db');
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error connecting to SQLite database:', err);
                    reject(err);
                } else {
                    console.log('Connected to SQLite database');
                    this.enableForeignKeys();
                    resolve();
                }
            });
        });
    }

    enableForeignKeys() {
        this.db.run('PRAGMA foreign_keys = ON');
    }

    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Database connection closed');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async initializeTables() {
        const tables = [
            // Meters table
            `CREATE TABLE IF NOT EXISTS meters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meter_id TEXT UNIQUE NOT NULL,
                location TEXT NOT NULL,
                customer_name TEXT NOT NULL,
                customer_id TEXT NOT NULL,
                connection_status TEXT DEFAULT 'connected',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Real-time data table
            `CREATE TABLE IF NOT EXISTS realtime_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meter_id TEXT NOT NULL,
                voltage REAL NOT NULL,
                current REAL NOT NULL,
                power_factor REAL NOT NULL,
                active_power REAL NOT NULL,
                reactive_power REAL NOT NULL,
                apparent_power REAL NOT NULL,
                frequency REAL NOT NULL,
                energy_consumed REAL NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (meter_id) REFERENCES meters(meter_id)
            )`,

            // Historical data table (30-minute intervals)
            `CREATE TABLE IF NOT EXISTS historical_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meter_id TEXT NOT NULL,
                voltage_avg REAL NOT NULL,
                current_avg REAL NOT NULL,
                power_factor_avg REAL NOT NULL,
                energy_consumed REAL NOT NULL,
                cost REAL NOT NULL,
                start_time DATETIME NOT NULL,
                end_time DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (meter_id) REFERENCES meters(meter_id)
            )`,

            // Balance and transactions
            `CREATE TABLE IF NOT EXISTS balance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meter_id TEXT UNIQUE NOT NULL,
                current_balance REAL NOT NULL DEFAULT 0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (meter_id) REFERENCES meters(meter_id)
            )`,

            `CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meter_id TEXT NOT NULL,
                transaction_id TEXT UNIQUE NOT NULL,
                type TEXT NOT NULL, -- 'recharge', 'consumption'
                amount REAL NOT NULL,
                balance_before REAL NOT NULL,
                balance_after REAL NOT NULL,
                description TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (meter_id) REFERENCES meters(meter_id)
            )`,

            // Energy rates configuration
            `CREATE TABLE IF NOT EXISTS energy_rates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                rate_name TEXT NOT NULL,
                rate_per_kwh REAL NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Consumption logs for detailed tracking
            `CREATE TABLE IF NOT EXISTS consumption_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meter_id TEXT NOT NULL,
                energy_consumed REAL NOT NULL,
                cost REAL NOT NULL,
                rate_applied REAL NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (meter_id) REFERENCES meters(meter_id)
            )`,

            // Alerts table
            `CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meter_id TEXT NOT NULL,
                alert_type TEXT NOT NULL, -- 'low_balance', 'high_consumption', 'connection_lost', 'system'
                message TEXT NOT NULL,
                severity TEXT NOT NULL, -- 'info', 'warning', 'critical'
                is_read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (meter_id) REFERENCES meters(meter_id)
            )`,

            // Webhook configuration
            `CREATE TABLE IF NOT EXISTS webhooks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                events TEXT NOT NULL, -- JSON array of event types
                is_active BOOLEAN DEFAULT 1,
                secret_key TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

            // Device status
            `CREATE TABLE IF NOT EXISTS device_status (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meter_id TEXT UNIQUE NOT NULL,
                status TEXT NOT NULL, -- 'online', 'offline', 'maintenance'
                last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP,
                firmware_version TEXT DEFAULT '1.0.0',
                signal_strength INTEGER DEFAULT 100,
                temperature REAL DEFAULT 25.0,
                FOREIGN KEY (meter_id) REFERENCES meters(meter_id)
            )`
        ];

        for (const table of tables) {
            await this.run(table);
        }

        // Create indexes for better performance
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_realtime_meter_timestamp ON realtime_data(meter_id, timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_historical_meter_time ON historical_data(meter_id, start_time)',
            'CREATE INDEX IF NOT EXISTS idx_transactions_meter_timestamp ON transactions(meter_id, timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_consumption_meter_timestamp ON consumption_logs(meter_id, timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_alerts_meter_created ON alerts(meter_id, created_at)'
        ];

        for (const index of indexes) {
            await this.run(index);
        }

        console.log('Database tables initialized successfully');
    }
}

module.exports = new Database();
