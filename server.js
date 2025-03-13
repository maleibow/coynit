const express = require('express');
const cors = require('cors');
const app = express();
// Use the PORT environment variable if available, otherwise fallback to 3000
const port = process.env.PORT || 3000;

// Enhanced CORS setup with specific options for deployments
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log important server info
console.log(`Server starting with PORT: ${port}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

// Parse JSON body
app.use(express.json());

// Serve static files
app.use(express.static('.'));

// In-memory storage for messages
let messages = [
  {
    id: Date.now() - 300000,
    name: "Test User",
    message: "This is a test message. Welcome to Coyn It!",
    amount: 25.50,
    timestamp: new Date(Date.now() - 300000).toISOString()
  }
];

// API routes
app.get('/api/messages', (req, res) => {
  console.log(`GET /api/messages - Returning ${messages.length} messages`);
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  console.log('POST /api/messages - Received:', req.body);

  const { name, message, amount } = req.body;

  if (!name || !message || isNaN(amount) || amount <= 0) {
    console.log('Invalid request data');
    return res.status(400).json({ error: 'Invalid message data' });
  }

  const newMessage = {
    id: Date.now(),
    name,
    message,
    amount,
    timestamp: new Date().toISOString()
  };

  messages.push(newMessage);
  console.log('Message added successfully');
  res.status(201).json(newMessage);
});

// Top spender endpoint
app.get('/api/top-spender', (req, res) => {
  console.log('GET /api/top-spender');
  
  if (messages.length === 0) {
    return res.json({ name: '', amount: 0 });
  }
  
  // Find the top spender
  let topSpender = messages.reduce((top, current) => 
    current.amount > top.amount ? current : top, { amount: 0 });
  
  res.json({ name: topSpender.name, amount: topSpender.amount });
});

// Leaderboards endpoint
app.get('/api/leaderboards', (req, res) => {
  console.log('GET /api/leaderboards');
  
  // Current date
  const now = new Date();
  
  // Get daily, weekly, and monthly data
  const daily = messages.filter(msg => {
    const msgDate = new Date(msg.timestamp);
    return msgDate.getDate() === now.getDate() &&
           msgDate.getMonth() === now.getMonth() &&
           msgDate.getFullYear() === now.getFullYear();
  });
  
  const weekly = messages.filter(msg => {
    const msgDate = new Date(msg.timestamp);
    const daysDiff = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));
    return daysDiff < 7;
  });
  
  const monthly = messages.filter(msg => {
    const msgDate = new Date(msg.timestamp);
    return msgDate.getMonth() === now.getMonth() &&
           msgDate.getFullYear() === now.getFullYear();
  });
  
  res.json({
    daily: processLeaderboardData(daily, 5),
    weekly: processLeaderboardData(weekly, 5),
    monthly: processLeaderboardData(monthly, 10)
  });
});

// Helper function for leaderboard processing
function processLeaderboardData(data, limit) {
  const spenders = {};
  
  data.forEach(msg => {
    if (!spenders[msg.name] || spenders[msg.name].amount < msg.amount) {
      spenders[msg.name] = { name: msg.name, amount: msg.amount };
    }
  });
  
  return Object.values(spenders)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});