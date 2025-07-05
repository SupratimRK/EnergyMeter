const database = require('../src/config/database');
const config = require('../src/config/config');

async function initializeDatabase() {
    try {
        console.log('Initializing database...');
        
        await database.connect();
        await database.initializeTables();
        
        // Insert default energy rates
        console.log('Setting up default energy rates...');
        for (const rate of config.ENERGY_RATES) {
            await database.run(
                `INSERT OR REPLACE INTO energy_rates (rate_name, rate_per_kwh, start_time, end_time) 
                 VALUES (?, ?, ?, ?)`,
                [rate.name, rate.rate, rate.startTime, rate.endTime]
            );
        }
        
        console.log('✅ Database initialized successfully');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    } finally {
        await database.close();
    }
}

// Run initialization if called directly
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            console.log('Database initialization complete');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Database initialization failed:', error);
            process.exit(1);
        });
}

module.exports = initializeDatabase;
