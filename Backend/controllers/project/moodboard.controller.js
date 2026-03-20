// backend/controllers/project/moodboard.controller.js
const path = require('path');
const { supabase, supabaseAdmin } = require('../../lib/supabase');

/* Upload image */
exports.uploadMoodboardImage = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const fileName = `${projectId}/${Date.now()}${fileExt}`;

    const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
      .from('project-moodboards')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadErr) throw uploadErr;

    const { data: urlData } = supabase.storage
      .from('project-moodboards')
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    const { error: dbErr } = await supabaseAdmin
      .from('project-images')
      .insert({
        project_id: projectId,
        user_id: userId,
        image_url: imageUrl,
        file_name: file.originalname,
      });

    if (dbErr) throw dbErr;

    res.status(201).json({
      message: 'Image uploaded',
      image_url: imageUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
};

