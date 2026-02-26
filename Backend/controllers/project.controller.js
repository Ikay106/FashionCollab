// backend/controllers/project.controller.js
const projectModel = require('../models/project.model');

/**
 * Create a new project (protected route)
 */
exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { project, error } = await projectModel.createProject(userId, { title, description });

    if (error) throw error;

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

/**
 * Get all projects for the logged-in user
 */
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const { projects, error } = await projectModel.getUserProjects(userId);

    if (error) throw error;

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const result = await projectModel.deleteProject(projectId, userId);

    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

/**
 * Update a project (partial updates allowed)
 */
exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { title, description } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!title && !description) {
      return res.status(400).json({ error: 'Provide at least one field to update (title or description)' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;

    const { project, error } = await projectModel.updateProject(projectId, userId, updates);

    if (error) throw error;

    res.status(200).json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

/**
 * Invite a user to a project by email — only owner
 */
exports.inviteToProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const ownerId = req.user.id;
    const { email } = req.body;

    if (!projectId || !email) {
      return res.status(400).json({ error: 'Project ID and email required' });
    }

    const result = await projectModel.inviteToProject(projectId, ownerId, email);

    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('permission') || error.message.includes('not found')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('already')) {
      return res.status(409).json({ error: error.message });
    }
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to send invite' });
  }
};


/**
 * Accept an invite to a project
 */
exports.acceptInvite = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const result = await projectModel.acceptInvite(projectId, userId);

    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('pending invite')) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Accept invite error:', error);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
};