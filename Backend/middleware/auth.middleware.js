// backend/middleware/auth.middleware.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Middleware to protect routes - checks for valid JWT from Supabase Auth
 */
const requireAuth = async (req, res, next) => {
  // Get token from Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authorization token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach the authenticated user to the request object
    // So controllers can use req.user if needed
    req.user = user;

    next(); // Token is valid → proceed to controller
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = { requireAuth };