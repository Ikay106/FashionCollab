const { supabaseAdmin, supabase } = require('../../lib/supabase')

exports.getProjectLinks = async (req, res) => {
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

    const { data: links, error: linksErr } = await supabaseAdmin
      .from('project_links')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (linksErr) throw linksErr

    const userIds = [...new Set((links || []).map(link => link.user_id))]

    let profiles = []
    if (userIds.length > 0) {
      const { data: profileData, error: profilesErr } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, username')
        .in('id', userIds)

      if (profilesErr) throw profilesErr
      profiles = profileData || []
    }

    const profileMap = Object.fromEntries(
      profiles.map(profile => [profile.id, profile])
    )

    const enrichedLinks = (links || []).map(link => {
      const profile = profileMap[link.user_id] || {}

      return {
        ...link,
        full_name: profile.full_name || '',
        username: profile.username || ''
      }
    })

    res.json({ links: enrichedLinks })
  } catch (err) {
    console.error('Get project links error:', err)
    res.status(500).json({ error: 'Failed to fetch links' })
  }
}

exports.addProjectLink = async (req, res) => {
  try {
    const projectId = req.params.id
    const userId = req.user.id
    const { title, url, category } = req.body

    if (!title?.trim() || !url?.trim()) {
      return res.status(400).json({ error: 'Title and URL are required' })
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

    const { data: link, error: linkErr } = await supabaseAdmin
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

    if (linkErr) throw linkErr

    res.status(201).json({ link })
  } catch (err) {
    console.error('Add project link error:', err)
    res.status(500).json({ error: 'Failed to add link' })
  }
}

exports.deleteProjectLink = async (req, res) => {
  try {
    const { linkId } = req.params
    const userId = req.user.id

    const { data: link, error: linkErr } = await supabaseAdmin
      .from('project_links')
      .select('*')
      .eq('id', linkId)
      .single()

    if (linkErr) throw linkErr
    if (!link) return res.status(404).json({ error: 'Link not found' })

    if (link.user_id !== userId) {
      return res.status(403).json({ error: 'Not allowed' })
    }

    const { error: deleteErr } = await supabaseAdmin
      .from('project_links')
      .delete()
      .eq('id', linkId)

    if (deleteErr) throw deleteErr

    res.json({ message: 'Link deleted' })
  } catch (err) {
    console.error('Delete project link error:', err)
    res.status(500).json({ error: 'Failed to delete link' })
  }
}