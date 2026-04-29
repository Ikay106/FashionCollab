/**
 * FashionCollab — Integration Tests: Auth Endpoints
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

// AUTH — POST /api/auth/signup
describe('POST /api/auth/signup', () => {
  test('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ password: 'password123' })
    expect(res.status).toBe(400)
  })

  test('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com' })
    expect(res.status).toBe(400)
  })
})

// AUTH — POST /api/auth/login
describe('POST /api/auth/login', () => {
  test('returns 400 when both fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({})
    expect(res.status).toBe(400)
  })
})