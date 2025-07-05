const express = require('express');
const router = express.Router();
const AlertService = require('../services/alertService');
const WebhookService = require('../services/webhookService');
const config = require('../config/config');
const database = require('../config/database');
const Joi = require('joi');

// Alerts routes
router.get('/alerts', async (req, res) => {
    try {
        const meterId = req.query.meter_id || config.DEFAULT_METER.METER_ID;
        const limit = parseInt(req.query.limit) || 50;
        const unreadOnly = req.query.unread_only === 'true';

        const alerts = await AlertService.getAlerts(meterId, limit, unreadOnly);

        res.json({
            success: true,
            data: alerts,
            count: alerts.length
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

router.get('/alerts/summary', async (req, res) => {
    try {
        const meterId = req.query.meter_id || config.DEFAULT_METER.METER_ID;
        const summary = await AlertService.getAlertsSummary(meterId);

        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Error fetching alerts summary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

router.put('/alerts/:id/read', async (req, res) => {
    try {
        const alertId = req.params.id;
        await AlertService.markAsRead(alertId);

        res.json({
            success: true,
            message: 'Alert marked as read'
        });
    } catch (error) {
        console.error('Error marking alert as read:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Energy rates configuration
router.get('/rates', async (req, res) => {
    try {
        const rates = await database.all(
            `SELECT * FROM energy_rates WHERE is_active = 1 ORDER BY start_time`
        );

        res.json({
            success: true,
            data: rates.map(rate => ({
                id: rate.id,
                name: rate.rate_name,
                rate_per_kwh: `₹${rate.rate_per_kwh}`,
                time_period: `${rate.start_time} - ${rate.end_time}`,
                is_active: rate.is_active
            }))
        });
    } catch (error) {
        console.error('Error fetching energy rates:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

router.put('/rates', async (req, res) => {
    try {
        const schema = Joi.object({
            rates: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    rate_per_kwh: Joi.number().positive().required(),
                    start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
                    end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
                })
            ).required()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        // Deactivate all current rates
        await database.run(`UPDATE energy_rates SET is_active = 0`);

        // Insert new rates
        for (const rate of value.rates) {
            await database.run(
                `INSERT INTO energy_rates (rate_name, rate_per_kwh, start_time, end_time) 
                 VALUES (?, ?, ?, ?)`,
                [rate.name, rate.rate_per_kwh, rate.start_time, rate.end_time]
            );
        }

        res.json({
            success: true,
            message: 'Energy rates updated successfully',
            data: value.rates
        });
    } catch (error) {
        console.error('Error updating energy rates:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Webhooks configuration
router.get('/webhooks', async (req, res) => {
    try {
        const webhooks = await WebhookService.getWebhooks();

        res.json({
            success: true,
            data: webhooks,
            available_events: WebhookService.WEBHOOK_EVENTS
        });
    } catch (error) {
        console.error('Error fetching webhooks:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

router.post('/webhooks', async (req, res) => {
    try {
        const schema = Joi.object({
            name: Joi.string().required(),
            url: Joi.string().uri().required(),
            events: Joi.array().items(Joi.string()).required(),
            secret_key: Joi.string().optional()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        const result = await WebhookService.createWebhook(value);

        res.json({
            success: true,
            message: 'Webhook created successfully',
            data: {
                id: result.id,
                ...value
            }
        });
    } catch (error) {
        console.error('Error creating webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

router.put('/webhooks/:id', async (req, res) => {
    try {
        const webhookId = req.params.id;
        const schema = Joi.object({
            name: Joi.string().required(),
            url: Joi.string().uri().required(),
            events: Joi.array().items(Joi.string()).required(),
            is_active: Joi.boolean().optional(),
            secret_key: Joi.string().optional()
        });

        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        await WebhookService.updateWebhook(webhookId, value);

        res.json({
            success: true,
            message: 'Webhook updated successfully'
        });
    } catch (error) {
        console.error('Error updating webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

router.delete('/webhooks/:id', async (req, res) => {
    try {
        const webhookId = req.params.id;
        await WebhookService.deleteWebhook(webhookId);

        res.json({
            success: true,
            message: 'Webhook deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

router.post('/webhooks/:id/test', async (req, res) => {
    try {
        const webhookId = req.params.id;
        const result = await WebhookService.testWebhook(webhookId);

        res.json({
            success: result.success,
            message: result.message
        });
    } catch (error) {
        console.error('Error testing webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;
