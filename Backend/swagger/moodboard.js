// moodboard routes
// get, upload, delete images

const moodboardPaths = {
  '/api/projects/{id}/images': {
    get: {
      tags: ['Moodboard'],
      summary: 'Get all moodboard images for a project',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'List of moodboard images',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  images: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/MoodboardImage' }
                  }
                }
              }
            }
          }
        },
        403: { description: 'Not a member of this project' }
      }
    },

    post: {
      tags: ['Moodboard'],
      summary: 'Upload an image to the project moodboard',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                image: { type: 'string', format: 'binary' },
                description: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Image uploaded successfully' },
        400: { description: 'No image provided' },
        403: { description: 'Not a member of this project' }
      }
    }
  },

  '/api/projects/{id}/images/{imageId}': {
    delete: {
      tags: ['Moodboard'],
      summary: 'Delete a moodboard image (owner or uploader only)',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'imageId', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: { description: 'Image deleted' },
        403: { description: 'Only the uploader or project owner can delete this' },
        404: { description: 'Image not found' }
      }
    }
  }
}

module.exports = moodboardPaths