const axios = require('axios');
const database = require('../config/database');
const config = require('../config/config');

class WebhookService {
    static async createWebhook(webhookData) {
        try {
            const { name, url, events, secret_key } = webhookData;
            
            const result = await database.run(
                `INSERT INTO webhooks (name, url, events, secret_key) 
                 VALUES (?, ?, ?, ?)`,
                [name, url, JSON.stringify(events), secret_key]
            );

            return result;
        } catch (error) {
            console.error('Error creating webhook:', error);
            throw error;
        }
    }

    static async getWebhooks() {
        try {
            const webhooks = await database.all(`SELECT * FROM webhooks WHERE is_active = 1`);
            return webhooks.map(webhook => ({
                ...webhook,
                events: JSON.parse(webhook.events)
            }));
        } catch (error) {
            console.error('Error fetching webhooks:', error);
            throw error;
        }
    }

    static async updateWebhook(id, webhookData) {
        try {
            const { name, url, events, is_active, secret_key } = webhookData;
            
            const result = await database.run(
                `UPDATE webhooks 
                 SET name = ?, url = ?, events = ?, is_active = ?, secret_key = ?
                 WHERE id = ?`,
                [name, url, JSON.stringify(events), is_active, secret_key, id]
            );

            return result;
        } catch (error) {
            console.error('Error updating webhook:', error);
            throw error;
        }
    }

    static async deleteWebhook(id) {
        try {
            return await database.run(`DELETE FROM webhooks WHERE id = ?`, [id]);
        } catch (error) {
            console.error('Error deleting webhook:', error);
            throw error;
        }
    }

    static async triggerWebhooks(eventType, data) {
        try {
            const webhooks = await this.getWebhooks();
            
            const relevantWebhooks = webhooks.filter(webhook => 
                webhook.events.includes(eventType) || webhook.events.includes('*')
            );

            const promises = relevantWebhooks.map(webhook => 
                this.sendWebhook(webhook, eventType, data)
            );

            await Promise.allSettled(promises);
        } catch (error) {
            console.error('Error triggering webhooks:', error);
        }
    }

    static async sendWebhook(webhook, eventType, data, retryCount = 0) {
        try {
            const payload = {
                event: eventType,
                timestamp: new Date().toISOString(),
                meter_id: data.meter_id || data.id,
                data: data
            };

            const headers = {
                'Content-Type': 'application/json',
                'User-Agent': 'EnergyMeter-Webhook/1.0'
            };

            // Add signature if secret key is provided
            if (webhook.secret_key) {
                const crypto = require('crypto');
                const signature = crypto
                    .createHmac('sha256', webhook.secret_key)
                    .update(JSON.stringify(payload))
                    .digest('hex');
                headers['X-Webhook-Signature'] = `sha256=${signature}`;
            }

            const response = await axios.post(webhook.url, payload, {
                headers,
                timeout: config.WEBHOOKS.TIMEOUT
            });

            console.log(`Webhook sent successfully to ${webhook.name}: ${response.status}`);
            return response;

        } catch (error) {
            console.error(`Webhook failed for ${webhook.name}:`, error.message);
            
            // Retry logic
            if (retryCount < config.WEBHOOKS.RETRY_ATTEMPTS) {
                console.log(`Retrying webhook ${webhook.name} (attempt ${retryCount + 1})`);
                setTimeout(() => {
                    this.sendWebhook(webhook, eventType, data, retryCount + 1);
                }, config.WEBHOOKS.RETRY_DELAY * (retryCount + 1));
            }
            
            throw error;
        }
    }

    static async testWebhook(webhookId) {
        try {
            const webhook = await database.get(`SELECT * FROM webhooks WHERE id = ?`, [webhookId]);
            if (!webhook) {
                throw new Error('Webhook not found');
            }

            const testData = {
                meter_id: 'TEST_METER',
                message: 'This is a test webhook',
                timestamp: new Date().toISOString()
            };

            webhook.events = JSON.parse(webhook.events);
            await this.sendWebhook(webhook, 'test', testData);
            
            return { success: true, message: 'Test webhook sent successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Predefined webhook events
    static get WEBHOOK_EVENTS() {
        return [
            'realtime_update',
            'balance_update',
            'balance_low',
            'balance_critical',
            'alert_created',
            'meter_connected',
            'meter_disconnected',
            'recharge_completed',
            'consumption_high',
            'voltage_anomaly',
            'device_offline',
            'device_online',
            'test'
        ];
    }
}

module.exports = WebhookService;
