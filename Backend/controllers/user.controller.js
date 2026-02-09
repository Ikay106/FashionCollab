const supabase = require('../lib/supabase');

exports.signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: role || 'unknown' }
      }
    });

    if (error) throw error;

    res.status(201).json({
      user: data.user,
      message: 'Check your email to confirm (if confirmation is enabled)'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({
      user: data.user,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};