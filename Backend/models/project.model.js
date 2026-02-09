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



/**
 * Delete a project by ID - only if it belongs to the user
 * @param {string} projectId - The project ID to delete
 * @param {string} userId - The authenticated user's ID (for ownership check)
 * @returns {Promise<Object>} Success message or error
 */
async function deleteProject(projectId, userId) {
  try {
    // First check ownership
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;
    if (!project) {
      throw new Error('Project not found or you do not have permission to delete it');
    }

    // Perform delete
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (deleteError) throw deleteError;

    return { message: 'Project deleted successfully' };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

/**
 * Update a project by ID - only if it belongs to the user
 * @param {string} projectId 
 * @param {string} userId 
 * @param {Object} updates - partial: { title?, description? }
 */
async function updateProject(projectId, userId, updates) {
  try {
    // Ownership check
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;
    if (!project) {
      throw new Error('Project not found or you do not have permission to update it');
    }

    // Partial update
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    return { project: data };
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}


module.exports = {
  createProject,
  getUserProjects,
  deleteProject,
  updateProject   // ← add this
};