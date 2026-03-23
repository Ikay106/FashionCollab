// backend/controllers/project/collaboration.controller.js
const projectModel = require('../../models/project.model');
const { supabase } = require('../../lib/supabase');

/* Invite */
exports.inviteToProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const ownerId = req.user.id;
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: 'Email required' });

    const result = await projectModel.inviteToProject(projectId, ownerId, email);
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('permission')) return res.status(403).json({ error: error.message });
    if (error.message.includes('not found')) return res.status(404).json({ error: error.message });
    if (error.message.includes('already')) return res.status(409).json({ error: error.message });
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to invite' });
  }
};

/* Accept invite */
exports.acceptInvite = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const result = await projectModel.acceptInvite(projectId, userId);
    res.json(result);
  } catch (error) {
    if (error.message.includes('pending')) return res.status(404).json({ error: error.message });
    console.error('Accept error:', error);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
};

/**
 * Get all pending invites for the current user
 */
exports.getPendingInvites = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get pending invite rows
    const { data: invites, error } = await supabase
      .from('project_members')
      .select('id, project_id, invited_at')
      .eq('user_id', userId)
      .is('accepted_at', null)
      .order('invited_at', { ascending: false });

    if (error) throw error;

    const projectIds = (invites || []).map(invite => invite.project_id);

    let projects = [];
    if (projectIds.length > 0) {
      const { data: projectData, error: projectErr } = await supabaseAdmin
        .from('projects')
        .select('id, title, description')
        .in('id', projectIds);

      if (projectErr) throw projectErr;
      projects = projectData || [];
    }

    const projectMap = Object.fromEntries(
      projects.map(project => [project.id, project])
    );

    const enrichedInvites = (invites || []).map(invite => ({
      ...invite,
      projects: projectMap[invite.project_id] || null
    }));

    res.json({ invites: enrichedInvites });
  } catch (error) {
    console.error('Get pending invites error:', error);
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
};

/**
 * Decline an invite (delete the membership row)
 */
exports.declineInvite = async (req, res) => {
  try {
    const inviteId = req.params.id;
    const userId = req.user.id;

    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', inviteId)
      .eq('user_id', userId)
      .is('accepted_at', null);

    if (error) throw error;

    res.json({ message: 'Invite declined' });
  } catch (error) {
    console.error('Decline invite error:', error);
    res.status(500).json({ error: 'Failed to decline invite' });
  }
};