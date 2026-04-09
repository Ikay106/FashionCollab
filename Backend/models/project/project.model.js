// backend/models/project.model.js
const { supabase, supabaseAdmin } = require('../../lib/supabase')

async function createProject(userId, { title, description, location, shoot_date, status = 'draft' }) {
  const { data, error } = await supabase
    .from('projects')
    .insert([{ user_id: userId, title, description, location, shoot_date, status }])
    .select()
    .single()

  if (error) throw error
  return { project: data }
}

async function getUserProjects(userId) {
  const { data: owned, error: ownedErr } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (ownedErr) throw ownedErr

  const { data: memberships, error: memErr } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('user_id', userId)
    .not('accepted_at', 'is', null)

  if (memErr) throw memErr

  const joinedIds = (memberships || []).map(m => m.project_id)

  let joined = []
  if (joinedIds.length > 0) {
    const { data, error: joinedErr } = await supabaseAdmin
      .from('projects')
      .select('*')
      .in('id', joinedIds)
      .order('created_at', { ascending: false })

    if (joinedErr) throw joinedErr
    joined = data || []
  }

  const ownedTagged = (owned || []).map(p => ({ ...p, memberStatus: 'Owner' }))
  const joinedTagged = (joined || []).map(p => ({ ...p, memberStatus: 'Invitee' }))

  const unique = Array.from(
    new Map([...ownedTagged, ...joinedTagged].map(p => [p.id, p])).values()
  )

  return { projects: unique }
}

async function getProjectById(projectId, userId) {
  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error || !project) throw new Error('Project not found')

  const isOwner = project.user_id === userId

  if (!isOwner) {
    const { data: member, error: memberErr } = await supabase
      .from('project_members')
      .select('accepted_at')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .maybeSingle()

    if (memberErr) throw memberErr
    if (!member?.accepted_at) throw new Error('Not authorized to view this project')
  }

  return { project: { ...project, memberStatus: isOwner ? 'Owner' : 'Invitee' } }
}

async function updateProject(projectId, userId, updates) {
  const { data: existing, error: fetchErr } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (fetchErr) throw fetchErr
  if (!existing) throw new Error('Project not found or you do not have permission to update it')

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return { project: data }
}

async function deleteProject(projectId, userId) {
  const { data: project, error: fetchErr } = await supabaseAdmin
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  if (fetchErr) throw fetchErr
  if (!project) throw new Error('You are not the owner of this project')

  const { data: images } = await supabaseAdmin
    .from('project-images')
    .select('storage_path')
    .eq('project_id', projectId)

  const storagePaths = (images || []).map(img => img.storage_path).filter(Boolean)
  if (storagePaths.length > 0) {
    await supabaseAdmin.storage.from('project-moodboards').remove(storagePaths)
  }

  await supabaseAdmin.from('project-images').delete().eq('project_id', projectId)
  await supabaseAdmin.from('project_members').delete().eq('project_id', projectId)
  await supabaseAdmin.from('projects').delete().eq('id', projectId)

  return { message: 'Project deleted successfully' }
}

async function getProjectMembers(projectId) {
  const { data: project, error: projErr } = await supabaseAdmin
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .single()

  if (projErr) throw projErr

  const { data: members, error: membersErr } = await supabaseAdmin
    .from('project_members')
    .select('user_id, role, accepted_at')
    .eq('project_id', projectId)
    .not('accepted_at', 'is', null)

  if (membersErr) throw membersErr

  const userIds = [...new Set([project.user_id, ...(members || []).map(m => m.user_id)])]

  const { data: profiles, error: profilesErr } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .in('id', userIds)

  if (profilesErr) throw profilesErr

  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))

  const ownerMember = {
    id: project.user_id,
    ...(profileMap[project.user_id] || {}),
    project_role: 'Owner'
  }

  const invitedMembers = (members || []).map(m => ({
    id: m.user_id,
    ...(profileMap[m.user_id] || {}),
    project_role: m.role || 'Collaborator'
  }))

  return { members: [ownerMember, ...invitedMembers], ownerId: project.user_id }
}

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers
}