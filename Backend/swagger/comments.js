// comment routes for moodboard

const commentPaths = {
  '/api/projects/{id}/images/{imageId}/comments': {
    get: {
      tags: ['Comments'],
      summary: 'Get all comments for a moodboard image',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'imageId', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'List of comments',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  comments: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Comment' }
                  }
                }
              }
            }
          }
        }
      }
    },

    post: {
      tags: ['Comments'],
      summary: 'Add a comment to a moodboard image',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'imageId', in: 'path', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['comment'],
              properties: {
                comment: { type: 'string', example: 'Love the colour palette here!' }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Comment added' },
        400: { description: 'Comment text is required' }
      }
    }
  },

  '/api/projects/{id}/images/{imageId}/comments/{commentId}': {
    delete: {
      tags: ['Comments'],
      summary: 'Delete a comment (author or project owner only)',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'imageId', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'commentId', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: { description: 'Comment deleted' },
        403: { description: 'Not allowed' },
        404: { description: 'Comment not found' }
      }
    }
  }
}

module.exports = commentPaths