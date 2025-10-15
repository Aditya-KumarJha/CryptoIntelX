const EventEmitter = require('events');

// In-memory client registry and event bus
const clients = new Set();
const bus = new EventEmitter();

// Keep-alive heartbeat interval (ms)
const HEARTBEAT_MS = 25000;

function addClient(res) {
  clients.add(res);
  res.on('close', () => {
    clients.delete(res);
  });
}

function sendEvent(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function broadcast(event, data) {
  for (const res of clients) {
    try { sendEvent(res, event, data); } catch { /* ignore */ }
  }
}

// Heartbeat to keep connections alive
setInterval(() => broadcast('heartbeat', { t: Date.now() }), HEARTBEAT_MS).unref();

// Public API for detections
function publishDetection(payload) {
  bus.emit('detection', payload);
  broadcast('detection', payload);
}

module.exports = { addClient, sendEvent, broadcast, publishDetection };
