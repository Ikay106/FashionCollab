// backend/swagger.js
const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FashionCollab API',
      version: '1.0.0',
      description: `
FashionCollab is a cloud-based collaboration platform for fashion creatives.
This API powers project management, moodboarding, team collaboration, and notifications.

## Authentication
All protected routes require a Bearer token obtained from the \`/api/auth/login\` endpoint.
Include it in the Authorization header: \`Authorization: Bearer <token>\`
      `
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        // ── Auth ────────────────────────────────────────────────────
        SignupRequest: {
          type: 'object',
          required: ['email', 'password', 'role'],
          properties: {
            email: { type: 'string', format: 'email', example: 'jane@example.com' },
            password: { type: 'string', example: 'Password123' },
            role: {
              type: 'string',
              enum: ['photographer', 'model', 'stylist', 'makeup_artist', 'hair_stylist', 'videographer', 'creative_director', 'brand_rep'],
              example: 'photographer'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'jane@example.com' },
            password: { type: 'string', example: 'Password123' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            access_token: { type: 'string' },
            refresh_token: { type: 'string' }
          }
        },

        // ── User & Profile ───────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            user_metadata: {
              type: 'object',
              properties: {
                role: { type: 'string' }
              }
            }
          }
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            full_name: { type: 'string', example: 'Jane Smith' },
            username: { type: 'string', example: 'janesmith' },
            role: { type: 'string', example: 'Photographer' },
            bio: { type: 'string', example: 'Fashion photographer based in Manchester.' },
            location: { type: 'string', example: 'Manchester, UK' },
            avatar_url: { type: 'string', format: 'uri' },
            instagram_url: { type: 'string', format: 'uri' },
            portfolio_url: { type: 'string', format: 'uri' },
            website_url: { type: 'string', format: 'uri' }
          }
        },

        // ── Projects ─────────────────────────────────────────────────
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Summer Beach Editorial' },
            description: { type: 'string', example: 'A vibrant summer campaign shoot.' },
            location: { type: 'string', example: 'Manchester Central Studio' },
            shoot_date: { type: 'string', format: 'date', example: '2026-06-15' },
            status: {
              type: 'string',
              enum: ['draft', 'planned', 'in_progress', 'completed', 'cancelled'],
              example: 'in_progress'
            },
            memberStatus: { type: 'string', enum: ['Owner', 'Invitee'], example: 'Owner' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        CreateProjectRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', example: 'Summer Beach Editorial' },
            description: { type: 'string', example: 'A vibrant summer campaign shoot.' },
            location: { type: 'string', example: 'Manchester Central Studio' },
            shoot_date: { type: 'string', format: 'date', example: '2026-06-15' },
            status: {
              type: 'string',
              enum: ['draft', 'planned', 'in_progress', 'completed', 'cancelled'],
              default: 'draft'
            }
          }
        },

        // ── Members ──────────────────────────────────────────────────
        Member: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            full_name: { type: 'string' },
            username: { type: 'string' },
            avatar_url: { type: 'string', format: 'uri' },
            location: { type: 'string' },
            project_role: { type: 'string', example: 'Photographer' }
          }
        },
        InviteRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email', example: 'collaborator@example.com' },
            role: { type: 'string', example: 'Model' }
          }
        },
        Invite: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            project_id: { type: 'string', format: 'uuid' },
            invited_at: { type: 'string', format: 'date-time' },
            projects: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }
        },

        // ── Moodboard ────────────────────────────────────────────────
        MoodboardImage: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            project_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            image_url: { type: 'string', format: 'uri' },
            file_name: { type: 'string' },
            description: { type: 'string' },
            uploader_role: { type: 'string', example: 'Owner' },
            uploaded_at: { type: 'string', format: 'date-time' }
          }
        },

        // ── Comments ─────────────────────────────────────────────────
        Comment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            image_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            comment: { type: 'string', example: 'Love the colour palette here!' },
            full_name: { type: 'string' },
            username: { type: 'string' },
            avatar_url: { type: 'string', format: 'uri' },
            project_role: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },

        // ── Notes ────────────────────────────────────────────────────
        Note: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            project_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Shoot day logistics' },
            content: { type: 'string', example: 'Call time is 8am. Bring own wardrobe.' },
            full_name: { type: 'string' },
            profile_role: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },

        // ── Links ────────────────────────────────────────────────────
        ProjectLink: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            project_id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Pinterest Board' },
            url: { type: 'string', format: 'uri' },
            category: { type: 'string', example: 'Pinterest' },
            full_name: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },

        // ── Errors ───────────────────────────────────────────────────
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Something went wrong' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }],

    paths: {
      // ── AUTH ──────────────────────────────────────────────────────
      '/api/auth/signup': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } } }
          },
          responses: {
            201: { description: 'User created. Check email to confirm.' },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
          }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Log in and receive access token',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
            },
            401: { description: 'Invalid credentials' }
          }
        }
      },

      // ── PROFILES ──────────────────────────────────────────────────
      '/api/profiles/me': {
        get: {
          tags: ['Profiles'],
          summary: 'Get your own profile',
          responses: {
            200: { description: 'Profile data', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profile' } } } },
            404: { description: 'Profile not found' }
          }
        },
        put: {
          tags: ['Profiles'],
          summary: 'Create or update your profile',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Profile' } } }
          },
          responses: {
            200: { description: 'Profile saved successfully' },
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
            200: { description: 'Avatar uploaded successfully' },
            400: { description: 'No image uploaded' },
            500: { description: 'Upload failed' }
          }
        }
      },
      '/api/profiles/{id}': {
        get: {
          tags: ['Profiles'],
          summary: 'Get a user profile by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Profile data', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profile' } } } },
            404: { description: 'Profile not found' }
          }
        }
      },

      // ── PROJECTS ──────────────────────────────────────────────────
      '/api/projects': {
        post: {
          tags: ['Projects'],
          summary: 'Create a new project',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProjectRequest' } } }
          },
          responses: {
            201: { description: 'Project created' },
            400: { description: 'Validation error' }
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
                      projects: { type: 'array', items: { $ref: '#/components/schemas/Project' } }
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
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Project data', content: { 'application/json': { schema: { $ref: '#/components/schemas/Project' } } } },
            403: { description: 'Not authorized' },
            404: { description: 'Project not found' }
          }
        },
        patch: {
          tags: ['Projects'],
          summary: 'Update a project (owner only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProjectRequest' } } }
          },
          responses: {
            200: { description: 'Project updated' },
            403: { description: 'Not authorized' }
          }
        },
        delete: {
          tags: ['Projects'],
          summary: 'Delete a project and all its data (owner only)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Project deleted' },
            403: { description: 'Not authorized' }
          }
        }
      },

      // ── MEMBERS ───────────────────────────────────────────────────
      '/api/projects/{id}/members': {
        get: {
          tags: ['Members'],
          summary: 'Get all accepted members of a project',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'List of members',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      members: { type: 'array', items: { $ref: '#/components/schemas/Member' } }
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
            400: { description: 'Cannot remove yourself' },
            403: { description: 'Not authorized' }
          }
        }
      },

      // ── INVITATIONS ───────────────────────────────────────────────
      '/api/projects/invites': {
        get: {
          tags: ['Invitations'],
          summary: 'Get all pending invites for the logged-in user',
          responses: {
            200: {
              description: 'List of pending invites',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      invites: { type: 'array', items: { $ref: '#/components/schemas/Invite' } }
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
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/InviteRequest' } } }
          },
          responses: {
            201: { description: 'User invited successfully. Email notification sent.' },
            403: { description: 'Not authorized' },
            404: { description: 'User not found' },
            409: { description: 'User already invited or a member' }
          }
        }
      },
      '/api/projects/{id}/accept': {
        patch: {
          tags: ['Invitations'],
          summary: 'Accept a project invite. Email notification sent to owner.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Invite accepted' },
            404: { description: 'No pending invite found' }
          }
        }
      },
      '/api/projects/{id}/decline': {
        delete: {
          tags: ['Invitations'],
          summary: 'Decline a project invite. Email notification sent to owner.',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Invite declined' },
            500: { description: 'Server error' }
          }
        }
      },

      // ── MOODBOARD ─────────────────────────────────────────────────
      '/api/projects/{id}/images': {
        get: {
          tags: ['Moodboard'],
          summary: 'Get all moodboard images for a project',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'List of images',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      images: { type: 'array', items: { $ref: '#/components/schemas/MoodboardImage' } }
                    }
                  }
                }
              }
            },
            403: { description: 'Not allowed' }
          }
        },
        post: {
          tags: ['Moodboard'],
          summary: 'Upload an image to the project moodboard',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    image: { type: 'string', format: 'binary' },
                    description: { type: 'string', example: 'Reference for lighting mood' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Image uploaded successfully' },
            400: { description: 'No image uploaded' },
            403: { description: 'Not allowed' }
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
            403: { description: 'Not allowed' },
            404: { description: 'Image not found' }
          }
        }
      },

      // ── COMMENTS ──────────────────────────────────────────────────
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
                      comments: { type: 'array', items: { $ref: '#/components/schemas/Comment' } }
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
                  properties: { comment: { type: 'string', example: 'Love the colour palette here!' } }
                }
              }
            }
          },
          responses: {
            201: { description: 'Comment added' },
            400: { description: 'Comment required' }
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
      },

      // ── NOTES ─────────────────────────────────────────────────────
      '/api/projects/{id}/notes': {
        get: {
          tags: ['Notes'],
          summary: 'Get all notes for a project',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'List of notes',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      notes: { type: 'array', items: { $ref: '#/components/schemas/Note' } }
                    }
                  }
                }
              }
            },
            403: { description: 'Not allowed' }
          }
        },
        post: {
          tags: ['Notes'],
          summary: 'Add a note to a project',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['content'],
                  properties: {
                    title: { type: 'string', example: 'Shoot day logistics' },
                    content: { type: 'string', example: 'Call time is 8am.' }
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
            403: { description: 'Not allowed' },
            404: { description: 'Note not found' }
          }
        }
      },

      // ── LINKS ─────────────────────────────────────────────────────
      '/api/projects/{id}/links': {
        get: {
          tags: ['Links'],
          summary: 'Get all resource links for a project',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'List of links',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      links: { type: 'array', items: { $ref: '#/components/schemas/ProjectLink' } }
                    }
                  }
                }
              }
            },
            403: { description: 'Not allowed' }
          }
        },
        post: {
          tags: ['Links'],
          summary: 'Add a resource link to a project',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'url'],
                  properties: {
                    title: { type: 'string', example: 'Pinterest Board' },
                    url: { type: 'string', format: 'uri', example: 'https://pinterest.com/board' },
                    category: { type: 'string', example: 'Pinterest' }
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
            403: { description: 'Not allowed' },
            404: { description: 'Link not found' }
          }
        }
      }
    }
  },
  apis: []
}

module.exports = swaggerJsdoc(options)