const { supabaseAdmin } = require('../lib/supabase');
const path = require('path')

async function getMyProfile(userId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getProfileById(profileId) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function upsertProfile(userId, profileData) {
  const payload = {
    id: userId,
    full_name: profileData.full_name || null,
    username: profileData.username || null,
    role: profileData.role || null,
    bio: profileData.bio || null,
    instagram_url: profileData.instagram_url || null,
    portfolio_url: profileData.portfolio_url || null,
    website_url: profileData.website_url || null,
    avatar_url: profileData.avatar_url || null,
    location: profileData.location || null,
  };

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function uploadAvatar(userId, file) {
  const fileExt = path.extname(file.originalname)
  const fileName = `${userId}${fileExt}`
 
  // Upsert so re-uploading replaces the old one
  const { error: uploadErr } = await supabaseAdmin.storage
    .from('avatars')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    })
 
  if (uploadErr) throw uploadErr
 
  const { data: urlData } = supabaseAdmin.storage
    .from('avatars')
    .getPublicUrl(fileName)
 
  // Add cache-busting so browser picks up the new image immediately
  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`
 
  // Save URL to profile
  const { data, error: dbErr } = await supabaseAdmin
    .from('profiles')
    .upsert({ id: userId, avatar_url: avatarUrl }, { onConflict: 'id' })
    .select()
    .single()
 
  if (dbErr) throw dbErr
 
  return { avatar_url: avatarUrl, profile: data }
}

module.exports = {
  getMyProfile,
  getProfileById,
  upsertProfile,
  uploadAvatar
};