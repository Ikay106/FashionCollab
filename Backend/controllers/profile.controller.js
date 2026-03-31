const profileModel = require('../models/profile.model');

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await profileModel.getMyProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.json(
  profile || {
    id: userId,
    full_name: '',
    username: '',
    role: '',
    bio: '',
    instagram_url: '',
    portfolio_url: '',
    website_url: '',
    avatar_url: '',
    location: ''
  }
);
  } catch (error) {
    console.error('Get my profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const profileId = req.params.id;
    const profile = await profileModel.getProfileById(profileId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

   return res.json(
  profile || {
    id: profileId,
    full_name: '',
    username: '',
    role: '',
    bio: '',
    instagram_url: '',
    portfolio_url: '',
    website_url: '',
    avatar_url: '',
    location: ''
  }
);
  } catch (error) {
    console.error('Get profile by id error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.upsertMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedProfile = await profileModel.upsertProfile(userId, req.body);

    return res.status(200).json({
      message: 'Profile saved successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Upsert profile error:', error);
    return res.status(500).json({ error: error.message || 'Failed to save profile' });
  }
};