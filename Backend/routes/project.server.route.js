const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');

const projectCtrl = require('../controllers/project/project.controller');
const collabCtrl = require('../controllers/project/collaboration.controller');
const moodboardCtrl = require('../controllers/project/moodboard.controller');

// Basic project CRUD
router.post('/', requireAuth, projectCtrl.createProject);
router.get('/my', requireAuth, projectCtrl.getMyProjects);
router.get('/invites', requireAuth, collabCtrl.getPendingInvites);

// Moodboard (specific routes first)
router.post('/:id/images', requireAuth, uploadImage, moodboardCtrl.uploadMoodboardImage);
router.get('/:id/images', requireAuth, moodboardCtrl.getProjectImages);
router.delete('/:id/images/:imageId', requireAuth, moodboardCtrl.deleteProjectImage);

// Collaboration
router.post('/:id/invite', requireAuth, collabCtrl.inviteToProject);
router.patch('/:id/accept', requireAuth, collabCtrl.acceptInvite);
router.delete('/:id/decline', requireAuth, collabCtrl.declineInvite);

// Generic project routes LAST
router.get('/:id', requireAuth, projectCtrl.getProject);
router.patch('/:id', requireAuth, projectCtrl.updateProject);
router.delete('/:id', requireAuth, projectCtrl.deleteProject);
module.exports = router;