// backend/controllers/project/moodboard.controller.js
const path = require('path');
const { supabase, supabaseAdmin } = require('../../lib/supabase');

/* Upload image */
exports.uploadMoodboardImage = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const description = req.body.description || null;

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // 1. Get project
    const { data: project, error: projectErr } = await supabaseAdmin
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .single();

    if (projectErr) throw projectErr;
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // 2. Check access
    const isOwner = project.user_id === userId;

    let isMember = false;
    if (!isOwner) {
      const { data: member, error: memberErr } = await supabaseAdmin
        .from('project_members')
        .select('accepted_at')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle();

      if (memberErr) throw memberErr;
      isMember = !!member?.accepted_at;
    }

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Not allowed to upload images to this project' });
    }

    // 3. Upload file
    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const fileName = `${projectId}/${Date.now()}${fileExt}`;

    const { error: uploadErr } = await supabaseAdmin.storage
      .from('project-moodboards')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabase.storage
      .from('project-moodboards')
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // 4. Save DB record
    const { error: dbErr } = await supabaseAdmin
      .from('project-images')
      .insert({
        project_id: projectId,
        user_id: userId,
        image_url: imageUrl,
        file_name: file.originalname,
        description,
        storage_path: fileName,
      });

    if (dbErr) throw dbErr;

    res.status(201).json({
      message: 'Image uploaded',
      image_url: imageUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
};

exports.getProjectImages = async (req, res) => {
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
      const { data: member, error: memberErr } = await supabaseAdmin
        .from('project_members')
        .select('accepted_at, role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle()

      if (memberErr) throw memberErr
      isMember = !!member?.accepted_at
    }

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Not allowed' })
    }

    const { data: images, error: imagesErr } = await supabaseAdmin
      .from('project-images')
      .select('*')
      .eq('project_id', projectId)
      .order('uploaded_at', { ascending: false })

    if (imagesErr) throw imagesErr

    const { data: members, error: membersErr } = await supabaseAdmin
      .from('project_members')
      .select('user_id, role')
      .eq('project_id', projectId)

    if (membersErr) throw membersErr

    const memberMap = Object.fromEntries(
      (members || []).map(m => [m.user_id, m.role])
    )

    const enriched = (images || []).map(img => ({
      ...img,
      uploader_role:
        img.user_id === project.user_id
          ? 'Owner'
          : memberMap[img.user_id] || 'Collaborator'
    }))

    res.json({ images: enriched })
  } catch (err) {
    console.error('Get images error:', err)
    res.status(500).json({ error: 'Failed to fetch images' })
  }
}

exports.deleteProjectImage = async (req, res) => {
  try {
    const { id: projectId, imageId } = req.params
    const userId = req.user.id

    const { data: image, error: imageErr } = await supabaseAdmin
      .from('project-images')
      .select('*')
      .eq('id', imageId)
      .single()

    if (imageErr) throw imageErr
    if (!image) return res.status(404).json({ error: 'Image not found' })

    const { data: project, error: projectErr } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single()

    if (projectErr) throw projectErr
    if (!project) return res.status(404).json({ error: 'Project not found' })

    const isOwner = project.user_id === userId
    const isUploader = image.user_id === userId

    if (!isOwner && !isUploader) {
      return res.status(403).json({ error: 'Not allowed' })
    }

    const path = image.image_url.split('/object/public/project-moodboards/')[1]

    if (path) {
      const { error: storageErr } = await supabaseAdmin.storage
        .from('project-moodboards')
        .remove([path])

      if (storageErr) throw storageErr
    }

    const { error: deleteErr } = await supabaseAdmin
      .from('project-images')
      .delete()
      .eq('id', imageId)

    if (deleteErr) throw deleteErr

    res.json({ message: 'Image deleted' })
  } catch (err) {
    console.error('Delete image error:', err)
    res.status(500).json({ error: 'Delete failed' })
  }
}

