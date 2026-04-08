const { supabaseAdmin } = require('../../lib/supabase')

exports.addComment = async (req, res) => {
  try {
    const { imageId } = req.params
    const userId = req.user.id
    const { comment } = req.body

    if (!comment) {
      return res.status(400).json({ error: 'Comment required' })
    }

    const { error } = await supabaseAdmin
      .from('image_comments')
      .insert({
        image_id: imageId,
        user_id: userId,
        comment
      })

    if (error) throw error

    res.status(201).json({ message: 'Comment added' })
  } catch (err) {
    console.error('Add comment error:', err)
    res.status(500).json({ error: 'Failed to add comment' })
  }
}

exports.getComments = async (req, res) => {
  try {
    const { id: projectId, imageId } = req.params

    const { data: comments, error } = await supabaseAdmin
      .from('image_comments')
      .select('*')
      .eq('image_id', imageId)
      .order('created_at', { ascending: true })

    if (error) throw error

    const userIds = [...new Set((comments || []).map(comment => comment.user_id))]

    let profiles = []
    let projectMembers = []

    if (userIds.length > 0) {
      const { data: profileData, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, username, avatar_url, role')
        .in('id', userIds)

      if (profilesError) throw profilesError
      profiles = profileData || []

      const { data: memberData, error: membersError } = await supabaseAdmin
        .from('project_members')
        .select('user_id, role')
        .eq('project_id', projectId)
        .in('user_id', userIds)

      if (membersError) throw membersError
      projectMembers = memberData || []
    }

    const profileMap = Object.fromEntries(
      profiles.map(profile => [profile.id, profile])
    )

    const memberRoleMap = Object.fromEntries(
      projectMembers.map(member => [member.user_id, member.role])
    )

    const enrichedComments = (comments || []).map(comment => {
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

    res.json({ comments: enrichedComments })
  } catch (err) {
    console.error('Get comments error:', err)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
}

exports.deleteComment = async (req, res) => {
  try {
    const { id: projectId, imageId, commentId } = req.params
    const userId = req.user.id

    // 1. Fetch the comment
    const { data: comment, error: commentErr } = await supabaseAdmin
      .from('image_comments')
      .select('*')
      .eq('id', commentId)
      .eq('image_id', imageId)
      .single()

    if (commentErr) throw commentErr
    if (!comment) return res.status(404).json({ error: 'Comment not found' })

    // 2. Check if user is the comment author
    const isAuthor = comment.user_id === userId

    // 3. Check if user is the project owner
    const { data: project, error: projectErr } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (projectErr) throw projectErr
    const isOwner = project?.user_id === userId

    if (!isAuthor && !isOwner) {
      return res.status(403).json({ error: 'Not allowed to delete this comment' })
    }

    // 4. Delete it
    const { error: deleteErr } = await supabaseAdmin
      .from('image_comments')
      .delete()
      .eq('id', commentId)

    if (deleteErr) throw deleteErr

    res.json({ message: 'Comment deleted' })
  } catch (err) {
    console.error('Delete comment error:', err)
    res.status(500).json({ error: 'Failed to delete comment' })
  }
}