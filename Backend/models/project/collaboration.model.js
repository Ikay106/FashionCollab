// backend/models/collaboration.model.js
const { supabase, supabaseAdmin } = require('../../lib/supabase')

/**
 * Invite a user to a project by email — owner only
 */
async function inviteToProject(projectId, ownerId, inviteEmail, role) {
  const email = inviteEmail.trim().toLowerCase()

  // 1. Verify requester is owner
  const { data: project, error: projErr } = await supabaseAdmin
    .from('projects')
    .select('id, title')
    .eq('id', projectId)
    .eq('user_id', ownerId)
    .single()

  if (projErr || !project) throw new Error('You do not have permission to invite to this project')

  // 2. Find invited user by email
  let invitedUser = null
  if (supabaseAdmin?.auth?.admin?.getUserByEmail) {
    const { data, error } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    if (error) throw error
    invitedUser = data?.user || null
  } else {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (error) throw error
    invitedUser = (data?.users || []).find(u => u.email?.toLowerCase() === email) || null
  }

  if (!invitedUser) throw new Error('User not found')

  // 3. Check not already invited/member
  const { data: existing, error: existErr } = await supabaseAdmin
    .from('project_members')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', invitedUser.id)
    .maybeSingle()

  if (existErr) throw existErr
  if (existing) throw new Error('User is already a member or invited')

  // 4. Create invite
  const { error: insertErr } = await supabaseAdmin
    .from('project_members')
    .insert({
      project_id: projectId,
      user_id: invitedUser.id,
      invited_at: new Date().toISOString(),
      role: role || 'Collaborator'
    })

  if (insertErr) throw insertErr

  return {
    message: 'User invited successfully',
    invitedUserId: invitedUser.id,
    projectTitle: project.title
  }
}

/**
 * Accept a pending invite
 */
async function acceptInvite(projectId, userId) {
  const { data: invite, error: fetchErr } = await supabase
    .from('project_members')
    .select('id, accepted_at')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .is('accepted_at', null)
    .maybeSingle()

  if (fetchErr) throw fetchErr
  if (!invite) throw new Error('No pending invite found for this project')

  const { data: updated, error: updateErr } = await supabase
    .from('project_members')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)
    .is('accepted_at', null)
    .select('id, project_id, user_id, accepted_at, role')
    .maybeSingle()

  if (updateErr) throw updateErr
  if (!updated) throw new Error('Invite was already accepted or no longer available')

  return { message: 'Invite accepted successfully', membership: updated }
}

/**
 * Get pending invites for a user
 */
async function getPendingInvites(userId) {
  const { data: invites, error } = await supabase
    .from('project_members')
    .select('id, project_id, invited_at')
    .eq('user_id', userId)
    .is('accepted_at', null)
    .order('invited_at', { ascending: false })

  if (error) throw error

  const projectIds = (invites || []).map(i => i.project_id)
  let projects = []

  if (projectIds.length > 0) {
    const { data, error: projErr } = await supabaseAdmin
      .from('projects')
      .select('id, title, description')
      .in('id', projectIds)

    if (projErr) throw projErr
    projects = data || []
  }

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]))

  return (invites || []).map(invite => ({
    ...invite,
    projects: projectMap[invite.project_id] || null
  }))
}

/**
 * Decline (delete) a pending invite
 */
async function declineInvite(inviteId, userId) {
  // Fetch first so we can notify the owner after
  const { data: invite, error: fetchErr } = await supabase
    .from('project_members')
    .select('project_id, user_id')
    .eq('id', inviteId)
    .eq('user_id', userId)
    .is('accepted_at', null)
    .maybeSingle()

  if (fetchErr) throw fetchErr

  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('id', inviteId)
    .eq('user_id', userId)
    .is('accepted_at', null)

  if (error) throw error

  return invite // return so controller can send email with project info
}

/**
 * Remove a member — owner only
 */
async function removeMember(projectId, ownerId, memberUserId) {
  const { data: project, error: projErr } = await supabaseAdmin
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .eq('user_id', ownerId)
    .single()

  if (projErr || !project) throw new Error('You do not have permission to remove members from this project')
  if (memberUserId === ownerId) throw new Error('You cannot remove yourself as the owner')

  const { error } = await supabaseAdmin
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', memberUserId)

  if (error) throw error

  return { message: 'Member removed successfully' }
}

/**
 * Get the owner email + profile for a project (used by email notifications)
 */
async function getProjectOwnerDetails(projectId) {
  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('title, user_id')
    .eq('id', projectId)
    .single()

  if (error) throw error

  const { data: authData } = await supabaseAdmin.auth.admin.getUserById(project.user_id)
  const ownerEmail = authData?.user?.email

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, username')
    .eq('id', project.user_id)
    .maybeSingle()

  return {
    projectTitle: project.title,
    ownerId: project.user_id,
    ownerEmail,
    ownerName: profile?.full_name || profile?.username || null
  }
}

/**
 * Get a user's profile + membership role (used by email notifications)
 */
async function getUserDetails(userId, projectId = null) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, username')
    .eq('id', userId)
    .maybeSingle()

  let role = null
  if (projectId) {
    const { data: membership } = await supabaseAdmin
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .maybeSingle()

    role = membership?.role || null
  }

  return {
    name: profile?.full_name || profile?.username || null,
    role
  }
}

module.exports = {
  inviteToProject,
  acceptInvite,
  getPendingInvites,
  declineInvite,
  removeMember,
  getProjectOwnerDetails,
  getUserDetails
}