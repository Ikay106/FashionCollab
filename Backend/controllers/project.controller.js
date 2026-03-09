// backend/controllers/project.controller.js
const projectModel = require('../models/project.model');
const { supabase, supabaseAdmin } = require('../lib/supabase');
const path = require('path');

/**
 * Create a new project (protected route)
 */
exports.createProject = async (req, res) => {
  try {
    const { title, description, location, shoot_date, status } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const { project, error } = await projectModel.createProject(userId, { 
      title,
      description,
      location,
      shoot_date,
      status
     });

    if (error) throw error;

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

/**
 * Get all projects for the logged-in user
 */
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const { projects, error } = await projectModel.getUserProjects(userId);

    if (error) throw error;

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const result = await projectModel.deleteProject(projectId, userId);

    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

/**
 * Update a project (partial updates allowed)
 */
exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { title, description, location, shoot_date, status } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    if (!title && !description && !location && !shoot_date && !status) {
      return res.status(400).json({ error: 'Provide at least one field to update' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (location !== undefined) updates.location = location;
    if (shoot_date !== undefined) updates.shoot_date = shoot_date;
    if (status !== undefined) updates.status = status;

    const { project, error } = await projectModel.updateProject(projectId, userId, updates);

    if (error) throw error;

    res.status(200).json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('permission')) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

/**
 * Invite a user to a project by email — only owner
 */
exports.inviteToProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const ownerId = req.user.id;
    const { email } = req.body;

    if (!projectId || !email) {
      return res.status(400).json({ error: 'Project ID and email required' });
    }

    const result = await projectModel.inviteToProject(projectId, ownerId, email);

    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('permission') || error.message.includes('not found')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('already')) {
      return res.status(409).json({ error: error.message });
    }
    console.error('Invite error:', error);
    res.status(500).json({ error: 'Failed to send invite' });
  }
};


/**
 * Accept an invite to a project
 */
exports.acceptInvite = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    const result = await projectModel.acceptInvite(projectId, userId);

    res.status(200).json(result);
  } catch (error) {
    if (error.message.includes('pending invite')) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Accept invite error:', error);
    res.status(500).json({ error: 'Failed to accept invite' });
  }
};

/**
 * Upload a moodboard/reference image to a project
 * Only owner or accepted collaborators can upload
 */
exports.uploadMoodboardImage = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const userId = req.user.id; // comes from requireAuth :contentReference[oaicite:0]{index=0}

    // ✅ AuthZ: only owner OR accepted collaborator can upload
    const { data: project, error: projectErr } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (projectErr || !project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isOwner = project.user_id === userId;

    let isAcceptedCollaborator = false;
    if (!isOwner) {
      const { data: member, error: memberErr } = await supabaseAdmin
        .from('project_members')
        .select('accepted_at')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle();

      isAcceptedCollaborator = !memberErr && !!member?.accepted_at;
    }

    if (!isOwner && !isAcceptedCollaborator) {
      return res.status(403).json({ error: 'Not allowed to upload to this project' });
    }

    // ✅ Multer check
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname);
    const fileName = `${projectId}/${Date.now()}${fileExtension}`;

    // ✅ Upload to Storage using admin (bypasses Storage RLS)
    const { error: uploadError } = await supabaseAdmin.storage
      .from('project-moodboards')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // ✅ Get public URL (bucket must be public)
    const { data: urlData } = supabase.storage
      .from('project-moodboards')
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // ✅ Save metadata (use admin so table name quirks/RLS don’t block server)
    const { error: dbError } = await supabaseAdmin
      .from('project-images') // your actual table name
      .insert({
        project_id: projectId,
        user_id: userId,
        image_url: imageUrl,
        file_name: file.originalname,
      });

    if (dbError) throw dbError;

    return res.status(201).json({
      message: 'Image uploaded successfully',
      image_url: imageUrl,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
};

/**
 * List all moodboard images for a project
 * Only owner or accepted members can view
 */
exports.getProjectImages = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Check permission (owner or accepted member)
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (projErr || !project) return res.status(404).json({ error: 'Project not found' });

    const isOwner = project.user_id === userId;

    let isMember = false;
    if (!isOwner) {
      const { data: member } = await supabase
        .from('project_members')
        .select('accepted_at')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      isMember = !!member?.accepted_at;
    }

    if (!isOwner && !isMember) {
      return res.status(403).json({ error: 'Not allowed to view this project' });
    }

    // Get images
    const { data: images, error: imgErr } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('uploaded_at', { ascending: false });

    if (imgErr) throw imgErr;

    res.json({ images: images || [] });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
};