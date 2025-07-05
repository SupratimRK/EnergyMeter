// Simple rate limiting middleware (basic implementation)
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        // Clean old requests
        for (const [key, timestamps] of requests.entries()) {
            requests.set(key, timestamps.filter(timestamp => now - timestamp < windowMs));
            if (requests.get(key).length === 0) {
                requests.delete(key);
            }
        }
        
        // Check current IP
        const userRequests = requests.get(ip) || [];
        
        if (userRequests.length >= max) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests from this IP, please try again later.',
                retry_after: Math.ceil(windowMs / 1000)
            });
        }
        
        // Add current request
        userRequests.push(now);
        requests.set(ip, userRequests);
        
        next();
    };
};

// Request validation middleware
const validateMeterID = (req, res, next) => {
    const meterId = req.query.meter_id || req.body.meter_id;
    
    if (meterId && !/^METER_\d{3}$/.test(meterId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid meter ID format. Expected format: METER_XXX',
            example: 'METER_001'
        });
    }
    
    next();
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
        };
        
        console.log(`[${logData.timestamp}] ${logData.method} ${logData.url} - ${logData.status} (${logData.duration})`);
    });
    
    next();
};

// Error handling middleware
const errorHandler = (error, req, res, next) => {
    console.error('Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(isDevelopment && { 
            stack: error.stack,
            details: error.details 
        })
    });
};

// Request timeout middleware
const requestTimeout = (timeout = 30000) => {
    return (req, res, next) => {
        res.setTimeout(timeout, () => {
            res.status(408).json({
                success: false,
                message: 'Request timeout'
            });
        });
        next();
    };
};

// Health check middleware
const healthCheck = (req, res, next) => {
    // Basic health checks could go here
    // For now, just pass through
    next();
};

module.exports = {
    createRateLimiter,
    validateMeterID,
    requestLogger,
    errorHandler,
    requestTimeout,
    healthCheck
};
