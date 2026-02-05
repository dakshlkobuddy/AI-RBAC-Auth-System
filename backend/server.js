const express = require('express');
const cors = require('cors');
require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const supportTicketRoutes = require('./routes/supportTicketRoutes');
const emailRoutes = require('./routes/emailRoutes');
const contactRoutes = require('./routes/contactRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const { startImapPolling } = require('./services/imapService');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/support/tickets', supportTicketRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/marketing', marketingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║     Email-Based CRM System with RBAC                   ║
║     Server running on http://localhost:${PORT}              ║
╚════════════════════════════════════════════════════════╝
  `);
  startImapPolling();
});
