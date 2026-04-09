// backend/controllers/project/comment.controller.js
const commentModel = require('../../models/project/comment.model')
 
exports.getComments = async (req, res) => {
  try {
    const { id: projectId, imageId } = req.params
    const comments = await commentModel.getComments(projectId, imageId)
    res.json({ comments })
  } catch (err) {
    console.error('Get comments error:', err)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
}
 
exports.addComment = async (req, res) => {
  try {
    const { imageId } = req.params
    const { comment } = req.body
 
    if (!comment) return res.status(400).json({ error: 'Comment required' })
 
    const result = await commentModel.addComment(imageId, req.user.id, comment)
    res.status(201).json(result)
  } catch (err) {
    console.error('Add comment error:', err)
    res.status(500).json({ error: 'Failed to add comment' })
  }
}
 
exports.deleteComment = async (req, res) => {
  try {
    const { id: projectId, imageId, commentId } = req.params
    const result = await commentModel.deleteComment(projectId, imageId, commentId, req.user.id)
    res.json(result)
  } catch (err) {
    if (err.message === 'Not allowed to delete this comment') return res.status(403).json({ error: err.message })
    if (err.message === 'Comment not found') return res.status(404).json({ error: err.message })
    console.error('Delete comment error:', err)
    res.status(500).json({ error: 'Failed to delete comment' })
  }
}
 
