const express = require('express');
const router = express.Router();
const { RealtimeDataModel, BalanceModel } = require('../models');
const config = require('../config/config');

// Get current real-time data
router.get('/', async (req, res) => {
    try {
        const meterId = req.query.meter_id || config.DEFAULT_METER.METER_ID;
        
        const realtimeData = await RealtimeDataModel.getLatest(meterId);
        const balanceData = await BalanceModel.getBalance(meterId);

        if (!realtimeData) {
            return res.status(404).json({
                success: false,
                message: 'No real-time data found for this meter'
            });
        }

        const response = {
            success: true,
            data: {
                meter_id: realtimeData.meter_id,
                timestamp: realtimeData.timestamp,
                voltage: `${realtimeData.voltage}V`,
                current: `${realtimeData.current}A`,
                power_factor: realtimeData.power_factor,
                active_power: `${realtimeData.active_power}kW`,
                reactive_power: `${realtimeData.reactive_power}kVAR`,
                apparent_power: `${realtimeData.apparent_power}kVA`,
                frequency: `${realtimeData.frequency}Hz`,
                energy_consumed: `${realtimeData.energy_consumed}kWh`,
                current_balance: `₹${(balanceData?.current_balance || 0).toFixed(2)}`
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Error fetching real-time data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get real-time data for a specific time range
router.get('/range', async (req, res) => {
    try {
        const meterId = req.query.meter_id || config.DEFAULT_METER.METER_ID;
        const minutes = parseInt(req.query.minutes) || 60;

        const data = await RealtimeDataModel.getRecentData(meterId, minutes);

        res.json({
            success: true,
            data: data.map(item => ({
                timestamp: item.timestamp,
                voltage: item.voltage,
                current: item.current,
                power_factor: item.power_factor,
                active_power: item.active_power,
                energy_consumed: item.energy_consumed
            })),
            count: data.length,
            time_range_minutes: minutes
        });
    } catch (error) {
        console.error('Error fetching real-time data range:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// WebSocket endpoint for live streaming (placeholder)
router.get('/stream', (req, res) => {
    res.json({
        success: true,
        message: 'WebSocket streaming endpoint',
        websocket_url: `ws://localhost:${config.PORT}/realtime/stream`,
        instructions: 'Connect to the WebSocket URL for real-time streaming data'
    });
});

module.exports = router;
