// backend/controllers/project/link.controller.js
const linkModel = require('../../models/project/link.model')

exports.getProjectLinks = async (req, res) => {
  try {
    await linkModel.checkProjectAccess(req.params.id, req.user.id)
    const links = await linkModel.getLinks(req.params.id)
    res.json({ links })
  } catch (err) {
    if (err.message === 'Not allowed') return res.status(403).json({ error: err.message })
    if (err.message === 'Project not found') return res.status(404).json({ error: err.message })
    console.error('Get links error:', err)
    res.status(500).json({ error: 'Failed to fetch links' })
  }
}

exports.addProjectLink = async (req, res) => {
  try {
    const { title, url, category } = req.body
    if (!title?.trim() || !url?.trim()) {
      return res.status(400).json({ error: 'Title and URL are required' })
    }

    await linkModel.checkProjectAccess(req.params.id, req.user.id)
    const link = await linkModel.addLink(req.params.id, req.user.id, title, url, category)
    res.status(201).json({ link })
  } catch (err) {
    if (err.message === 'Not allowed') return res.status(403).json({ error: err.message })
    if (err.message === 'Project not found') return res.status(404).json({ error: err.message })
    console.error('Add link error:', err)
    res.status(500).json({ error: 'Failed to add link' })
  }
}

exports.deleteProjectLink = async (req, res) => {
  try {
    const result = await linkModel.deleteLink(req.params.linkId, req.user.id)
    res.json(result)
  } catch (err) {
    if (err.message === 'Not allowed') return res.status(403).json({ error: err.message })
    if (err.message === 'Link not found') return res.status(404).json({ error: err.message })
    console.error('Delete link error:', err)
    res.status(500).json({ error: 'Failed to delete link' })
  }
}