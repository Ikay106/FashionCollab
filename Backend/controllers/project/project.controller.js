// backend/controllers/project/project.controller.js
const projectModel = require('../../models/project.model');
const { supabase } = require('../../lib/supabase');

/* Create */
exports.createProject = async (req, res) => {
  try {
    const { title, description, location, shoot_date, status } = req.body;
    const userId = req.user.id;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const { project, error } = await projectModel.createProject(userId, {
      title, description, location, shoot_date, status
    });

    if (error) throw error;

    res.status(201).json({ message: 'Project created', project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

/* List my projects */
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

/* Update */
exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { project, error } = await projectModel.updateProject(projectId, userId, updates);
    if (error) throw error;

    res.json({ message: 'Project updated', project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: error.message || 'Failed to update project' });
  }
};

/* Delete */
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const result = await projectModel.deleteProject(projectId, userId);
    res.json(result);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

/**
 * Get single project by ID - only owner or accepted member
 */
exports.getProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const { project, error } = await projectModel.getProjectById(projectId, userId);

    if (error) throw error;

    res.json({ project });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'Project not found' });
    }
    if (error.message.includes('authorized')) {
      return res.status(403).json({ error: 'Not authorized to view this project' });
    }
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};