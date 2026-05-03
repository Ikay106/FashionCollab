// member routes
// get members list and remove a member from a project

const memberPaths = {
  '/api/projects/{id}/members': {
    get: {
      tags: ['Members'],
      summary: 'Get all accepted members of a project',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'List of members with their profile and project role',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  members: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Member' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/projects/{id}/members/{memberId}': {
    delete: {
      tags: ['Members'],
      summary: 'Remove a member from a project (owner only)',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'memberId', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: { description: 'Member removed' },
        400: { description: 'You cannot remove yourself' },
        403: { description: 'Only the owner can remove members' }
      }
    }
  }
}

module.exports = memberPaths