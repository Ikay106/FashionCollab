const { supabaseAdmin } = require('../lib/supabase');

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

module.exports = {
  getMyProfile,
  getProfileById,
  upsertProfile,
};