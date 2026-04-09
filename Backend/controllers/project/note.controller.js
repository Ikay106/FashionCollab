// backend/controllers/project/note.controller.js
const noteModel = require('../../models/project/note.model')

exports.getProjectNotes = async (req, res) => {
  try {
    await noteModel.checkProjectAccess(req.params.id, req.user.id)
    const notes = await noteModel.getNotes(req.params.id)
    res.json({ notes })
  } catch (err) {
    if (err.message === 'Not allowed') return res.status(403).json({ error: err.message })
    if (err.message === 'Project not found') return res.status(404).json({ error: err.message })
    console.error('Get notes error:', err)
    res.status(500).json({ error: 'Failed to fetch notes' })
  }
}

exports.addProjectNote = async (req, res) => {
  try {
    const { title, content } = req.body
    if (!content?.trim()) return res.status(400).json({ error: 'Note content is required' })

    await noteModel.checkProjectAccess(req.params.id, req.user.id)
    const note = await noteModel.addNote(req.params.id, req.user.id, title, content.trim())
    res.status(201).json({ note })
  } catch (err) {
    if (err.message === 'Not allowed') return res.status(403).json({ error: err.message })
    if (err.message === 'Project not found') return res.status(404).json({ error: err.message })
    console.error('Add note error:', err)
    res.status(500).json({ error: 'Failed to add note' })
  }
}

exports.deleteProjectNote = async (req, res) => {
  try {
    const result = await noteModel.deleteNote(req.params.noteId, req.user.id)
    res.json(result)
  } catch (err) {
    if (err.message === 'Not allowed') return res.status(403).json({ error: err.message })
    if (err.message === 'Note not found') return res.status(404).json({ error: err.message })
    console.error('Delete note error:', err)
    res.status(500).json({ error: 'Failed to delete note' })
  }
}