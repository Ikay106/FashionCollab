const { supabaseAdmin, supabase } = require('../../lib/supabase')

exports.getProjectNotes = async (req, res) => {
  try {
    const projectId = req.params.id
    const userId = req.user.id

    const { data: project, error: projectErr } = await supabaseAdmin
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single()

    if (projectErr) throw projectErr
    if (!project) return res.status(404).json({ error: 'Project not found' })

    const isOwner = project.user_id === userId

    let isMember = false
    if (!isOwner) {
      const { data: member, error: memberErr } = await supabase
        .from('project_members')
        .select('accepted_at')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle()

      if (memberErr) throw memberErr
      isMember = !!member?.accepted_at
    }

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Not allowed' })
    }

    const { data: notes, error: notesErr } = await supabaseAdmin
      .from('project_notes')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (notesErr) throw notesErr

    const userIds = [...new Set((notes || []).map(note => note.user_id))]

    let profiles = []
    if (userIds.length > 0) {
      const { data: profileData, error: profilesErr } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, username, avatar_url, role')
        .in('id', userIds)

      if (profilesErr) throw profilesErr
      profiles = profileData || []
    }

    const profileMap = Object.fromEntries(
      profiles.map(profile => [profile.id, profile])
    )

    const enrichedNotes = (notes || []).map(note => {
      const profile = profileMap[note.user_id] || {}

      return {
        ...note,
        full_name: profile.full_name || '',
        username: profile.username || '',
        avatar_url: profile.avatar_url || '',
        profile_role: profile.role || ''
      }
    })

    res.json({ notes: enrichedNotes })
  } catch (err) {
    console.error('Get project notes error:', err)
    res.status(500).json({ error: 'Failed to fetch notes' })
  }
}

exports.addProjectNote = async (req, res) => {
  try {
    const projectId = req.params.id
    const userId = req.user.id
    const { title, content } = req.body

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Note content is required' })
    }

    const { data: project, error: projectErr } = await supabaseAdmin
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single()

    if (projectErr) throw projectErr
    if (!project) return res.status(404).json({ error: 'Project not found' })

    const isOwner = project.user_id === userId

    let isMember = false
    if (!isOwner) {
      const { data: member, error: memberErr } = await supabase
        .from('project_members')
        .select('accepted_at')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle()

      if (memberErr) throw memberErr
      isMember = !!member?.accepted_at
    }

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Not allowed' })
    }

    const { data: note, error: noteErr } = await supabaseAdmin
      .from('project_notes')
      .insert({
        project_id: projectId,
        user_id: userId,
        title: title || null,
        content: content.trim()
      })
      .select()
      .single()

    if (noteErr) throw noteErr

    res.status(201).json({ note })
  } catch (err) {
    console.error('Add project note error:', err)
    res.status(500).json({ error: 'Failed to add note' })
  }
}

exports.deleteProjectNote = async (req, res) => {
  try {
    const { noteId } = req.params
    const userId = req.user.id

    const { data: note, error } = await supabaseAdmin
      .from('project_notes')
      .select('*')
      .eq('id', noteId)
      .single()

    if (error) throw error
    if (!note) return res.status(404).json({ error: 'Note not found' })

    if (note.user_id !== userId) {
      return res.status(403).json({ error: 'Not allowed' })
    }

    await supabaseAdmin
      .from('project_notes')
      .delete()
      .eq('id', noteId)

    res.json({ message: 'Note deleted' })
  } catch (err) {
    console.error('Delete note error:', err)
    res.status(500).json({ error: 'Failed to delete note' })
  }
}