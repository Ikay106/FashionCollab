const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');

// Basic project CRUD
const projectCtrl = require('../controllers/project/project.controller');
router.post('/', requireAuth, projectCtrl.createProject);
router.get('/my', requireAuth, projectCtrl.getMyProjects);
router.get('/:id', requireAuth, projectCtrl.getProject);
router.patch('/:id', requireAuth, projectCtrl.updateProject);
router.delete('/:id', requireAuth, projectCtrl.deleteProject);

// Collaboration
const collabCtrl = require('../controllers/project/collaboration.controller');
router.post('/:id/invite', requireAuth, collabCtrl.inviteToProject);
router.patch('/:id/accept', requireAuth, collabCtrl.acceptInvite);

// Moodboard
const moodboardCtrl = require('../controllers/project/moodboard.controller');
router.post('/:id/images', requireAuth, uploadImage, moodboardCtrl.uploadMoodboardImage);

module.exports = router;