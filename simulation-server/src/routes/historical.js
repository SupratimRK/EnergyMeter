const express = require('express');
const router = express.Router();
const { HistoricalDataModel } = require('../models');
const config = require('../config/config');

// Get historical data (default: last 7 days)
router.get('/', async (req, res) => {
    try {
        const meterId = req.query.meter_id || config.DEFAULT_METER.METER_ID;
        
        const historicalData = await HistoricalDataModel.getLast7Days(meterId);

        // Format data for response
        const formattedData = historicalData.map(item => ({
            timestamp: item.start_time,
            period: {
                start: item.start_time,
                end: item.end_time
            },
            readings: {
                voltage_avg: `${item.voltage_avg}V`,
                current_avg: `${item.current_avg}A`,
                power_factor_avg: item.power_factor_avg
            },
            consumption: {
                energy: `${item.energy_consumed}kWh`,
                cost: `₹${item.cost.toFixed(2)}`
            }
        }));

        res.json({
            success: true,
            data: formattedData,
            summary: {
                total_records: formattedData.length,
                period: 'Last 7 days (30-minute intervals)',
                total_energy: `${historicalData.reduce((sum, item) => sum + item.energy_consumed, 0).toFixed(4)}kWh`,
                total_cost: `₹${historicalData.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}`
            }
        });
    } catch (error) {
        console.error('Error fetching historical data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get historical data for custom date range
router.get('/range', async (req, res) => {
    try {
        const meterId = req.query.meter_id || config.DEFAULT_METER.METER_ID;
        const startDate = req.query.start_date;
        const endDate = req.query.end_date;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'start_date and end_date are required',
                format: 'YYYY-MM-DD HH:MM:SS'
            });
        }

        const historicalData = await HistoricalDataModel.getByDateRange(meterId, startDate, endDate);

        const formattedData = historicalData.map(item => ({
            timestamp: item.start_time,
            period: {
                start: item.start_time,
                end: item.end_time
            },
            readings: {
                voltage_avg: item.voltage_avg,
                current_avg: item.current_avg,
                power_factor_avg: item.power_factor_avg
            },
            consumption: {
                energy: item.energy_consumed,
                cost: item.cost
            }
        }));

        res.json({
            success: true,
            data: formattedData,
            summary: {
                total_records: formattedData.length,
                date_range: { start: startDate, end: endDate },
                total_energy: `${historicalData.reduce((sum, item) => sum + item.energy_consumed, 0).toFixed(4)}kWh`,
                total_cost: `₹${historicalData.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}`
            }
        });
    } catch (error) {
        console.error('Error fetching historical data range:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get daily consumption summary
router.get('/daily', async (req, res) => {
    try {
        const meterId = req.query.meter_id || config.DEFAULT_METER.METER_ID;
        const date = req.query.date || new Date().toISOString().split('T')[0];

        const dailySummary = await HistoricalDataModel.getDailySummary(meterId, date);

        if (!dailySummary) {
            return res.status(404).json({
                success: false,
                message: 'No data found for the specified date'
            });
        }

        res.json({
            success: true,
            data: {
                date: dailySummary.date,
                consumption: {
                    total_energy: `${dailySummary.total_energy}kWh`,
                    total_cost: `₹${dailySummary.total_cost.toFixed(2)}`
                },
                averages: {
                    voltage: `${dailySummary.avg_voltage}V`,
                    current: `${dailySummary.avg_current}A`,
                    power_factor: dailySummary.avg_power_factor
                }
            }
        });
    } catch (error) {
        console.error('Error fetching daily summary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get weekly consumption summary
router.get('/weekly', async (req, res) => {
    try {
        const meterId = req.query.meter_id || config.DEFAULT_METER.METER_ID;

        const weeklySummary = await HistoricalDataModel.getWeeklySummary(meterId);

        const totalEnergy = weeklySummary.reduce((sum, day) => sum + day.daily_energy, 0);
        const totalCost = weeklySummary.reduce((sum, day) => sum + day.daily_cost, 0);

        res.json({
            success: true,
            data: {
                daily_breakdown: weeklySummary.map(day => ({
                    date: day.date,
                    energy_consumed: `${day.daily_energy}kWh`,
                    cost: `₹${day.daily_cost.toFixed(2)}`
                })),
                summary: {
                    period: 'Last 7 days',
                    total_energy: `${totalEnergy.toFixed(4)}kWh`,
                    total_cost: `₹${totalCost.toFixed(2)}`,
                    average_daily_energy: `${(totalEnergy / 7).toFixed(4)}kWh`,
                    average_daily_cost: `₹${(totalCost / 7).toFixed(2)}`
                }
            }
        });
    } catch (error) {
        console.error('Error fetching weekly summary:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;
