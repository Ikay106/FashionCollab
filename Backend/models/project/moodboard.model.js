// backend/models/moodboard.model.js
const path = require('path')
const { supabase, supabaseAdmin } = require('../../lib/supabase')
 
/**
 * Check if user has access to a project (owner or accepted member)
 */
async function checkProjectAccess(projectId, userId) {
  const { data: project, error } = await supabaseAdmin
    .from('projects')
    .select('id, user_id')
    .eq('id', projectId)
    .single()
 
  if (error) throw error
  if (!project) throw new Error('Project not found')
 
  if (project.user_id === userId) return { project, isOwner: true }
 
  const { data: member, error: memberErr } = await supabaseAdmin
    .from('project_members')
    .select('accepted_at')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .maybeSingle()
 
  if (memberErr) throw memberErr
  if (!member?.accepted_at) throw new Error('Not allowed')
 
  return { project, isOwner: false }
}
 
/**
 * Upload a moodboard image to storage and save DB record
 */
async function uploadImage(projectId, userId, file, description) {
  const fileExt = path.extname(file.originalname)
  const fileName = `${projectId}/${Date.now()}${fileExt}`
 
  const { error: uploadErr } = await supabaseAdmin.storage
    .from('project-moodboards')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    })
 
  if (uploadErr) throw uploadErr
 
  const { data: urlData } = supabase.storage
    .from('project-moodboards')
    .getPublicUrl(fileName)
 
  const { error: dbErr } = await supabaseAdmin
    .from('project-images')
    .insert({
      project_id: projectId,
      user_id: userId,
      image_url: urlData.publicUrl,
      file_name: file.originalname,
      description: description || null,
      storage_path: fileName
    })
 
  if (dbErr) throw dbErr
 
  return { image_url: urlData.publicUrl }
}
 
/**
 * Get all images for a project with uploader role
 */
async function getImages(projectId, ownerId) {
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
 
  const memberMap = Object.fromEntries((members || []).map(m => [m.user_id, m.role]))
 
  return (images || []).map(img => ({
    ...img,
    uploader_role: img.user_id === ownerId ? 'Owner' : memberMap[img.user_id] || 'Collaborator'
  }))
}
 
/**
 * Delete an image from storage and DB
 */
async function deleteImage(projectId, imageId, userId) {
  const { data: image, error: imageErr } = await supabaseAdmin
    .from('project-images')
    .select('*')
    .eq('id', imageId)
    .single()
 
  if (imageErr) throw imageErr
  if (!image) throw new Error('Image not found')
 
  const { data: project, error: projectErr } = await supabaseAdmin
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single()
 
  if (projectErr) throw projectErr
 
  const isOwner = project.user_id === userId
  const isUploader = image.user_id === userId
 
  if (!isOwner && !isUploader) throw new Error('Not allowed')
 
  const storagePath = image.image_url.split('/object/public/project-moodboards/')[1]
  if (storagePath) {
    await supabaseAdmin.storage.from('project-moodboards').remove([storagePath])
  }
 
  const { error: deleteErr } = await supabaseAdmin
    .from('project-images')
    .delete()
    .eq('id', imageId)
 
  if (deleteErr) throw deleteErr
 
  return { message: 'Image deleted' }
}
 
module.exports = { checkProjectAccess, uploadImage, getImages, deleteImage }
 
