// project routes
// covers create, list, get, update, delete

const projectPaths = {
  '/api/projects': {
    post: {
      tags: ['Projects'],
      summary: 'Create a new project',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateProjectRequest' }
          }
        }
      },
      responses: {
        201: { description: 'Project created successfully' },
        400: { description: 'Title is required' }
      }
    }
  },

  '/api/projects/my': {
    get: {
      tags: ['Projects'],
      summary: 'Get all projects you own or are a member of',
      responses: {
        200: {
          description: 'List of projects',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  projects: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Project' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/projects/{id}': {
    get: {
      tags: ['Projects'],
      summary: 'Get a single project by ID',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'Project data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Project' }
            }
          }
        },
        403: { description: 'You are not a member of this project' },
        404: { description: 'Project not found' }
      }
    },

    patch: {
      tags: ['Projects'],
      summary: 'Update project details (owner only)',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateProjectRequest' }
          }
        }
      },
      responses: {
        200: { description: 'Project updated' },
        403: { description: 'Only the project owner can do this' }
      }
    },

    delete: {
      tags: ['Projects'],
      summary: 'Delete a project and all its data (owner only)',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: { description: 'Project deleted' },
        403: { description: 'Only the project owner can do this' }
      }
    }
  }
}

module.exports = projectPaths