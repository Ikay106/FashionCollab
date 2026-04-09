// backend/controllers/project/project.controller.js
const projectModel = require('../../models/project/project.model')
const collaborationModel = require('../../models/project/collaboration.model')
 
exports.createProject = async (req, res) => {
  try {
    const { title, description, location, shoot_date, status } = req.body
    if (!title) return res.status(400).json({ error: 'Title is required' })
 
    const { project } = await projectModel.createProject(req.user.id, {
      title, description, location, shoot_date, status
    })
    res.status(201).json({ message: 'Project created', project })
  } catch (err) {
    console.error('Create project error:', err)
    res.status(500).json({ error: 'Failed to create project' })
  }
}
 
exports.getMyProjects = async (req, res) => {
  try {
    const { projects } = await projectModel.getUserProjects(req.user.id)
    res.json({ projects })
  } catch (err) {
    console.error('Get projects error:', err)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
}
 
exports.getProject = async (req, res) => {
  try {
    const { project } = await projectModel.getProjectById(req.params.id, req.user.id)
    res.json({ project })
  } catch (err) {
    if (err.message.includes('not found')) return res.status(404).json({ error: err.message })
    if (err.message.includes('authorized')) return res.status(403).json({ error: err.message })
    console.error('Get project error:', err)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
}
 
exports.updateProject = async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }
    const { project } = await projectModel.updateProject(req.params.id, req.user.id, req.body)
    res.json({ message: 'Project updated', project })
  } catch (err) {
    console.error('Update project error:', err)
    res.status(500).json({ error: err.message || 'Failed to update project' })
  }
}
 
exports.deleteProject = async (req, res) => {
  try {
    const result = await projectModel.deleteProject(req.params.id, req.user.id)
    res.json(result)
  } catch (err) {
    if (err.message.includes('not found') || err.message.includes('owner')) {
      return res.status(403).json({ error: err.message })
    }
    console.error('Delete project error:', err)
    res.status(500).json({ error: 'Failed to delete project' })
  }
}
 
exports.getProjectMembers = async (req, res) => {
  try {
    // Access check first
    await projectModel.getProjectById(req.params.id, req.user.id)
    const { members } = await projectModel.getProjectMembers(req.params.id)
    res.json({ members })
  } catch (err) {
    if (err.message.includes('not found')) return res.status(404).json({ error: err.message })
    if (err.message.includes('authorized')) return res.status(403).json({ error: err.message })
    console.error('Get members error:', err)
    res.status(500).json({ error: 'Failed to fetch members' })
  }
}
 
exports.removeMember = async (req, res) => {
  try {
    const result = await collaborationModel.removeMember(
      req.params.id,
      req.user.id,
      req.params.memberId
    )
    res.json(result)
  } catch (err) {
    if (err.message.includes('permission')) return res.status(403).json({ error: err.message })
    if (err.message.includes('yourself')) return res.status(400).json({ error: err.message })
    console.error('Remove member error:', err)
    res.status(500).json({ error: 'Failed to remove member' })
  }
}
 
