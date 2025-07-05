const cron = require('node-cron');
const database = require('../config/database');
const config = require('../config/config');
const { RealtimeDataModel } = require('../models');
const AlertService = require('./alertService');

class MaintenanceService {
    constructor() {
        this.isRunning = false;
        this.jobs = [];
    }

    start() {
        if (this.isRunning) {
            console.log('Maintenance service is already running');
            return;
        }

        console.log('Starting maintenance service...');
        this.isRunning = true;

        // Daily cleanup at 2 AM
        const dailyCleanup = cron.schedule('0 2 * * *', async () => {
            await this.runDailyCleanup();
        }, {
            scheduled: false
        });

        // Hourly health checks
        const hourlyHealthCheck = cron.schedule('0 * * * *', async () => {
            await this.runHealthCheck();
        }, {
            scheduled: false
        });

        // Weekly database optimization
        const weeklyOptimization = cron.schedule('0 3 * * 0', async () => {
            await this.optimizeDatabase();
        }, {
            scheduled: false
        });

        this.jobs = [dailyCleanup, hourlyHealthCheck, weeklyOptimization];

        // Start all jobs
        this.jobs.forEach(job => job.start());

        console.log('Maintenance service started with scheduled tasks');
    }

    stop() {
        if (!this.isRunning) {
            return;
        }

        console.log('Stopping maintenance service...');
        
        this.jobs.forEach(job => job.stop());
        this.jobs = [];
        
        this.isRunning = false;
        console.log('Maintenance service stopped');
    }

    async runDailyCleanup() {
        try {
            console.log('Running daily cleanup...');

            // Clean old real-time data
            const realtimeDeleted = await RealtimeDataModel.cleanup(config.DATA_RETENTION.REALTIME_DAYS);
            console.log(`Cleaned ${realtimeDeleted.changes} old real-time records`);

            // Clean old alerts
            const alertsDeleted = await AlertService.cleanup(config.DATA_RETENTION.ALERTS_DAYS);
            console.log(`Cleaned ${alertsDeleted.changes} old alerts`);

            // Clean old historical data (keep longer)
            const historicalDeleted = await database.run(
                `DELETE FROM historical_data 
                 WHERE created_at < datetime('now', '-${config.DATA_RETENTION.HISTORICAL_DAYS} days')`
            );
            console.log(`Cleaned ${historicalDeleted.changes} old historical records`);

            // Clean old transactions
            const transactionsDeleted = await database.run(
                `DELETE FROM transactions 
                 WHERE timestamp < datetime('now', '-${config.DATA_RETENTION.TRANSACTION_DAYS} days')`
            );
            console.log(`Cleaned ${transactionsDeleted.changes} old transaction records`);

            console.log('Daily cleanup completed successfully');

        } catch (error) {
            console.error('Daily cleanup failed:', error);
        }
    }

    async runHealthCheck() {
        try {
            console.log('Running health check...');

            const meterId = config.DEFAULT_METER.METER_ID;

            // Check if simulation is generating data
            const recentData = await RealtimeDataModel.getRecentData(meterId, 10);
            if (recentData.length === 0) {
                console.warn('⚠️  No recent real-time data found - simulation may be stopped');
                await AlertService.createAlert(meterId, 'system', 
                    'No real-time data generation detected', 'warning');
            }

            // Check database connection
            const dbCheck = await database.get('SELECT 1 as test');
            if (!dbCheck) {
                console.error('❌ Database connection failed');
                return;
            }

            // Check for device offline status
            const offlineDevices = await database.all(
                `SELECT meter_id, last_heartbeat 
                 FROM device_status 
                 WHERE last_heartbeat < datetime('now', '-5 minutes')`
            );

            for (const device of offlineDevices) {
                await AlertService.createAlert(device.meter_id, 'device_offline',
                    `Device offline - last seen: ${device.last_heartbeat}`, 'warning');
            }

            console.log('Health check completed');

        } catch (error) {
            console.error('Health check failed:', error);
        }
    }

    async optimizeDatabase() {
        try {
            console.log('Running database optimization...');

            // Vacuum database to reclaim space
            await database.run('VACUUM');
            
            // Analyze to update statistics
            await database.run('ANALYZE');
            
            // Reindex
            await database.run('REINDEX');

            console.log('Database optimization completed');

        } catch (error) {
            console.error('Database optimization failed:', error);
        }
    }

    async getMaintenanceStats() {
        try {
            const stats = {
                last_cleanup: await this.getLastCleanupTime(),
                database_size: await this.getDatabaseSize(),
                total_records: await this.getTotalRecords(),
                oldest_data: await this.getOldestDataTime(),
                health_status: 'good'
            };

            return stats;
        } catch (error) {
            console.error('Error getting maintenance stats:', error);
            return { health_status: 'error', error: error.message };
        }
    }

    async getLastCleanupTime() {
        // This would typically be stored in a maintenance log table
        // For now, return estimated based on current time
        const now = new Date();
        const lastCleanup = new Date(now);
        lastCleanup.setHours(2, 0, 0, 0); // 2 AM today
        
        if (lastCleanup > now) {
            lastCleanup.setDate(lastCleanup.getDate() - 1); // Yesterday 2 AM
        }
        
        return lastCleanup.toISOString();
    }

    async getDatabaseSize() {
        try {
            const fs = require('fs');
            const path = require('path');
            const dbPath = path.resolve(config.DB_PATH || './database/meter.db');
            
            if (fs.existsSync(dbPath)) {
                const stats = fs.statSync(dbPath);
                return `${(stats.size / 1024 / 1024).toFixed(2)} MB`;
            }
        } catch (error) {
            console.error('Error getting database size:', error);
        }
        return 'Unknown';
    }

    async getTotalRecords() {
        try {
            const counts = await database.all(`
                SELECT 
                    'realtime_data' as table_name, 
                    COUNT(*) as count 
                FROM realtime_data
                UNION ALL
                SELECT 
                    'historical_data' as table_name, 
                    COUNT(*) as count 
                FROM historical_data
                UNION ALL
                SELECT 
                    'transactions' as table_name, 
                    COUNT(*) as count 
                FROM transactions
                UNION ALL
                SELECT 
                    'alerts' as table_name, 
                    COUNT(*) as count 
                FROM alerts
            `);

            const result = {};
            counts.forEach(row => {
                result[row.table_name] = row.count;
            });

            return result;
        } catch (error) {
            console.error('Error getting total records:', error);
            return {};
        }
    }

    async getOldestDataTime() {
        try {
            const oldest = await database.get(
                `SELECT MIN(timestamp) as oldest_time FROM realtime_data`
            );
            return oldest?.oldest_time || 'No data';
        } catch (error) {
            console.error('Error getting oldest data time:', error);
            return 'Error';
        }
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            activeJobs: this.jobs.length,
            nextCleanup: '02:00 daily',
            nextHealthCheck: 'Every hour',
            nextOptimization: '03:00 Sunday'
        };
    }
}

module.exports = new MaintenanceService();
