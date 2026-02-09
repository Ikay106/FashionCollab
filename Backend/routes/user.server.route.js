const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { validateSignup, validateLogin } = require('../validators/user.validator');

router.post('/signup', validateSignup, userController.signup);
router.post('/login', validateLogin, userController.login);

module.exports = router;
const { requireAuth } = require('../middleware/auth.middleware');

// Protected test route - only logged-in users can access
router.get('/me', requireAuth, (req, res) => {
  res.json({
    message: 'You are authenticated!',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.user_metadata?.role || 'unknown'
    }
  });
});