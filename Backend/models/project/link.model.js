// backend/models/link.model.js
const { supabase, supabaseAdmin } = require('../../lib/supabase')

/**
 * Check if user has access to a project
 */
async function checkProjectAccess(projectId, userId) {
  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .single()

  if (error) throw error
  if (!project) throw new Error('Project not found')

  if (project.user_id === userId) return true

  const { data: member, error: memberErr } = await supabase
    .from('project_members')
    .select('accepted_at')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .maybeSingle()

  if (memberErr) throw memberErr
  if (!member?.accepted_at) throw new Error('Not allowed')

  return true
}

/**
 * Get all links for a project with author profile info
 */
async function getLinks(projectId) {
  const { data: links, error } = await supabaseAdmin
    .from('project_links')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const userIds = [...new Set((links || []).map(l => l.user_id))]

  let profiles = []
  if (userIds.length > 0) {
    const { data, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username')
      .in('id', userIds)

    if (profileErr) throw profileErr
    profiles = data || []
  }

  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))

  return (links || []).map(link => {
    const profile = profileMap[link.user_id] || {}
    return {
      ...link,
      full_name: profile.full_name || '',
      username: profile.username || ''
    }
  })
}

/**
 * Add a link
 */
async function addLink(projectId, userId, title, url, category) {
  const { data, error } = await supabaseAdmin
    .from('project_links')
    .insert({
      project_id: projectId,
      user_id: userId,
      title: title.trim(),
      url: url.trim(),
      category: category?.trim() || null
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a link — only the author can delete their own
 */
async function deleteLink(linkId, userId) {
  const { data: link, error } = await supabaseAdmin
    .from('project_links')
    .select('*')
    .eq('id', linkId)
    .single()

  if (error) throw error
  if (!link) throw new Error('Link not found')
  if (link.user_id !== userId) throw new Error('Not allowed')

  const { error: deleteErr } = await supabaseAdmin
    .from('project_links')
    .delete()
    .eq('id', linkId)

  if (deleteErr) throw deleteErr

  return { message: 'Link deleted' }
}

module.exports = { checkProjectAccess, getLinks, addLink, deleteLink }