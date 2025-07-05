const database = require('../src/config/database');
const config = require('../src/config/config');
const { MeterModel, BalanceModel } = require('../src/models');

async function seedData() {
    try {
        console.log('Seeding database with sample data...');
        
        await database.connect();
        
        // Create default meter
        console.log('Creating default meter...');
        try {
            await MeterModel.create({
                meter_id: config.DEFAULT_METER.METER_ID,
                location: config.DEFAULT_METER.LOCATION,
                customer_name: config.DEFAULT_METER.CUSTOMER_NAME,
                customer_id: config.DEFAULT_METER.CUSTOMER_ID
            });
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                console.log('Default meter already exists, skipping...');
            } else {
                throw error;
            }
        }
        
        // Add initial balance
        console.log('Setting initial balance...');
        const currentBalance = await BalanceModel.getBalance(config.DEFAULT_METER.METER_ID);
        if (currentBalance && currentBalance.current_balance === 0) {
            await BalanceModel.recharge(
                config.DEFAULT_METER.METER_ID, 
                config.DEFAULT_METER.INITIAL_BALANCE,
                'Initial balance setup'
            );
        }
        
        // Create sample webhooks
        console.log('Creating sample webhook configurations...');
        await database.run(
            `INSERT OR REPLACE INTO webhooks (id, name, url, events, is_active) 
             VALUES (1, 'Sample Webhook', 'https://httpbin.org/post', ?, 0)`,
            [JSON.stringify(['realtime_update', 'balance_low', 'alert_created'])]
        );
        
        // Generate some historical data for the last 24 hours
        console.log('Generating sample historical data...');
        const meterId = config.DEFAULT_METER.METER_ID;
        const now = new Date();
        
        for (let i = 48; i >= 1; i--) {
            const startTime = new Date(now.getTime() - i * 30 * 60 * 1000); // 30 minutes ago
            const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
            
            // Generate realistic sample data
            const hour = startTime.getHours();
            const loadMultiplier = config.SIMULATION.LOAD_PATTERN[hour] || 0.5;
            
            const voltage = 220 + (Math.random() - 0.5) * 4;
            const current = 1 + (15 * loadMultiplier * Math.random());
            const powerFactor = 0.85 + Math.random() * 0.1;
            const energyConsumed = (voltage * current * powerFactor / 1000) * 0.5; // 30 minutes = 0.5 hours
            const currentRate = getCurrentRate(startTime);
            const cost = energyConsumed * currentRate;
            
            await database.run(
                `INSERT INTO historical_data 
                 (meter_id, voltage_avg, current_avg, power_factor_avg, energy_consumed, cost, start_time, end_time)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [meterId, 
                 Math.round(voltage * 100) / 100,
                 Math.round(current * 100) / 100,
                 Math.round(powerFactor * 1000) / 1000,
                 Math.round(energyConsumed * 10000) / 10000,
                 Math.round(cost * 100) / 100,
                 startTime.toISOString(),
                 endTime.toISOString()]
            );
        }
        
        // Create some sample alerts
        console.log('Creating sample alerts...');
        const alertTypes = [
            { type: 'low_balance', message: 'Balance is getting low', severity: 'warning' },
            { type: 'high_consumption', message: 'High power consumption detected', severity: 'info' },
            { type: 'system', message: 'System maintenance completed', severity: 'info' }
        ];
        
        for (const alert of alertTypes) {
            await database.run(
                `INSERT INTO alerts (meter_id, alert_type, message, severity, created_at)
                 VALUES (?, ?, ?, ?, ?)`,
                [meterId, alert.type, alert.message, alert.severity, 
                 new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString()]
            );
        }
        
        console.log('✅ Database seeded successfully');
        
        // Display summary
        const balance = await BalanceModel.getBalance(meterId);
        const historicalCount = await database.get(
            `SELECT COUNT(*) as count FROM historical_data WHERE meter_id = ?`,
            [meterId]
        );
        const alertCount = await database.get(
            `SELECT COUNT(*) as count FROM alerts WHERE meter_id = ?`,
            [meterId]
        );
        
        console.log('\n📊 Seeding Summary:');
        console.log(`- Meter ID: ${meterId}`);
        console.log(`- Initial Balance: ₹${balance.current_balance.toFixed(2)}`);
        console.log(`- Historical Records: ${historicalCount.count}`);
        console.log(`- Sample Alerts: ${alertCount.count}`);
        console.log('- Energy Rates: 3 time-based rates configured');
        console.log('- Sample Webhook: 1 webhook configuration created');
        
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        throw error;
    } finally {
        await database.close();
    }
}

function getCurrentRate(time) {
    const timeString = time.toTimeString().slice(0, 5);
    
    for (const rate of config.ENERGY_RATES) {
        if (timeString >= rate.startTime && timeString <= rate.endTime) {
            return rate.rate;
        }
    }
    
    return 6.00; // Default rate
}

// Run seeding if called directly
if (require.main === module) {
    seedData()
        .then(() => {
            console.log('Database seeding complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database seeding failed:', error);
            process.exit(1);
        });
}

module.exports = seedData;
