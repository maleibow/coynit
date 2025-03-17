const express = require('express');
const bodyParser = require('body-parser');
const Database = require('@replit/database');

const app = express();
const db = new Database();

// Middleware
app.use(bodyParser.json());
app.use(express.static('.'));

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await db.get('messages') || [];
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Add a new message
app.post('/api/messages', async (req, res) => {
  try {
    const { name, message, amount } = req.body;
    
    // Validate input
    if (!name || !message || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid message data.' });
    }
    
    if (amount < 1.00 || amount > 10.00) {
      return res.status(400).json({ error: 'Amount must be between $1.00 and $10.00' });
    }
    
    // Get existing messages
    let messages = await db.get('messages') || [];
    
    // Check if user already exists and update their amount (case insensitive)
    const existingMessageIndex = messages.findIndex(m => m.name.toLowerCase() === name.toLowerCase());
    
    // Calculate total amount spent by this user
    const userTotalAmount = messages
      .filter(m => m.name === name)
      .reduce((total, m) => total + m.amount, 0) + amount;

    // Create new message
    const newMessage = {
      name,
      message,
      amount,
      totalAmount: userTotalAmount,
      timestamp: new Date().toISOString()
    };

    if (existingMessageIndex !== -1) {
      messages[existingMessageIndex] = newMessage;
    } else {
      messages.push(newMessage);
    }
    
    // Save back to database
    await db.set('messages', messages);
    
    // Update top spenders
    await updateTopSpenders(newMessage);
    
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Get top spender
app.get('/api/top-spender', async (req, res) => {
  try {
    const topSpender = await db.get('topSpender') || { name: '', amount: 0 };
    res.json(topSpender);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top spender' });
  }
});

// Get leaderboards
app.get('/api/leaderboards', async (req, res) => {
  try {
    const dailyTopSpenders = await db.get('dailyTopSpenders') || [];
    const weeklyTopSpenders = await db.get('weeklyTopSpenders') || [];
    const monthlyTopSpenders = await db.get('monthlyTopSpenders') || [];
    
    res.json({
      daily: dailyTopSpenders,
      weekly: weeklyTopSpenders,
      monthly: monthlyTopSpenders
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboards' });
  }
});

// Update top spenders (simplified version)
async function updateTopSpenders(newMessage) {
  try {
    // Get top spender
    let topSpender = await db.get('topSpender') || { name: '', amount: 0, message: '', totalAmount: 0 };
    
    // Get all messages and calculate total amounts for all users
    const messages = await db.get('messages') || [];
    const userTotals = {};
    const userLatestMessages = {};
    
    messages.forEach(msg => {
      if (!userTotals[msg.name]) userTotals[msg.name] = 0;
      userTotals[msg.name] += msg.amount;
      userLatestMessages[msg.name] = msg.message;
    });

    // Find user with highest total
    let highestTotal = 0;
    let topSpenderName = '';
    
    Object.entries(userTotals).forEach(([name, total]) => {
      if (total > highestTotal) {
        highestTotal = total;
        topSpenderName = name;
      }
    });

    // Update top spender if there's a new highest total
    if (topSpenderName) {
      const latestTopSpenderMessage = messages
        .filter(m => m.name === topSpenderName)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

      topSpender = {
        name: topSpenderName,
        amount: highestTotal,
        message: latestTopSpenderMessage ? latestTopSpenderMessage.message : '',
        totalAmount: highestTotal
      };
      await db.set('topSpender', topSpender);
    }
    
    // Update leaderboards (simplified)
    // In a real implementation, you would need to handle daily/weekly/monthly resets
    
    let dailyTopSpenders = await db.get('dailyTopSpenders') || [];
    let weeklyTopSpenders = await db.get('weeklyTopSpenders') || [];
    let monthlyTopSpenders = await db.get('monthlyTopSpenders') || [];
    
    // Add to daily top spenders
    const dailySpenderIndex = dailyTopSpenders.findIndex(s => s.name === newMessage.name);
    if (dailySpenderIndex >= 0) {
      if (newMessage.amount > dailyTopSpenders[dailySpenderIndex].amount) {
        dailyTopSpenders[dailySpenderIndex].amount = newMessage.amount;
      }
    } else {
      dailyTopSpenders.push({ name: newMessage.name, amount: newMessage.amount });
    }
    
    // Sort and limit to top 5
    dailyTopSpenders.sort((a, b) => b.amount - a.amount);
    dailyTopSpenders = dailyTopSpenders.slice(0, 5);
    
    // Similar logic for weekly and monthly
    // [Code omitted for brevity]
    
    // Save top spenders
    await db.set('dailyTopSpenders', dailyTopSpenders);
    await db.set('weeklyTopSpenders', weeklyTopSpenders);
    await db.set('monthlyTopSpenders', monthlyTopSpenders);
  } catch (error) {
    console.error('Failed to update top spenders:', error);
  }
}

// Start server
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
