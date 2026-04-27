// backend/controllers/project/activity.controller.js
const activityModel = require('../../models/activity/activity.model')
const projectModel = require('../../models/project/project.model')

exports.getProjectActivity = async (req, res) => {
  try {
    // Access check — only owner or member can see activity
    await projectModel.getProjectById(req.params.id, req.user.id)

    const activities = await activityModel.getProjectActivity(req.params.id)
    res.json({ activities })
  } catch (err) {
    if (err.message.includes('not found')) return res.status(404).json({ error: err.message })
    if (err.message.includes('authorized')) return res.status(403).json({ error: err.message })
    console.error('Get activity error:', err)
    res.status(500).json({ error: 'Failed to fetch activity' })
  }
}