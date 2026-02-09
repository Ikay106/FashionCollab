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