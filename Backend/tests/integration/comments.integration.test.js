/**
 * FashionCollab — Integration Tests: Comment Endpoints
 */

const mockSingle      = jest.fn()
const mockMaybeSingle = jest.fn()

const mockDb = {
  from:        jest.fn(),
  select:      jest.fn(),
  insert:      jest.fn(),
  update:      jest.fn(),
  delete:      jest.fn(),
  upsert:      jest.fn(),
  eq:          jest.fn(),
  neq:         jest.fn(),
  in:          jest.fn(),
  is:          jest.fn(),
  not:         jest.fn(),
  order:       jest.fn(),
  limit:       jest.fn(),
  single:      mockSingle,
  maybeSingle: mockMaybeSingle,
}

const mockChainable = [
  'from', 'select', 'insert', 'update', 'delete',
  'upsert', 'eq', 'neq', 'in', 'is', 'not', 'order', 'limit'
]

mockChainable.forEach(m => { mockDb[m].mockReturnValue(mockDb) })

const mockStorage = {
  from:         jest.fn().mockReturnThis(),
  upload:       jest.fn(),
  remove:       jest.fn(),
  getPublicUrl: jest.fn().mockReturnValue({
    data: { publicUrl: 'https://example.com/img.jpg' }
  })
}

const mockAuth = {
  signUp:             jest.fn(),
  signInWithPassword: jest.fn(),
  getUser:            jest.fn(),
  admin: {
    getUserById:    jest.fn(),
    getUserByEmail: jest.fn(),
    listUsers:      jest.fn()
  }
}

jest.mock('../../lib/supabase', () => ({
  supabase:      { ...mockDb, auth: mockAuth },
  supabaseAdmin: { ...mockDb, storage: mockStorage, auth: mockAuth }
}))

jest.mock('../../middleware/auth.middleware', () => ({
  requireAuth: (req, _res, next) => {
    req.user = { id: 'test-user-123', email: 'test@example.com' }
    next()
  }
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockChainable.forEach(m => { mockDb[m].mockReturnValue(mockDb) })
  mockStorage.from.mockReturnThis()
})

const request = require('supertest')
const app     = require('../../index')

// COMMENTS — POST /api/projects/:id/images/:imageId/comments
describe('POST /api/projects/:id/images/:imageId/comments', () => {
  test('returns 400 when comment is empty', async () => {
    const res = await request(app)
      .post('/api/projects/1/images/img-1/comments')
      .send({ comment: '' })
    expect(res.status).toBe(400)
  })

  test('returns 400 when comment field is missing', async () => {
    const res = await request(app)
      .post('/api/projects/1/images/img-1/comments')
      .send({})
    expect(res.status).toBe(400)
  })
})