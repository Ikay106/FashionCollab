const swaggerJsdoc = require('swagger-jsdoc')

const schemas = require('./schemas')
const authPaths = require('./auth')
const profilePaths = require('./profiles')
const projectPaths = require('./projects')
const memberPaths = require('./members')
const invitationPaths = require('./invitations')
const moodboardPaths = require('./moodboard')
const commentPaths = require('./comments')
const notePaths = require('./notes')
const linkPaths = require('./links')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FashionCollab API',
      version: '1.0.0',
      description: `
FashionCollab is a cloud-based collaboration platform for fashion creatives.
Powers project management, moodboarding, team collaboration, and email notifications.

## Auth
Protected routes need a Bearer token from \`/api/auth/login\`.
Pass it as: \`Authorization: Bearer <token>\`
      `
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local dev'
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
      schemas
    },
    security: [{ bearerAuth: [] }],
    paths: {
      ...authPaths,
      ...profilePaths,
      ...projectPaths,
      ...memberPaths,
      ...invitationPaths,
      ...moodboardPaths,
      ...commentPaths,
      ...notePaths,
      ...linkPaths
    }
  },
  apis: []
}

module.exports = swaggerJsdoc(options)