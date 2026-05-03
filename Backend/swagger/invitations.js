// invitation routes
// send, accept, decline

const invitationPaths = {
  '/api/projects/invites': {
    get: {
      tags: ['Invitations'],
      summary: 'Get all pending invites for the logged in user',
      responses: {
        200: {
          description: 'List of pending invites',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  invites: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Invite' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  '/api/projects/{id}/invite': {
    post: {
      tags: ['Invitations'],
      summary: 'Invite a user to a project by email (owner only)',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/InviteRequest' }
          }
        }
      },
      responses: {
        201: { description: 'Invite sent. Email notification dispatched.' },
        403: { description: 'Only the owner can invite people' },
        404: { description: 'No account found with that email' },
        409: { description: 'This user is already invited or a member' }
      }
    }
  },

  '/api/projects/{id}/accept': {
    patch: {
      tags: ['Invitations'],
      summary: 'Accept a project invite',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: { description: 'Invite accepted. Owner notified by email.' },
        404: { description: 'No pending invite found for this project' }
      }
    }
  },

  '/api/projects/{id}/decline': {
    delete: {
      tags: ['Invitations'],
      summary: 'Decline a project invite',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: { description: 'Invite declined. Owner notified by email.' },
        500: { description: 'Something went wrong' }
      }
    }
  }
}

module.exports = invitationPaths