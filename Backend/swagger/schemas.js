// reusable schemas for the shootspace 

const schemas = {
  // auth
  SignupRequest: {
    type: 'object',
    required: ['email', 'password', 'role'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
      role: {
        type: 'string',
        enum: [
          'photographer',
          'model',
          'stylist',
          'makeup_artist',
          'hair_stylist',
          'videographer',
          'creative_director',
          'brand_rep'
        ]
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

  // users and profiles
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
      full_name: { type: 'string' },
      username: { type: 'string' },
      role: { type: 'string' },
      bio: { type: 'string' },
      location: { type: 'string' },
      avatar_url: { type: 'string', format: 'uri' },
      instagram_url: { type: 'string', format: 'uri' },
      portfolio_url: { type: 'string', format: 'uri' },
      website_url: { type: 'string', format: 'uri' }
    }
  },

  // projects
  Project: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      user_id: { type: 'string', format: 'uuid' },
      title: { type: 'string', example: 'Summer Beach Editorial' },
      description: { type: 'string' },
      location: { type: 'string' },
      shoot_date: { type: 'string', format: 'date' },
      status: {
        type: 'string',
        enum: ['draft', 'planned', 'in_progress', 'completed', 'cancelled'],
        default: 'draft'
      },
      memberStatus: { type: 'string', enum: ['Owner', 'Invitee'] },
      created_at: { type: 'string', format: 'date-time' }
    }
  },

  CreateProjectRequest: {
    type: 'object',
    required: ['title'],
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      location: { type: 'string' },
      shoot_date: { type: 'string', format: 'date' },
      status: {
        type: 'string',
        enum: ['draft', 'planned', 'in_progress', 'completed', 'cancelled'],
        default: 'draft'
      }
    }
  },

  // members
  Member: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      full_name: { type: 'string' },
      username: { type: 'string' },
      avatar_url: { type: 'string', format: 'uri' },
      location: { type: 'string' },
      project_role: { type: 'string' }
    }
  },

  // invitations
  InviteRequest: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
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

  // moodboard
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

  // comments
  Comment: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      image_id: { type: 'string', format: 'uuid' },
      user_id: { type: 'string', format: 'uuid' },
      comment: { type: 'string' },
      full_name: { type: 'string' },
      username: { type: 'string' },
      avatar_url: { type: 'string', format: 'uri' },
      project_role: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' }
    }
  },

  // notes
  Note: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      project_id: { type: 'string', format: 'uuid' },
      user_id: { type: 'string', format: 'uuid' },
      title: { type: 'string' },
      content: { type: 'string' },
      full_name: { type: 'string' },
      profile_role: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' }
    }
  },

  // links
  ProjectLink: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      project_id: { type: 'string', format: 'uuid' },
      user_id: { type: 'string', format: 'uuid' },
      title: { type: 'string' },
      url: { type: 'string', format: 'uri' },
      category: { type: 'string' },
      full_name: { type: 'string' },
      created_at: { type: 'string', format: 'date-time' }
    }
  },

  // generic error shape
  Error: {
    type: 'object',
    properties: {
      error: { type: 'string' }
    }
  }
}

module.exports = schemas