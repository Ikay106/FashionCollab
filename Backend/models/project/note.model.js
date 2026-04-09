// backend/models/note.model.js
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
 * Get all notes for a project with author profile info
 */
async function getNotes(projectId) {
  const { data: notes, error } = await supabaseAdmin
    .from('project_notes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const userIds = [...new Set((notes || []).map(n => n.user_id))]

  let profiles = []
  if (userIds.length > 0) {
    const { data, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username, avatar_url, role')
      .in('id', userIds)

    if (profileErr) throw profileErr
    profiles = data || []
  }

  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))

  return (notes || []).map(note => {
    const profile = profileMap[note.user_id] || {}
    return {
      ...note,
      full_name: profile.full_name || '',
      username: profile.username || '',
      avatar_url: profile.avatar_url || '',
      profile_role: profile.role || ''
    }
  })
}

/**
 * Add a note
 */
async function addNote(projectId, userId, title, content) {
  const { data, error } = await supabaseAdmin
    .from('project_notes')
    .insert({ project_id: projectId, user_id: userId, title: title || null, content })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a note — only the author can delete their own
 */
async function deleteNote(noteId, userId) {
  const { data: note, error } = await supabaseAdmin
    .from('project_notes')
    .select('*')
    .eq('id', noteId)
    .single()

  if (error) throw error
  if (!note) throw new Error('Note not found')
  if (note.user_id !== userId) throw new Error('Not allowed')

  await supabaseAdmin.from('project_notes').delete().eq('id', noteId)

  return { message: 'Note deleted' }
}

module.exports = { checkProjectAccess, getNotes, addNote, deleteNote }