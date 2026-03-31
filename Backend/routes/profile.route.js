const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profile.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/me', requireAuth, profileController.getMyProfile);
router.put('/me', requireAuth, profileController.upsertMyProfile);
router.get('/:id', requireAuth, profileController.getProfileById);

module.exports = router;