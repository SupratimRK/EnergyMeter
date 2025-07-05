const database = require('../config/database');

class AlertService {
    static async createAlert(meterId, alertType, message, severity = 'info') {
        try {
            const result = await database.run(
                `INSERT INTO alerts (meter_id, alert_type, message, severity) 
                 VALUES (?, ?, ?, ?)`,
                [meterId, alertType, message, severity]
            );

            const alert = {
                id: result.id,
                meter_id: meterId,
                alert_type: alertType,
                message,
                severity,
                created_at: new Date().toISOString()
            };

            // Trigger webhook if configured
            await this.triggerWebhook('alert_created', alert);

            console.log(`Alert created: [${severity.toUpperCase()}] ${alertType} - ${message}`);
            return alert;

        } catch (error) {
            console.error('Error creating alert:', error);
            throw error;
        }
    }

    static async getAlerts(meterId, limit = 50, unreadOnly = false) {
        try {
            let sql = `SELECT * FROM alerts WHERE meter_id = ?`;
            const params = [meterId];

            if (unreadOnly) {
                sql += ` AND is_read = 0`;
            }

            sql += ` ORDER BY created_at DESC LIMIT ?`;
            params.push(limit);

            return await database.all(sql, params);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            throw error;
        }
    }

    static async markAsRead(alertId) {
        try {
            return await database.run(
                `UPDATE alerts SET is_read = 1 WHERE id = ?`,
                [alertId]
            );
        } catch (error) {
            console.error('Error marking alert as read:', error);
            throw error;
        }
    }

    static async markAllAsRead(meterId) {
        try {
            return await database.run(
                `UPDATE alerts SET is_read = 1 WHERE meter_id = ?`,
                [meterId]
            );
        } catch (error) {
            console.error('Error marking all alerts as read:', error);
            throw error;
        }
    }

    static async deleteAlert(alertId) {
        try {
            return await database.run(`DELETE FROM alerts WHERE id = ?`, [alertId]);
        } catch (error) {
            console.error('Error deleting alert:', error);
            throw error;
        }
    }

    static async getAlertsSummary(meterId) {
        try {
            return await database.get(
                `SELECT 
                    COUNT(*) as total_alerts,
                    SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_alerts,
                    SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_alerts,
                    SUM(CASE WHEN severity = 'warning' THEN 1 ELSE 0 END) as warning_alerts,
                    SUM(CASE WHEN severity = 'info' THEN 1 ELSE 0 END) as info_alerts
                 FROM alerts 
                 WHERE meter_id = ?`,
                [meterId]
            );
        } catch (error) {
            console.error('Error fetching alerts summary:', error);
            throw error;
        }
    }

    static async triggerWebhook(eventType, data) {
        // This would trigger configured webhooks
        // Implementation in WebhookService
        const WebhookService = require('./webhookService');
        await WebhookService.triggerWebhooks(eventType, data);
    }

    static async cleanup(days = 30) {
        try {
            return await database.run(
                `DELETE FROM alerts 
                 WHERE created_at < datetime('now', '-${days} days')`
            );
        } catch (error) {
            console.error('Error cleaning up old alerts:', error);
            throw error;
        }
    }
}

module.exports = AlertService;
