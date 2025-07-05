const config = require('../config/config');
const { RealtimeDataModel, HistoricalDataModel, BalanceModel } = require('../models');
const AlertService = require('./alertService');
const WebhookService = require('./webhookService');

class SimulationService {
    constructor() {
        this.isRunning = false;
        this.realtimeInterval = null;
        this.historicalInterval = null;
        this.balanceUpdateInterval = null;
        this.currentSessionData = new Map(); // Store session data for each meter
    }

    start() {
        if (this.isRunning) {
            console.log('Simulation is already running');
            return;
        }

        console.log('Starting energy meter simulation...');
        this.isRunning = true;

        // Start real-time data generation
        this.realtimeInterval = setInterval(() => {
            this.generateRealtimeData();
        }, config.SIMULATION.REALTIME_INTERVAL);

        // Start historical data aggregation
        this.historicalInterval = setInterval(() => {
            this.aggregateHistoricalData();
        }, config.SIMULATION.HISTORICAL_INTERVAL);

        // Start balance updates
        this.balanceUpdateInterval = setInterval(() => {
            this.updateBalanceBasedOnConsumption();
        }, config.SIMULATION.BALANCE_UPDATE_INTERVAL);

        console.log('Simulation started successfully');
    }

    stop() {
        if (!this.isRunning) {
            return;
        }

        console.log('Stopping energy meter simulation...');
        
        if (this.realtimeInterval) {
            clearInterval(this.realtimeInterval);
            this.realtimeInterval = null;
        }
        
        if (this.historicalInterval) {
            clearInterval(this.historicalInterval);
            this.historicalInterval = null;
        }
        
        if (this.balanceUpdateInterval) {
            clearInterval(this.balanceUpdateInterval);
            this.balanceUpdateInterval = null;
        }

        this.isRunning = false;
        console.log('Simulation stopped');
    }

    async generateRealtimeData() {
        try {
            const meterId = config.DEFAULT_METER.METER_ID;
            const now = new Date();
            const hour = now.getHours();
            
            // Get load multiplier based on time of day
            const loadMultiplier = config.SIMULATION.LOAD_PATTERN[hour] || 0.5;
            
            // Generate voltage with realistic fluctuations
            const voltage = this.generateVoltage();
            
            // Generate current based on load pattern
            const current = this.generateCurrent(loadMultiplier);
            
            // Generate power factor
            const powerFactor = this.generatePowerFactor();
            
            // Calculate power values
            const activePower = voltage * current * powerFactor / 1000; // kW
            const reactivePower = activePower * Math.tan(Math.acos(powerFactor)); // kVAR
            const apparentPower = voltage * current / 1000; // kVA
            
            // Generate frequency
            const frequency = this.generateFrequency();
            
            // Calculate energy consumed since last reading (kWh)
            const energyConsumed = this.calculateEnergyConsumption(meterId, activePower);

            const realtimeData = {
                meter_id: meterId,
                voltage: Math.round(voltage * 100) / 100,
                current: Math.round(current * 100) / 100,
                power_factor: Math.round(powerFactor * 1000) / 1000,
                active_power: Math.round(activePower * 1000) / 1000,
                reactive_power: Math.round(reactivePower * 1000) / 1000,
                apparent_power: Math.round(apparentPower * 1000) / 1000,
                frequency: Math.round(frequency * 100) / 100,
                energy_consumed: Math.round(energyConsumed * 10000) / 10000
            };

            // Store in database
            await RealtimeDataModel.create(realtimeData);

            // Check for alerts
            await this.checkAlerts(realtimeData);

            // Emit WebSocket event (if implemented)
            this.emitRealtimeUpdate(realtimeData);

        } catch (error) {
            console.error('Error generating real-time data:', error);
        }
    }

    generateVoltage() {
        const { NOMINAL, MIN, MAX, FLUCTUATION } = config.SIMULATION.VOLTAGE;
        
        // Base voltage with small random fluctuation
        const baseVoltage = NOMINAL + (Math.random() - 0.5) * FLUCTUATION;
        
        // Ensure it stays within limits
        return Math.max(MIN, Math.min(MAX, baseVoltage));
    }

    generateCurrent(loadMultiplier) {
        const { MIN, MAX, IDLE } = config.SIMULATION.CURRENT;
        
        // Base current influenced by load pattern
        const baseCurrent = IDLE + (MAX - IDLE) * loadMultiplier;
        
        // Add some randomness (±20%)
        const randomFactor = 0.8 + Math.random() * 0.4;
        
        return Math.max(MIN, baseCurrent * randomFactor);
    }

    generatePowerFactor() {
        const { MIN, MAX } = config.SIMULATION.POWER_FACTOR;
        return MIN + Math.random() * (MAX - MIN);
    }

    generateFrequency() {
        const { NOMINAL, MIN, MAX } = config.SIMULATION.FREQUENCY;
        
        // Small variation around nominal frequency
        const variation = (Math.random() - 0.5) * 0.2;
        return Math.max(MIN, Math.min(MAX, NOMINAL + variation));
    }

