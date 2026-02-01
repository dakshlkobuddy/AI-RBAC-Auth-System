#!/usr/bin/env node

const path = require('path');

// Set environment variable
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

try {
  require('dotenv').config();
  console.log('✓ .env loaded');
  
  const express = require('express');
  console.log('✓ express loaded');
  
  const cors = require('cors');
  console.log('✓ cors loaded');
  
  const errorHandler = require('./middleware/errorHandler');
  console.log('✓ errorHandler loaded');
  
  const authRoutes = require('./routes/authRoutes');
  console.log('✓ authRoutes loaded');
  
  const userRoutes = require('./routes/userRoutes');
  console.log('✓ userRoutes loaded');
  
  const enquiryRoutes = require('./routes/enquiryRoutes');
  console.log('✓ enquiryRoutes loaded');
  
  const supportTicketRoutes = require('./routes/supportTicketRoutes');
  console.log('✓ supportTicketRoutes loaded');
  
  const emailRoutes = require('./routes/emailRoutes');
  console.log('✓ emailRoutes loaded');
  
  const contactRoutes = require('./routes/contactRoutes');
  console.log('✓ contactRoutes loaded');
  
  const marketingRoutes = require('./routes/marketingRoutes');
  console.log('✓ marketingRoutes loaded');
  
  const app = express();
  console.log('✓ app created');
  
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
  
  // Error handler
  app.use(errorHandler);
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║     Email-Based CRM System with RBAC                   ║
║     Server running on http://localhost:${PORT}              ║
╚════════════════════════════════════════════════════════╝
    `);
  });
} catch (error) {
  console.error('✗ FATAL ERROR:');
  console.error(error.message);
  console.error('\nStack trace:');
  console.error(error.stack);
  process.exit(1);
}
