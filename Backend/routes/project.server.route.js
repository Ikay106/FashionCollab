// backend/routes/project.server.route.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Protected routes - must be logged in
router.post('/', requireAuth, projectController.createProject);
router.get('/my', requireAuth, projectController.getMyProjects);

module.exports = router;