const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class MeterModel {
    static async create(meterData) {
        const { meter_id, location, customer_name, customer_id } = meterData;
        
        const result = await database.run(
            `INSERT INTO meters (meter_id, location, customer_name, customer_id) 
             VALUES (?, ?, ?, ?)`,
            [meter_id, location, customer_name, customer_id]
        );
        
        // Initialize balance
        await database.run(
            `INSERT INTO balance (meter_id, current_balance) VALUES (?, ?)`,
            [meter_id, 0]
        );
        
        // Initialize device status
        await database.run(
            `INSERT INTO device_status (meter_id, status) VALUES (?, ?)`,
            [meter_id, 'online']
        );
        
        return result;
    }
    
    static async getById(meter_id) {
        return await database.get(
            `SELECT * FROM meters WHERE meter_id = ?`,
            [meter_id]
        );
    }
    
    static async getAll() {
        return await database.all(`SELECT * FROM meters`);
    }
    
    static async updateConnectionStatus(meter_id, status) {
        return await database.run(
            `UPDATE meters SET connection_status = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE meter_id = ?`,
            [status, meter_id]
        );
    }
    
    static async delete(meter_id) {
        return await database.run(`DELETE FROM meters WHERE meter_id = ?`, [meter_id]);
    }
}

class RealtimeDataModel {
    static async create(data) {
        const {
            meter_id, voltage, current, power_factor, active_power,
            reactive_power, apparent_power, frequency, energy_consumed
        } = data;
        
        return await database.run(
            `INSERT INTO realtime_data 
             (meter_id, voltage, current, power_factor, active_power, 
              reactive_power, apparent_power, frequency, energy_consumed) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [meter_id, voltage, current, power_factor, active_power,
             reactive_power, apparent_power, frequency, energy_consumed]
        );
    }
    
    static async getLatest(meter_id) {
        return await database.get(
            `SELECT * FROM realtime_data 
             WHERE meter_id = ? 
             ORDER BY timestamp DESC 
             LIMIT 1`,
            [meter_id]
        );
    }
    
    static async getRecentData(meter_id, minutes = 60) {
        return await database.all(
            `SELECT * FROM realtime_data 
             WHERE meter_id = ? 
             AND timestamp >= datetime('now', '-${minutes} minutes')
             ORDER BY timestamp DESC`,
            [meter_id]
        );
    }
    
    static async cleanup(days = 1) {
        return await database.run(
            `DELETE FROM realtime_data 
             WHERE timestamp < datetime('now', '-${days} days')`
        );
    }
}

class HistoricalDataModel {
    static async create(data) {
        const {
            meter_id, voltage_avg, current_avg, power_factor_avg,
            energy_consumed, cost, start_time, end_time
        } = data;
        
        return await database.run(
            `INSERT INTO historical_data 
             (meter_id, voltage_avg, current_avg, power_factor_avg, 
              energy_consumed, cost, start_time, end_time) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [meter_id, voltage_avg, current_avg, power_factor_avg,
             energy_consumed, cost, start_time, end_time]
        );
    }
    
    static async getByDateRange(meter_id, startDate, endDate) {
        return await database.all(
            `SELECT * FROM historical_data 
             WHERE meter_id = ? 
             AND start_time >= ? 
             AND end_time <= ?
             ORDER BY start_time ASC`,
            [meter_id, startDate, endDate]
        );
    }
    
    static async getLast7Days(meter_id) {
        return await database.all(
            `SELECT * FROM historical_data 
             WHERE meter_id = ? 
             AND start_time >= datetime('now', '-7 days')
             ORDER BY start_time ASC`,
            [meter_id]
        );
    }
    
    static async getDailySummary(meter_id, date) {
        return await database.get(
            `SELECT 
                DATE(start_time) as date,
                SUM(energy_consumed) as total_energy,
                SUM(cost) as total_cost,
                AVG(voltage_avg) as avg_voltage,
                AVG(current_avg) as avg_current,
                AVG(power_factor_avg) as avg_power_factor
             FROM historical_data 
             WHERE meter_id = ? 
             AND DATE(start_time) = DATE(?)
             GROUP BY DATE(start_time)`,
            [meter_id, date]
        );
    }
    
    static async getWeeklySummary(meter_id) {
        return await database.all(
            `SELECT 
                DATE(start_time) as date,
                SUM(energy_consumed) as daily_energy,
                SUM(cost) as daily_cost
             FROM historical_data 
             WHERE meter_id = ? 
             AND start_time >= datetime('now', '-7 days')
             GROUP BY DATE(start_time)
             ORDER BY date ASC`,
            [meter_id]
        );
    }
}

class BalanceModel {
    static async getBalance(meter_id) {
        return await database.get(
            `SELECT * FROM balance WHERE meter_id = ?`,
            [meter_id]
        );
    }
    
    static async updateBalance(meter_id, amount, type = 'consumption') {
        const currentBalance = await this.getBalance(meter_id);
        if (!currentBalance) {
            throw new Error('Meter balance not found');
        }
        
        const newBalance = currentBalance.current_balance + amount;
        
        // Update balance
        await database.run(
            `UPDATE balance 
             SET current_balance = ?, last_updated = CURRENT_TIMESTAMP 
             WHERE meter_id = ?`,
            [newBalance, meter_id]
        );
        
        // Log transaction
        const transactionId = uuidv4();
        await database.run(
            `INSERT INTO transactions 
             (meter_id, transaction_id, type, amount, balance_before, balance_after) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [meter_id, transactionId, type, amount, 
             currentBalance.current_balance, newBalance]
        );
        
        return { 
            balance_before: currentBalance.current_balance, 
            balance_after: newBalance,
            transaction_id: transactionId
        };
    }
    
    static async recharge(meter_id, amount, description = 'Balance recharge') {
        return await this.updateBalance(meter_id, amount, 'recharge');
    }
    
    static async deductConsumption(meter_id, amount) {
        return await this.updateBalance(meter_id, -amount, 'consumption');
    }
}

class TransactionModel {
    static async getTransactions(meter_id, limit = 50) {
        return await database.all(
            `SELECT * FROM transactions 
             WHERE meter_id = ? 
             ORDER BY timestamp DESC 
             LIMIT ?`,
            [meter_id, limit]
        );
    }
    
    static async getTransactionsByType(meter_id, type, limit = 50) {
        return await database.all(
            `SELECT * FROM transactions 
             WHERE meter_id = ? AND type = ?
             ORDER BY timestamp DESC 
             LIMIT ?`,
            [meter_id, type, limit]
        );
    }
    
    static async getTransactionsSummary(meter_id, days = 30) {
        return await database.get(
            `SELECT 
                COUNT(*) as total_transactions,
                SUM(CASE WHEN type = 'recharge' THEN amount ELSE 0 END) as total_recharges,
                SUM(CASE WHEN type = 'consumption' THEN ABS(amount) ELSE 0 END) as total_consumption
             FROM transactions 
             WHERE meter_id = ? 
             AND timestamp >= datetime('now', '-${days} days')`,
            [meter_id]
        );
    }
}

module.exports = {
    MeterModel,
    RealtimeDataModel,
    HistoricalDataModel,
    BalanceModel,
    TransactionModel
};
