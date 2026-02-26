// backend/models/project.model.js
const { supabase, supabaseAdmin } = require('../lib/supabase');

/**
 * Create a new project for the authenticated user
 * @param {string} userId - The ID of the logged-in user (from req.user.id)
 * @param {Object} projectData - { title, description }
 * @returns {Promise<Object>} The created project or error
 */
async function createProject(userId, { title, description, location, shoot_date, status = 'draft' }) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          title,
          description,
          location,
          shoot_date,
          status
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return { project: data };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

/**
 * Get all projects the user owns OR is an accepted member of
 */
async function getUserProjects(userId) {
  try {
    // Owned projects
    const { data: owned, error: ownedErr } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ownedErr) throw ownedErr;

    // Accepted memberships (project_ids where user is member)
    const { data: memberships, error: memErr } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId)
      .not('accepted_at', 'is', null);  // only accepted invites

    if (memErr) throw memErr;

    const joinedIds = memberships?.map(m => m.project_id) || [];

    // Joined projects
    let joined = [];
    if (joinedIds.length > 0) {
      const { data, error: joinedErr } = await supabase
        .from('projects')
        .select('*')
        .in('id', joinedIds)
        .order('created_at', { ascending: false });

      if (joinedErr) throw joinedErr;
      joined = data || [];
    }

    // Combine & remove duplicates
    const all = [...(owned || []), ...joined];
    const unique = Array.from(new Map(all.map(p => [p.id, p])).values());

    return { projects: unique };
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

/**
 * Delete a project by ID - only if it belongs to the user
 * @param {string} projectId - The project ID to delete
 * @param {string} userId - The authenticated user's ID (for ownership check)
 * @returns {Promise<Object>} Success message or error
 */
async function deleteProject(projectId, userId) {
  try {
    // First check ownership
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;
    if (!project) {
      throw new Error('Project not found or you do not have permission to delete it');
    }

    // Perform delete
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (deleteError) throw deleteError;

    return { message: 'Project deleted successfully' };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

/**
 * Update a project by ID - only if it belongs to the user
 * @param {string} projectId 
 * @param {string} userId 
 * @param {Object} updates - partial: { title?, description? }
 */
async function updateProject(projectId, userId, updates) {
  try {
    // Ownership check
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;
    if (!project) {
      throw new Error('Project not found or you do not have permission to update it');
    }

    // Partial update
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    return { project: data };
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

/**
 * Invite a user to a project by email — only owner can invite
 * @param {string} projectId
 * @param {string} ownerId
 * @param {string} inviteEmail
 */
async function inviteToProject(projectId, ownerId, inviteEmail) {
  try {
    // Normalize email
    const email = inviteEmail.trim().toLowerCase();

    // 1) Verify requester is owner (use admin client so RLS/permissions won't randomly block)
    const { data: project, error: projErr } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', ownerId)
      .single();

    if (projErr || !project) {
      throw new Error('You do not have permission to invite to this project');
    }

    // 2) Find invited user by email (Admin Auth API)
    let invitedUser = null;

    // If your supabase-js supports getUserByEmail, use it (best)
    if (supabaseAdmin?.auth?.admin?.getUserByEmail) {
      const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email);
      if (error) throw error;
      invitedUser = data?.user || null;
    } else {
      // Fallback: list users and match (ok for small apps)
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      invitedUser = (data?.users || []).find(u => (u.email || '').toLowerCase() === email) || null;
    }

    if (!invitedUser) {
      throw new Error('User not found');
    }

    // 3) Check if already member/invited
    const { data: existing, error: existErr } = await supabaseAdmin
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', invitedUser.id)
      .maybeSingle();

    if (existErr) throw existErr;
    if (existing) throw new Error('User is already a member or invited');

    // 4) Create invite (accepted_at stays null)
    const { error: insertErr } = await supabaseAdmin
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: invitedUser.id,
        invited_at: new Date().toISOString(),
      });

    if (insertErr) throw insertErr;

    return { message: 'User invited successfully' };
  } catch (error) {
    console.error('Invite error:', error);
    throw error;
  }
}

/**
 * Accept an invite to a project - sets accepted_at
 * @param {string|number} projectId
 * @param {string} userId (invited user)
 */
async function acceptInvite(projectId, userId) {
  try {
    const adminCheck = await supabaseAdmin
  .from('project_members')
  .select('id, project_id, user_id, accepted_at')
  .eq('project_id', projectId)
  .eq('user_id', userId)
  .maybeSingle();

const userCheck = await supabase
  .from('project_members')
  .select('id, project_id, user_id, accepted_at')
  .eq('project_id', projectId)
  .eq('user_id', userId)
  .maybeSingle();

console.log({ adminCheck: adminCheck.data, userCheck: userCheck.data });

    // 1) Find a *pending* invite (accepted_at IS NULL)
    const { data: invite, error: fetchErr } = await supabase
      .from('project_members')
      .select('id, accepted_at')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .is('accepted_at', null)
      .maybeSingle();

    if (fetchErr) throw fetchErr;

    if (!invite) {
      const err = new Error('No pending invite found for this project');
      err.statusCode = 404; // optional, for controller to use
      throw err;
    }

    // 2) Accept (set accepted_at) — keep the same pending condition to avoid double-accept race
    const now = new Date().toISOString();

    const { data: updated, error: updateErr } = await supabase
      .from('project_members')
      .update({ accepted_at: now })
      .eq('id', invite.id)
      .is('accepted_at', null)
      .select('id, project_id, user_id, accepted_at')
      .maybeSingle();

    if (updateErr) throw updateErr;

    if (!updated) {
      const err = new Error('Invite was already accepted or no longer available');
      err.statusCode = 409;
      throw err;
    }

    return { message: 'Invite accepted successfully', membership: updated };
  } catch (error) {
    console.error('Accept invite error:', error);
    throw error;
  }


  
}




module.exports = {
  createProject,
  getUserProjects,
  deleteProject,
  updateProject,
  inviteToProject,
  acceptInvite
};