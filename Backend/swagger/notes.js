// notes routes

const notePaths = {
  '/api/projects/{id}/notes': {
    get: {
      tags: ['Notes'],
      summary: 'Get all notes for a project',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: {
          description: 'List of notes',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  notes: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Note' }
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
      tags: ['Notes'],
      summary: 'Add a note to a project',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['content'],
              properties: {
                title: { type: 'string' },
                content: { type: 'string' }
              }
            }
          }
        }
      },
      responses: {
        201: { description: 'Note added' },
        400: { description: 'Note content is required' }
      }
    }
  },

  '/api/projects/{id}/notes/{noteId}': {
    delete: {
      tags: ['Notes'],
      summary: 'Delete a note (author only)',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        { name: 'noteId', in: 'path', required: true, schema: { type: 'string' } }
      ],
      responses: {
        200: { description: 'Note deleted' },
        403: { description: 'You can only delete your own notes' },
        404: { description: 'Note not found' }
      }
    }
  }
}

module.exports = notePaths