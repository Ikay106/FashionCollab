// profile routes

const profilePaths = {
  '/api/profiles/me': {
    get: {
      tags: ['Profiles'],
      summary: 'Get your own profile',
      responses: {
        200: {
          description: 'Returns profile data for the authenticated user',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Profile' }
            }
          }
        },
        404: { description: 'Profile not found - user may not have set one up yet' }
      }
    },

    put: {
      tags: ['Profiles'],
      summary: 'Create or update your profile',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Profile' }
          }
        }
      },
      responses: {
        200: { description: 'Profile saved' },
        500: { description: 'Server error' }
      }
    }
  },

  '/api/profiles/me/avatar': {
    post: {
      tags: ['Profiles'],
      summary: 'Upload a profile avatar',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                image: { type: 'string', format: 'binary' }
              }
            }
          }
        }
      },
      responses: {
        200: { description: 'Avatar uploaded' },
        400: { description: 'No image provided' },
        500: { description: 'Upload failed' }
      }
    }
  },

  '/api/profiles/{id}': {
    get: {
      tags: ['Profiles'],
      summary: 'Get a user profile by ID',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'Profile data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Profile' }
            }
          }
        },
        404: { description: 'Profile not found' }
      }
    }
  }
}

module.exports = profilePaths