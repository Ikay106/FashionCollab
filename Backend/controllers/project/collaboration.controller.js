// backend/controllers/project/collaboration.controller.js
const projectModel = require('../../models/project.model');

/* Invite */
exports.inviteToProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const ownerId = req.user.id;
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: 'Email required' });

    const result = await projectModel.inviteToProject(projectId, ownerId, email);
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('permission')) return res.status(403).json({ error: error.message });
    if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
    if (error.message.includes('already')) return res.status(409).json({ error: error.message });
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to invite' });
  }
};

/* Accept invite */
exports.acceptInvite = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const result = await projectModel.acceptInvite(projectId, userId);
    res.json(result);
  } catch (error) {
    if (error.message.includes('pending')) return res.status(404).json({ error: error.message });
    console.error('Accept error:', error);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
};