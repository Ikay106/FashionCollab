// backend/models/comment.model.js
const { supabaseAdmin } = require('../../lib/supabase')

/**
 * Get all comments for an image with author profile info
 */
async function getComments(projectId, imageId) {
  const { data: comments, error } = await supabaseAdmin
    .from('image_comments')
    .select('*')
    .eq('image_id', imageId)
    .order('created_at', { ascending: true })

  if (error) throw error

  const userIds = [...new Set((comments || []).map(c => c.user_id))]

  let profiles = []
  let projectMembers = []

  if (userIds.length > 0) {
    const { data: profileData, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username, avatar_url, role')
      .in('id', userIds)

    if (profileErr) throw profileErr
    profiles = profileData || []

    const { data: memberData, error: memberErr } = await supabaseAdmin
      .from('project_members')
      .select('user_id, role')
      .eq('project_id', projectId)
      .in('user_id', userIds)

    if (memberErr) throw memberErr
    projectMembers = memberData || []
  }

  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))
  const memberRoleMap = Object.fromEntries(projectMembers.map(m => [m.user_id, m.role]))

  return (comments || []).map(comment => {
    const profile = profileMap[comment.user_id] || {}
    return {
      ...comment,
      full_name: profile.full_name || '',
      username: profile.username || '',
      avatar_url: profile.avatar_url || '',
      profile_role: profile.role || '',
      project_role: memberRoleMap[comment.user_id] || 'Owner'
    }
  })
}

/**
 * Add a comment to an image
 */
async function addComment(imageId, userId, comment) {
  const { error } = await supabaseAdmin
    .from('image_comments')
    .insert({ image_id: imageId, user_id: userId, comment })

  if (error) throw error
  return { message: 'Comment added' }
}

/**
 * Delete a comment — author or project owner only
 */
async function deleteComment(projectId, imageId, commentId, userId) {
  const { data: comment, error: commentErr } = await supabaseAdmin
    .from('image_comments')
    .select('*')
    .eq('id', commentId)
    .eq('image_id', imageId)
    .single()

  if (commentErr) throw commentErr
  if (!comment) throw new Error('Comment not found')

  const { data: project, error: projectErr } = await supabaseAdmin
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single()

  if (projectErr) throw projectErr

  const isAuthor = comment.user_id === userId
  const isOwner = project?.user_id === userId

  if (!isAuthor && !isOwner) throw new Error('Not allowed to delete this comment')

  const { error: deleteErr } = await supabaseAdmin
    .from('image_comments')
    .delete()
    .eq('id', commentId)

  if (deleteErr) throw deleteErr

  return { message: 'Comment deleted' }
}

module.exports = { getComments, addComment, deleteComment }