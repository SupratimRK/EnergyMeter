const WebSocket = require('ws');

console.log('Starting WebSocket connection test...');

const ws = new WebSocket('ws://localhost:3000/realtime/stream');

let messageCount = 0;
let startTime = Date.now();

ws.on('open', function open() {
    console.log('✅ WebSocket connected successfully');
    console.log('📋 Waiting for real-time data...');
    
    // Send a test message
    ws.send(JSON.stringify({
        type: 'test',
        message: 'Hello from test client',
        timestamp: new Date().toISOString()
    }));
});

ws.on('message', function message(data) {
    messageCount++;
    const parsed = JSON.parse(data);
    
    console.log(`📨 Message ${messageCount} received:`, {
        type: parsed.type,
        timestamp: parsed.timestamp,
        dataKeys: parsed.data ? Object.keys(parsed.data) : 'no data'
    });
    
    // Log full data for first few messages
    if (messageCount <= 3) {
        console.log('Full message:', parsed);
    }
});

ws.on('close', function close(code, reason) {
    const duration = Date.now() - startTime;
    console.log(`❌ WebSocket closed after ${duration}ms`);
    console.log(`Close code: ${code}`);
    console.log(`Reason: ${reason}`);
    console.log(`Total messages received: ${messageCount}`);
});

ws.on('error', function error(err) {
    console.error('🚨 WebSocket error:', err);
});

ws.on('ping', function ping(data) {
    console.log('🏓 Ping received from server');
});

ws.on('pong', function pong(data) {
    console.log('🏓 Pong sent to server');
});

// Keep the process alive and log periodic status
setInterval(() => {
    const duration = Date.now() - startTime;
    console.log(`⏱️  Connection alive for ${Math.round(duration/1000)}s, received ${messageCount} messages`);
    
    if (ws.readyState === WebSocket.OPEN) {
        console.log('🟢 Connection status: OPEN');
    } else if (ws.readyState === WebSocket.CONNECTING) {
        console.log('🟡 Connection status: CONNECTING');
    } else if (ws.readyState === WebSocket.CLOSING) {
        console.log('🟠 Connection status: CLOSING');
    } else if (ws.readyState === WebSocket.CLOSED) {
        console.log('🔴 Connection status: CLOSED');
        process.exit(0);
    }
}, 10000); // Log every 10 seconds

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down test client...');
    ws.close();
    process.exit(0);
});

console.log('Test client started. Press Ctrl+C to stop.');
