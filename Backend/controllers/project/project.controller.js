// backend/controllers/project/project.controller.js
const projectModel = require('../../models/project.model');
const { supabase, supabaseAdmin } = require('../../lib/supabase');

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

exports.getProjectMembers = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // 1. Check project exists
    const { data: project, error: projectErr } = await supabaseAdmin
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single();

    if (projectErr) throw projectErr;
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // 2. Check access
    const isOwner = project.user_id === userId;

    let isMember = false;
    if (!isOwner) {
      const { data: member } = await supabase
        .from('project_members')
        .select('accepted_at')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle();

      isMember = !!member?.accepted_at;
    }

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    // 3. Get accepted invited members
    const { data: members, error: membersErr } = await supabaseAdmin
      .from('project_members')
      .select('user_id, role, accepted_at')
      .eq('project_id', projectId)
      .not('accepted_at', 'is', null);

    if (membersErr) throw membersErr;

    // 4. Get profiles for owner + members
    const invitedUserIds = (members || []).map(m => m.user_id);
    const userIds = [project.user_id, ...invitedUserIds];

    const uniqueUserIds = [...new Set(userIds)];

    const { data: profiles, error: profilesErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('id', uniqueUserIds);

    if (profilesErr) throw profilesErr;

    // 5. Build lookup map safely
    const profileMap = Object.fromEntries(
      (profiles || []).map(p => [p.id, p])
    );

    // 6. Add owner manually
    const ownerMember = {
      id: project.user_id,
      ...(profileMap[project.user_id] || {}),
      project_role: 'Owner'
    };

    // 7. Add accepted invitees
    const invitedMembers = (members || []).map(m => ({
      id: m.user_id,
      ...(profileMap[m.user_id] || {}),
      project_role: m.role || 'Collaborator'
    }));

    // 8. Return combined list
    res.json({
      members: [ownerMember, ...invitedMembers]
    });

  } catch (err) {
    console.error('Get members error:', err);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};


exports.removeMember = async (req, res) => {
  try {
    const projectId = req.params.id
    const ownerId = req.user.id
    const { memberId } = req.params

    const result = await projectModel.removeMember(projectId, ownerId, memberId)
    res.json(result)
  } catch (error) {
    if (error.message.includes('permission')) return res.status(403).json({ error: error.message })
    if (error.message.includes('yourself')) return res.status(400).json({ error: error.message })
    console.error('Remove member error:', error)
    res.status(500).json({ error: 'Failed to remove member' })
  }
}