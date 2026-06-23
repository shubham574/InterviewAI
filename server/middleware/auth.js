const { requireAuth } = require('@clerk/express');

// Export Clerk's requireAuth as 'protect' to maintain compatibility with existing route definitions
const protect = requireAuth();

module.exports = { protect };
