// backend/models/project.model.js
const supabase = require('../lib/supabase');

/**
 * Create a new project for the authenticated user
 * @param {string} userId - The ID of the logged-in user (from req.user.id)
 * @param {Object} projectData - { title, description }
 * @returns {Promise<Object>} The created project or error
 */
async function createProject(userId, { title, description }) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          title,
          description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return { project: data };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

/**
 * Get all projects created by a user
 * @param {string} userId 
 * @returns {Promise<Array>} List of projects
 */
async function getUserProjects(userId) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { projects: data || [] };
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}



module.exports = {
  createProject,
  getUserProjects
  // Add more functions later: getById, update, delete...
};