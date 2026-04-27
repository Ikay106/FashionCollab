// backend/models/project/activity.model.js
const { supabaseAdmin } = require('../../lib/supabase')

/**
 * Log an activity event for a project
 */
async function logActivity(projectId, userId, action, entityType, entityLabel = null) {
  const { error } = await supabaseAdmin
    .from('project_activity')
    .insert({
      project_id: projectId,
      user_id: userId,
      action,
      entity_type: entityType,
      entity_label: entityLabel
    })

  if (error) {
    // Never crash the app if activity logging fails — just log it
    console.error('Activity log failed:', error.message)
  }
}

/**
 * Get recent activity for a project with user profile info
 */
async function getProjectActivity(projectId, limit = 20) {
  const { data: activities, error } = await supabaseAdmin
    .from('project_activity')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  const userIds = [...new Set((activities || []).map(a => a.user_id))]

  let profiles = []
  if (userIds.length > 0) {
    const { data, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', userIds)

    if (profileErr) throw profileErr
    profiles = data || []
  }

  const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))

  return (activities || []).map(activity => {
    const profile = profileMap[activity.user_id] || {}
    return {
      ...activity,
      full_name: profile.full_name || '',
      username: profile.username || '',
      avatar_url: profile.avatar_url || ''
    }
  })
}

module.exports = { logActivity, getProjectActivity }