    calculateEnergyConsumption(meterId, activePowerKW) {
        const now = Date.now();
        const sessionData = this.currentSessionData.get(meterId) || {
            lastTimestamp: now,
            cumulativeEnergy: 0
        };

        // Calculate time difference in hours
        const timeDiffHours = (now - sessionData.lastTimestamp) / (1000 * 60 * 60);
        
        // Energy consumed in this interval (kWh)
        const energyThisInterval = activePowerKW * timeDiffHours;
        
        // Update session data
        sessionData.lastTimestamp = now;
        sessionData.cumulativeEnergy += energyThisInterval;
        this.currentSessionData.set(meterId, sessionData);

        return energyThisInterval;
    }

    async aggregateHistoricalData() {
        try {
            const meterId = config.DEFAULT_METER.METER_ID;
            const endTime = new Date();
            const startTime = new Date(endTime.getTime() - 30 * 60 * 1000); // 30 minutes ago

            // Get real-time data for the last 30 minutes
            const realtimeData = await RealtimeDataModel.getRecentData(meterId, 30);
            
            if (realtimeData.length === 0) {
                return;
            }

            // Calculate averages
            const avgVoltage = realtimeData.reduce((sum, data) => sum + data.voltage, 0) / realtimeData.length;
            const avgCurrent = realtimeData.reduce((sum, data) => sum + data.current, 0) / realtimeData.length;
            const avgPowerFactor = realtimeData.reduce((sum, data) => sum + data.power_factor, 0) / realtimeData.length;
            const totalEnergyConsumed = realtimeData.reduce((sum, data) => sum + data.energy_consumed, 0);

            // Calculate cost based on current rate
            const currentRate = this.getCurrentEnergyRate();
            const cost = totalEnergyConsumed * currentRate;

            const historicalData = {
                meter_id: meterId,
                voltage_avg: Math.round(avgVoltage * 100) / 100,
                current_avg: Math.round(avgCurrent * 100) / 100,
                power_factor_avg: Math.round(avgPowerFactor * 1000) / 1000,
                energy_consumed: Math.round(totalEnergyConsumed * 10000) / 10000,
                cost: Math.round(cost * 100) / 100,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString()
            };

            await HistoricalDataModel.create(historicalData);
            console.log(`Historical data aggregated: ${totalEnergyConsumed.toFixed(4)} kWh, Cost: ₹${cost.toFixed(2)}`);

        } catch (error) {
            console.error('Error aggregating historical data:', error);
        }
    }

    getCurrentEnergyRate() {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

        for (const rate of config.ENERGY_RATES) {
            if (currentTime >= rate.startTime && currentTime <= rate.endTime) {
                return rate.rate;
            }
        }

        // Default to normal rate if no match found
        return config.ENERGY_RATES.find(rate => rate.name === 'Normal')?.rate || 6.00;
    }

    async updateBalanceBasedOnConsumption() {
        try {
            const meterId = config.DEFAULT_METER.METER_ID;
            
            // Get recent consumption data
            const realtimeData = await RealtimeDataModel.getRecentData(meterId, 1);
            
            if (realtimeData.length === 0) {
                return;
            }

            // Calculate total consumption in the last minute
            const totalConsumption = realtimeData.reduce((sum, data) => sum + data.energy_consumed, 0);
            
            if (totalConsumption > 0) {
                const currentRate = this.getCurrentEnergyRate();
                const cost = totalConsumption * currentRate;

                // Deduct from balance
                const result = await BalanceModel.deductConsumption(meterId, cost);
                
                // Check for low balance alerts
                if (result.balance_after <= config.ALERTS.CRITICAL_BALANCE_THRESHOLD) {
                    await AlertService.createAlert(meterId, 'low_balance', 
                        `Critical balance warning: ₹${result.balance_after.toFixed(2)} remaining`, 'critical');
                    
                    // Disconnect meter if balance is too low
                    // await this.disconnectMeter(meterId);
                }
            }

        } catch (error) {
            console.error('Error updating balance:', error);
        }
    }

    async checkAlerts(realtimeData) {
        const { voltage, current, active_power } = realtimeData;
        const meterId = realtimeData.meter_id;

        // Voltage alerts
        if (voltage > config.ALERTS.VOLTAGE_HIGH_THRESHOLD) {
            await AlertService.createAlert(meterId, 'high_voltage', 
                `High voltage detected: ${voltage}V`, 'warning');
        } else if (voltage < config.ALERTS.VOLTAGE_LOW_THRESHOLD) {
            await AlertService.createAlert(meterId, 'low_voltage', 
                `Low voltage detected: ${voltage}V`, 'warning');
        }

        // High consumption alert
        if (active_power > config.ALERTS.HIGH_CONSUMPTION_THRESHOLD) {
            await AlertService.createAlert(meterId, 'high_consumption', 
                `High power consumption: ${active_power}kW`, 'info');
        }
    }

    emitRealtimeUpdate(data) {
        // This would emit WebSocket events to connected clients
        // Implementation depends on WebSocket setup
        console.log(`Real-time update: ${data.voltage}V, ${data.current}A, ${data.active_power}kW`);
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            activeMeters: this.currentSessionData.size,
            uptimeMs: this.isRunning ? Date.now() - this.startTime : 0
        };
    }
}

module.exports = new SimulationService();
