// backend/routes/project.server.route.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { validateCreateProject, validateUpdateProject } = require('../validators/project.validator');

// Protected routes - must be logged in
router.post('/', requireAuth,validateCreateProject, projectController.createProject);
router.get('/my', requireAuth, projectController.getMyProjects);
router.delete('/:id', requireAuth, projectController.deleteProject);
router.patch('/:id', requireAuth,validateUpdateProject, projectController.updateProject);
router.post('/:id/invite', requireAuth, projectController.inviteToProject);
router.patch('/:id/accept', requireAuth, projectController.acceptInvite);

module.exports = router;