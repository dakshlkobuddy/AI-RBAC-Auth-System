// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // PostgreSQL error handling
  if (err.code === '23505') {
    return res.status(400).json({ message: 'Duplicate entry' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ message: 'Foreign key constraint error' });
  }

  // Default error response
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    status: err.status || 500,
  });
};

module.exports = errorHandler;
