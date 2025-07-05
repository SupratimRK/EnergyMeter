// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const config = require('./src/config/config');
const database = require('./src/config/database');
const simulationService = require('./src/services/simulationService');

// Import routes
const realtimeRoutes = require('./src/routes/realtime');
const historicalRoutes = require('./src/routes/historical');
const balanceRoutes = require('./src/routes/balance');
const deviceRoutes = require('./src/routes/device');
const configRoutes = require('./src/routes/config');

class EnergyMeterServer {
    constructor() {
        this.app = express();
        this.server = null;
        this.wss = null;
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet());
        
        // CORS configuration
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || '*',
            credentials: true
        }));
        
        // Compression
        this.app.use(compression());
        
        // Logging
        this.app.use(morgan('combined'));
        
        // Serve static files
        this.app.use('/static', express.static(path.join(__dirname, 'public')));
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
    }

    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                success: true,
                message: 'Energy Meter Simulation Server is running',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: '1.0.0',
                simulation_status: simulationService.getStatus()
            });
        });

        // API routes
        this.app.use('/api/realtime', realtimeRoutes);
        this.app.use('/api/historical', historicalRoutes);
        this.app.use('/api/balance', balanceRoutes);
        this.app.use('/api/device', deviceRoutes);
        this.app.use('/api/config', configRoutes);

        // API documentation endpoint
        this.app.get('/api', (req, res) => {
            res.json({
                success: true,
                message: 'Prepaid Energy Meter Simulation API',
                version: '1.0.0',
                endpoints: {
                    realtime: {
                        'GET /api/realtime': 'Get current meter readings',
                        'GET /api/realtime/range': 'Get recent data within time range',
                        'GET /api/realtime/stream': 'WebSocket streaming info'
                    },
                    historical: {
                        'GET /api/historical': 'Get historical data (last 7 days)',
                        'GET /api/historical/range': 'Get historical data for date range',
                        'GET /api/historical/daily': 'Get daily consumption summary',
                        'GET /api/historical/weekly': 'Get weekly consumption summary'
                    },
                    balance: {
                        'GET /api/balance': 'Get current balance',
                        'POST /api/balance/recharge': 'Add balance (recharge)',
                        'GET /api/balance/transactions': 'Get transaction history',
                        'GET /api/balance/summary': 'Get balance summary'
                    },
                    device: {
                        'GET /api/device/status': 'Get device status',
                        'POST /api/device/disconnect': 'Disconnect meter',
                        'POST /api/device/reconnect': 'Reconnect meter',
                        'POST /api/device/heartbeat': 'Update device heartbeat',
                        'GET /api/device/health': 'Get device health metrics'
                    },
                    config: {
                        'GET /api/config/alerts': 'Get alerts',
                        'GET /api/config/rates': 'Get energy rates',
                        'PUT /api/config/rates': 'Update energy rates',
                        'GET /api/config/webhooks': 'Get webhooks',
                        'POST /api/config/webhooks': 'Create webhook',
                        'PUT /api/config/webhooks/:id': 'Update webhook',
                        'DELETE /api/config/webhooks/:id': 'Delete webhook'
                    }
                },
                websocket: `ws://localhost:${config.PORT}/realtime/stream`
            });
        });

        // Serve test dashboard
        this.app.get('/dashboard', (req, res) => {
            res.sendFile(path.join(__dirname, 'test-dashboard.html'));
        });

        // Serve simple test page
        this.app.get('/test', (req, res) => {
            res.sendFile(path.join(__dirname, 'simple-test.html'));
        });

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                success: true,
                message: 'Welcome to Prepaid Energy Meter Simulation Server',
                version: '1.0.0',
                documentation: '/api',
                health: '/health',
                dashboard: '/dashboard',
                simple_test: '/test',
                websocket: `ws://localhost:${config.PORT}/realtime/stream`
            });
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Endpoint not found',
                available_endpoints: '/api'
            });
        });
    }

    setupWebSocket() {
        // WebSocket will be set up after server creation
    }

    setupErrorHandling() {
        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('Global error handler:', error);
            
            res.status(error.status || 500).json({
                success: false,
                message: error.message || 'Internal server error',
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            });
        });
    }

    async initializeDatabase() {
        try {
            await database.connect();
            await database.initializeTables();
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    setupWebSocketServer() {
        this.wss = new WebSocket.Server({ 
            server: this.server,
            path: '/realtime/stream',
            perMessageDeflate: false,
            maxPayload: 64 * 1024,
            clientTracking: true,
            verifyClient: (info) => {
                // Log connection attempt for debugging
                console.log('WebSocket connection attempt from:', info.origin || 'unknown origin');
                return true; // Accept all connections for now
            }
        });

        this.wss.on('connection', (ws, req) => {
            const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            console.log('WebSocket client connected from:', clientIP, 'Origin:', req.headers.origin);
            
            // Set up ping/pong for keep-alive
            ws.isAlive = true;
            ws.on('pong', () => {
                ws.isAlive = true;
                console.log('Pong received from client');
            });

            // Send welcome message
            const welcomeMessage = {
                type: 'connection',
                message: 'Connected to Energy Meter real-time stream',
                timestamp: new Date().toISOString(),
                status: 'connected',
                client_id: `client_${Date.now()}`
            };

            try {
                ws.send(JSON.stringify(welcomeMessage));
                console.log('Welcome message sent to client');
            } catch (error) {
                console.error('Error sending welcome message:', error);
            }

            // Handle client messages
            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    console.log('WebSocket message received:', data);
                    
                    // Send immediate response if connection is open
                    if (ws.readyState === WebSocket.OPEN) {
                        const response = {
                            type: 'echo',
                            received: data,
                            timestamp: new Date().toISOString()
                        };
                        ws.send(JSON.stringify(response));
                        console.log('Echo response sent to client');
                    }
                } catch (error) {
                    console.error('WebSocket message error:', error);
                    // Send error response if possible
                    if (ws.readyState === WebSocket.OPEN) {
                        try {
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'Invalid message format',
                                timestamp: new Date().toISOString()
                            }));
                        } catch (sendError) {
                            console.error('Error sending error message:', sendError);
                        }
                    }
                }
            });

            ws.on('close', (code, reason) => {
                console.log(`WebSocket client disconnected: Code ${code}, Reason: ${reason.toString()}`);
                // Log common close codes for debugging
                switch(code) {
                    case 1000: console.log('Normal closure'); break;
                    case 1001: console.log('Going away'); break;
                    case 1002: console.log('Protocol error'); break;
                    case 1003: console.log('Unsupported data'); break;
                    case 1005: console.log('No status received (abnormal closure)'); break;
                    case 1006: console.log('Abnormal closure'); break;
                    case 1011: console.log('Server error'); break;
                    default: console.log('Unknown close code');
                }
            });

            ws.on('error', (error) => {
                console.error('WebSocket error for client:', error);
            });

            // Handle ping from client
            ws.on('ping', (data) => {
                console.log('Ping received from client, sending pong');
                ws.pong(data);
            });
        });

        // Ping clients periodically to keep connection alive
        const pingInterval = setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if (!ws.isAlive) {
                    console.log('Terminating inactive WebSocket connection');
                    return ws.terminate();
                }
                
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000); // Ping every 30 seconds

        // Broadcast real-time data to all connected clients
        this.broadcastInterval = setInterval(() => {
            if (this.wss.clients.size > 0) {
                this.broadcastRealtimeData();
            }
        }, config.SIMULATION.REALTIME_INTERVAL);

        this.wss.on('close', () => {
            clearInterval(pingInterval);
            clearInterval(this.broadcastInterval);
        });

        console.log('WebSocket server initialized with ping/pong keep-alive');
    }

    async broadcastRealtimeData() {
        try {
            const { RealtimeDataModel, BalanceModel } = require('./src/models');
            const meterId = config.DEFAULT_METER.METER_ID;
            
            const realtimeData = await RealtimeDataModel.getLatest(meterId);
            const balanceData = await BalanceModel.getBalance(meterId);

            if (realtimeData) {
                const wsData = {
                    type: 'realtime_update',
                    timestamp: new Date().toISOString(),
                    data: {
                        meter_id: realtimeData.meter_id,
                        voltage: `${realtimeData.voltage}V`,
                        current: `${realtimeData.current}A`,
                        power_factor: realtimeData.power_factor,
                        active_power: `${realtimeData.active_power}kW`,
                        frequency: `${realtimeData.frequency}Hz`,
                        current_balance: `₹${(balanceData?.current_balance || 0).toFixed(2)}`
                    }
                };

                this.wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(wsData));
                    }
                });
            }
        } catch (error) {
            console.error('Error broadcasting real-time data:', error);
        }
    }

    async start() {
        try {
            // Initialize database
            await this.initializeDatabase();

            // Create HTTP server
            this.server = http.createServer(this.app);

            // Setup WebSocket
            this.setupWebSocketServer();

            // Start server
            this.server.listen(config.PORT, () => {
                console.log(`🚀 Energy Meter Simulation Server running on port ${config.PORT}`);
                console.log(`📊 API Documentation: http://localhost:${config.PORT}/api`);
                console.log(`🔍 Health Check: http://localhost:${config.PORT}/health`);
                console.log(`⚡ WebSocket: ws://localhost:${config.PORT}/realtime/stream`);
            });

            // Start simulation
            simulationService.start();

            // Graceful shutdown
            this.setupGracefulShutdown();

        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
            
            // Stop simulation
            simulationService.stop();
            
            // Close WebSocket server
            if (this.wss) {
                this.wss.close();
            }
            
            // Close HTTP server
            if (this.server) {
                this.server.close();
            }
            
            // Close database connection
            await database.close();
            
            console.log('✅ Server shut down complete');
            process.exit(0);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
}

// Start the server
const server = new EnergyMeterServer();
server.start();

module.exports = EnergyMeterServer;
