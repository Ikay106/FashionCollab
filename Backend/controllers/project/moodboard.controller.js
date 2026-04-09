// backend/controllers/project/moodboard.controller.js
const moodboardModel = require('../../models/project/moodboard.model')

exports.uploadMoodboardImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' })

    await moodboardModel.checkProjectAccess(req.params.id, req.user.id)

    const result = await moodboardModel.uploadImage(
      req.params.id,
      req.user.id,
      req.file,
      req.body.description
    )

    res.status(201).json({ message: 'Image uploaded', ...result })
  } catch (err) {
    if (err.message === 'Not allowed') return res.status(403).json({ error: err.message })
    if (err.message === 'Project not found') return res.status(404).json({ error: err.message })
    console.error('Upload error:', err)
    res.status(500).json({ error: err.message || 'Upload failed' })
  }
}

exports.getProjectImages = async (req, res) => {
  try {
    const { project } = await moodboardModel.checkProjectAccess(req.params.id, req.user.id)
    const images = await moodboardModel.getImages(req.params.id, project.user_id)
    res.json({ images })
  } catch (err) {
    if (err.message === 'Not allowed') return res.status(403).json({ error: err.message })
    if (err.message === 'Project not found') return res.status(404).json({ error: err.message })
    console.error('Get images error:', err)
    res.status(500).json({ error: 'Failed to fetch images' })
  }
}

exports.deleteProjectImage = async (req, res) => {
  try {
    const result = await moodboardModel.deleteImage(req.params.id, req.params.imageId, req.user.id)
    res.json(result)
  } catch (err) {
    if (err.message === 'Not allowed') return res.status(403).json({ error: err.message })
    if (err.message === 'Image not found') return res.status(404).json({ error: err.message })
    console.error('Delete image error:', err)
    res.status(500).json({ error: 'Delete failed' })
  }
}