// backend/controllers/project/collaboration.controller.js
const collaborationModel = require('../../models/project/collaboration.model')
const { sendInviteEmail, sendAcceptedEmail, sendDeclinedEmail } = require('../../lib/email')

exports.inviteToProject = async (req, res) => {
  try {
    const { email, role } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })

    const result = await collaborationModel.inviteToProject(
      req.params.id, req.user.id, email, role
    )

    // Send notification — non-blocking
    collaborationModel.getUserDetails(req.user.id).then(owner => {
      sendInviteEmail({
        toEmail: email.trim().toLowerCase(),
        projectTitle: result.projectTitle,
        ownerName: owner.name,
        inviteeName: null // they may not have a profile name yet
      }).catch(err => console.error('Invite email failed:', err.message))
    })

    res.status(201).json(result)
  } catch (err) {
    if (err.message.includes('permission')) return res.status(403).json({ error: err.message })
    if (err.message.includes('not found')) return res.status(404).json({ error: err.message })
    if (err.message.includes('already')) return res.status(409).json({ error: err.message })
    console.error('Invite error:', err)
    res.status(500).json({ error: 'Failed to invite' })
  }
}

exports.acceptInvite = async (req, res) => {
  try {
    const projectId = req.params.id
    const userId = req.user.id

    const result = await collaborationModel.acceptInvite(projectId, userId)

    // Send notification — non-blocking
    Promise.all([
      collaborationModel.getProjectOwnerDetails(projectId),
      collaborationModel.getUserDetails(userId, projectId)
    ]).then(([owner, invitee]) => {
      if (owner.ownerEmail) {
        sendAcceptedEmail({
          toEmail: owner.ownerEmail,
          ownerName: owner.ownerName,
          inviteeName: invitee.name,
          inviteeRole: invitee.role,
          projectTitle: owner.projectTitle
        }).catch(err => console.error('Accept email failed:', err.message))
      }
    })

    res.json(result)
  } catch (err) {
    if (err.message.includes('pending')) return res.status(404).json({ error: err.message })
    console.error('Accept error:', err)
    res.status(500).json({ error: 'Failed to accept invite' })
  }
}

exports.getPendingInvites = async (req, res) => {
  try {
    const invites = await collaborationModel.getPendingInvites(req.user.id)
    res.json({ invites })
  } catch (err) {
    console.error('Get pending invites error:', err)
    res.status(500).json({ error: 'Failed to fetch invites' })
  }
}

exports.declineInvite = async (req, res) => {
  try {
    const invite = await collaborationModel.declineInvite(req.params.id, req.user.id)

    // Send notification — non-blocking
    if (invite) {
      Promise.all([
        collaborationModel.getProjectOwnerDetails(invite.project_id),
        collaborationModel.getUserDetails(req.user.id)
      ]).then(([owner, decliner]) => {
        if (owner.ownerEmail) {
          sendDeclinedEmail({
            toEmail: owner.ownerEmail,
            ownerName: owner.ownerName,
            inviteeName: decliner.name,
            projectTitle: owner.projectTitle
          }).catch(err => console.error('Decline email failed:', err.message))
        }
      })
    }

    res.json({ message: 'Invite declined' })
  } catch (err) {
    console.error('Decline invite error:', err)
    res.status(500).json({ error: 'Failed to decline invite' })
  }
}