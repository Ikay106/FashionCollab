// resource link routes

const linkPaths = {
  '/api/projects/{id}/links': {
    get: {
      tags: ['Links'],
      summary: 'Get all resource links for a project',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'List of links',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  links: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ProjectLink' }
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
      tags: ['Links'],
      summary: 'Add a resource link to a project',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'url'],
              properties: {
                title: { type: 'string' },
                url: { type: 'string', format: 'uri' },
                category: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Link added' },
        400: { description: 'Title and URL are required' }
      }
    }
  },

  '/api/projects/{id}/links/{linkId}': {
    delete: {
      tags: ['Links'],
      summary: 'Delete a resource link (author only)',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'linkId', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: { description: 'Link deleted' },
        403: { description: 'You can only delete links you added' },
        404: { description: 'Link not found' }
      }
    }
  }
}

module.exports = linkPaths