const express = require('express');
const router = express.Router();
const { MeterModel } = require('../models');
const database = require('../config/database');
const config = require('../config/config');

// Get device status
router.get('/status', async (req, res) => {
    try {
        const meterId = req.query.meter_id || config.DEFAULT_METER.METER_ID;
        
        const deviceStatus = await database.get(
            `SELECT ds.*, m.connection_status, m.location, m.customer_name 
             FROM device_status ds
             JOIN meters m ON ds.meter_id = m.meter_id
             WHERE ds.meter_id = ?`,
            [meterId]
        );

        if (!deviceStatus) {
            return res.status(404).json({
                success: false,
                message: 'Device status not found'
            });
        }

        res.json({
            success: true,
            data: {
                meter_id: deviceStatus.meter_id,
                status: deviceStatus.status,
                connection_status: deviceStatus.connection_status,
                location: deviceStatus.location,
                customer_name: deviceStatus.customer_name,
                last_heartbeat: deviceStatus.last_heartbeat,
                firmware_version: deviceStatus.firmware_version,
                signal_strength: `${deviceStatus.signal_strength}%`,
                temperature: `${deviceStatus.temperature}°C`,
                uptime: calculateUptime(deviceStatus.last_heartbeat)
            }
        });
    } catch (error) {
        console.error('Error fetching device status:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Disconnect meter supply
router.post('/disconnect', async (req, res) => {
    try {
        const meterId = req.body.meter_id || config.DEFAULT_METER.METER_ID;
        const reason = req.body.reason || 'Manual disconnect';

        // Update connection status
        await MeterModel.updateConnectionStatus(meterId, 'disconnected');
        
        // Update device status
        await database.run(
            `UPDATE device_status SET status = 'offline' WHERE meter_id = ?`,
            [meterId]
        );

        // Create alert
        const AlertService = require('../services/alertService');
        await AlertService.createAlert(meterId, 'meter_disconnected', 
            `Meter disconnected: ${reason}`, 'warning');

        // Trigger webhook
        const WebhookService = require('../services/webhookService');
        await WebhookService.triggerWebhooks('meter_disconnected', {
            meter_id: meterId,
            reason: reason,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Meter disconnected successfully',
            data: {
                meter_id: meterId,
                status: 'disconnected',
                reason: reason,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error disconnecting meter:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Reconnect meter supply
router.post('/reconnect', async (req, res) => {
    try {
        const meterId = req.body.meter_id || config.DEFAULT_METER.METER_ID;
        const reason = req.body.reason || 'Manual reconnect';

        // Check if balance is sufficient
        const { BalanceModel } = require('../models');
        const balance = await BalanceModel.getBalance(meterId);
        
        if (balance.current_balance <= config.ALERTS.CRITICAL_BALANCE_THRESHOLD) {
            return res.status(400).json({
                success: false,
                message: 'Cannot reconnect: Insufficient balance',
                current_balance: `₹${balance.current_balance.toFixed(2)}`,
                minimum_required: `₹${config.ALERTS.CRITICAL_BALANCE_THRESHOLD.toFixed(2)}`
            });
        }

        // Update connection status
        await MeterModel.updateConnectionStatus(meterId, 'connected');
        
        // Update device status
        await database.run(
            `UPDATE device_status 
             SET status = 'online', last_heartbeat = CURRENT_TIMESTAMP 
             WHERE meter_id = ?`,
            [meterId]
        );

        // Create alert
        const AlertService = require('../services/alertService');
        await AlertService.createAlert(meterId, 'meter_connected', 
            `Meter reconnected: ${reason}`, 'info');

        // Trigger webhook
        const WebhookService = require('../services/webhookService');
        await WebhookService.triggerWebhooks('meter_connected', {
            meter_id: meterId,
            reason: reason,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Meter reconnected successfully',
            data: {
                meter_id: meterId,
                status: 'connected',
                reason: reason,
                current_balance: `₹${balance.current_balance.toFixed(2)}`,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error reconnecting meter:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Update device heartbeat
router.post('/heartbeat', async (req, res) => {
    try {
        const meterId = req.body.meter_id || config.DEFAULT_METER.METER_ID;
        const temperature = req.body.temperature || 25.0;
        const signalStrength = req.body.signal_strength || 100;

        await database.run(
            `UPDATE device_status 
             SET last_heartbeat = CURRENT_TIMESTAMP, temperature = ?, signal_strength = ?
             WHERE meter_id = ?`,
            [temperature, signalStrength, meterId]
        );

        res.json({
            success: true,
            message: 'Heartbeat updated',
            data: {
                meter_id: meterId,
                timestamp: new Date().toISOString(),
                temperature: `${temperature}°C`,
                signal_strength: `${signalStrength}%`
            }
        });
    } catch (error) {
        console.error('Error updating heartbeat:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get device health metrics
router.get('/health', async (req, res) => {
    try {
        const meterId = req.query.meter_id || config.DEFAULT_METER.METER_ID;
        
        const deviceStatus = await database.get(
            `SELECT * FROM device_status WHERE meter_id = ?`,
            [meterId]
        );

        if (!deviceStatus) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }

        const lastHeartbeat = new Date(deviceStatus.last_heartbeat);
        const now = new Date();
        const timeSinceHeartbeat = now - lastHeartbeat;
        const isOnline = timeSinceHeartbeat < 60000; // 1 minute threshold

        const health = {
            overall_status: isOnline ? 'healthy' : 'offline',
            connectivity: {
                status: isOnline ? 'connected' : 'disconnected',
                last_seen: deviceStatus.last_heartbeat,
                signal_strength: deviceStatus.signal_strength
            },
            hardware: {
                temperature: deviceStatus.temperature,
                temperature_status: this.getTemperatureStatus(deviceStatus.temperature),
                firmware_version: deviceStatus.firmware_version
            },
            uptime: calculateUptime(deviceStatus.last_heartbeat)
        };

        res.json({
            success: true,
            data: health
        });
    } catch (error) {
        console.error('Error fetching device health:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Helper functions
function calculateUptime(lastHeartbeat) {
    const lastSeen = new Date(lastHeartbeat);
    const now = new Date();
    const uptimeMs = now - lastSeen;
    
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
}

function getTemperatureStatus(temperature) {
    if (temperature < 0) return 'too_cold';
    if (temperature > 60) return 'too_hot';
    if (temperature > 50) return 'warm';
    return 'normal';
}

module.exports = router;
