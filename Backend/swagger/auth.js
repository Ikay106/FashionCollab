const authPaths = {
  '/api/auth/signup': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SignupRequest' }
          }
        }
      },
      responses: {
        201: { description: 'User created. Check email to confirm account.' },
        400: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
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
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginRequest' }
          }
        }
      },
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' }
            }
          }
        },
        401: { description: 'Invalid credentials' }
      }
    }
  }
}
 
module.exports = authPaths
 
