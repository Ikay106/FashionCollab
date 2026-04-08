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
    console.log(`DEBUG: getUserProjects called for userId: ${userId}`);

    // 1. Owned projects
    const { data: owned, error: ownedErr } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('DEBUG: Owned projects count:', owned?.length || 0, 'Error:', ownedErr);

    // 2. Accepted joined projects
    const { data: memberships, error: memErr } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId)
      .not('accepted_at', 'is', null);

    console.log('DEBUG: Accepted memberships count:', memberships?.length || 0, 'Error:', memErr);

    const joinedIds = memberships?.map(m => m.project_id) || [];
    console.log('DEBUG: Joined project IDs:', joinedIds);

    let joined = [];
    if (joinedIds.length > 0) {
      const { data, error: joinedErr } = await supabaseAdmin
        .from('projects')
        .select('*')
        .in('id', joinedIds)
        .order('created_at', { ascending: false });

      console.log('DEBUG: Joined projects count:', data?.length || 0, 'Error:', joinedErr);
      joined = data || [];
    }

    // TAG PROJECTS
    const ownedTagged = (owned || []).map(p => ({
      ...p,
      memberStatus: 'Owner'
    }));

    const joinedTagged = (joined || []).map(p => ({
      ...p,
      memberStatus: 'Invitee'
    }));

    // COMBINE TAGGED PROJECTS
    const all = [...ownedTagged, ...joinedTagged];

    // REMOVE DUPLICATES
    const unique = Array.from(
      new Map(all.map(p => [p.id, p])).values()
    );

    console.log('DEBUG: Final projects count:', unique.length);

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
    // 1. Check ownership
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    if (!project) {
      throw new Error('You are not the owner of this project');
    }

    // 2. Get all image records for this project
    const { data: images, error: imagesError } = await supabaseAdmin
      .from('project-images')
      .select('storage_path')
      .eq('project_id', projectId);

    if (imagesError) throw imagesError;

    // 3. Delete files from Supabase Storage
    const storagePaths = (images || [])
      .map((img) => img.storage_path)
      .filter(Boolean);

    if (storagePaths.length > 0) {
      const { error: storageDeleteError } = await supabaseAdmin.storage
        .from('project-moodboards')
        .remove(storagePaths);

      if (storageDeleteError) throw storageDeleteError;
    }

    // 4. Delete image metadata rows
    const { error: imageDeleteError } = await supabaseAdmin
      .from('project-images')
      .delete()
      .eq('project_id', projectId);

    if (imageDeleteError) throw imageDeleteError;

    // 5. Delete project members / invites
    const { error: memberDeleteError } = await supabaseAdmin
      .from('project_members')
      .delete()
      .eq('project_id', projectId);

    if (memberDeleteError) throw memberDeleteError;

    // 6. Delete the project itself
    const { error: deleteError } = await supabaseAdmin
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
 * Get a single project by ID - only if user owns it or is accepted member
 * @param {string} projectId
 * @param {string} userId
 */
async function getProjectById(projectId, userId) {
  try {
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (fetchError || !project) {
      throw new Error('Project not found');
    }

    const isOwner = project.user_id === userId;

    let isAcceptedMember = false;
    if (!isOwner) {
      const { data: member, error: memberErr } = await supabase
        .from('project_members')
        .select('accepted_at')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (memberErr) throw memberErr;
      isAcceptedMember = !!member?.accepted_at;
    }

    if (!isOwner && !isAcceptedMember) {
      throw new Error('Not authorized to view this project');
    }

    return {
      project: {
        ...project,
        memberStatus: isOwner ? 'Owner' : 'Invitee'
      }
    };
  } catch (error) {
    console.error('Get project by ID error:', error);
    throw error;
  }
}


/**
 * Invite a user to a project by email — only owner can invite
 * @param {string} projectId
 * @param {string} ownerId
 * @param {string} inviteEmail
 */
async function inviteToProject(projectId, ownerId, inviteEmail,role) {
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
        role: role || 'Collaborator',
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

/**
 * Remove a member from a project - only owner can do this
 * @param {string} projectId
 * @param {string} ownerId
 * @param {string} memberUserId - the user to remove
 */
async function removeMember(projectId, ownerId, memberUserId) {
  try {
    // 1. Verify requester is the owner
    const { data: project, error: projErr } = await supabaseAdmin
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', ownerId)
      .single()

    if (projErr || !project) {
      throw new Error('You do not have permission to remove members from this project')
    }

    // 2. Can't remove yourself (owner)
    if (memberUserId === ownerId) {
      throw new Error('You cannot remove yourself as the owner')
    }

    // 3. Delete the membership row
    const { error: deleteErr } = await supabaseAdmin
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', memberUserId)

    if (deleteErr) throw deleteErr

    return { message: 'Member removed successfully' }
  } catch (error) {
    console.error('Remove member error:', error)
    throw error
  }
}



module.exports = {
  createProject,
  getUserProjects,
  deleteProject,
  updateProject,
  getProjectById,
  inviteToProject,
  acceptInvite,
  removeMember
};