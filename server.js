const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Connected clients
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  // Send immediate confirmation to client
  ws.send(JSON.stringify({ type: 'connection', status: 'connected' }));

  // Handle messages from clients
  ws.on('message', (message) => {
    try {
      // Log received messages with better formatting
      const parsedMessage = JSON.parse(message.toString());
      console.log('Received command:', parsedMessage.command || 'unknown command');
      console.log('Message details:', message.toString());
      
      // Broadcast message to all other clients
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  // Handle disconnections
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Keep track of connected clients
setInterval(() => {
  console.log(`Connected clients: ${clients.size}`);
}, 30000);

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`WebSocket server running at ws://localhost:${PORT}`);
  console.log(`To access from other devices on your network, use your computer's IP address`);
});
