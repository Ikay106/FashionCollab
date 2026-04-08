const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const { uploadImage } = require('../middleware/upload.middleware');

const projectCtrl = require('../controllers/project/project.controller');
const collabCtrl = require('../controllers/project/collaboration.controller');
const moodboardCtrl = require('../controllers/project/moodboard.controller');
const commentCtrl = require('../controllers/project/comment.controller')
const noteCtrl = require('../controllers/project/note.controller')
const linkCtrl = require('../controllers/project/link.controller')

// Basic project CRUD
router.post('/', requireAuth, projectCtrl.createProject);
router.get('/my', requireAuth, projectCtrl.getMyProjects);
router.get('/invites', requireAuth, collabCtrl.getPendingInvites);

// Moodboard (specific routes first)
router.post('/:id/images', requireAuth, uploadImage, moodboardCtrl.uploadMoodboardImage);
router.get('/:id/images', requireAuth, moodboardCtrl.getProjectImages);
router.delete('/:id/images/:imageId', requireAuth, moodboardCtrl.deleteProjectImage);

router.post('/:id/images/:imageId/comments', requireAuth, commentCtrl.addComment)
router.get('/:id/images/:imageId/comments', requireAuth, commentCtrl.getComments)

// Collaboration
router.post('/:id/invite', requireAuth, collabCtrl.inviteToProject);
router.patch('/:id/accept', requireAuth, collabCtrl.acceptInvite);
router.delete('/:id/decline', requireAuth, collabCtrl.declineInvite);

//notes
router.get('/:id/notes', requireAuth, noteCtrl.getProjectNotes)
router.post('/:id/notes', requireAuth, noteCtrl.addProjectNote)
router.delete('/:id/notes/:noteId', requireAuth, noteCtrl.deleteProjectNote)

//links
router.get('/:id/links', requireAuth, linkCtrl.getProjectLinks)
router.post('/:id/links', requireAuth, linkCtrl.addProjectLink)
router.delete('/:id/links/:linkId', requireAuth, linkCtrl.deleteProjectLink)

// Generic project routes LAST
router.get('/:id', requireAuth, projectCtrl.getProject);
router.patch('/:id', requireAuth, projectCtrl.updateProject);
router.delete('/:id', requireAuth, projectCtrl.deleteProject);
router.get('/:id/members', requireAuth, projectCtrl.getProjectMembers);
router.delete('/:id/members/:memberId', requireAuth, projectCtrl.removeMember)
router.delete('/:id/images/:imageId/comments/:commentId', requireAuth, commentCtrl.deleteComment)
module.exports = router;