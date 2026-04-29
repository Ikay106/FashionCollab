/**
 * FashionCollab — Integration Tests: Project Endpoints
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

// PROJECTS — POST /api/projects
describe('POST /api/projects', () => {
  test('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({ description: 'No title' })
    expect(res.status).toBe(400)
  })

  test('returns 201 when project is created successfully', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 1, title: 'Summer Shoot', user_id: 'test-user-123', status: 'draft' },
      error: null
    })
    const res = await request(app)
      .post('/api/projects')
      .send({ title: 'Summer Shoot', status: 'draft' })
    expect(res.status).toBe(201)
    expect(res.body.project.title).toBe('Summer Shoot')
  })
})

// PROJECTS — GET /api/projects/my
describe('GET /api/projects/my', () => {
  test('returns 200 with a projects array', async () => {
    mockDb.order.mockResolvedValueOnce({
      data: [{ id: 1, title: 'My Project', user_id: 'test-user-123' }],
      error: null
    })
    mockDb.not.mockResolvedValueOnce({ data: [], error: null })
    const res = await request(app).get('/api/projects/my')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.projects)).toBe(true)
  })
})

// PROJECTS — PATCH /api/projects/:id
describe('PATCH /api/projects/:id', () => {
  test('returns 400 when no fields are provided', async () => {
    const res = await request(app)
      .patch('/api/projects/1')
      .send({})
    expect(res.status).toBe(400)
  })
})

// NOTES — POST /api/projects/:id/notes
describe('POST /api/projects/:id/notes', () => {
  test('returns 400 when content is empty', async () => {
    const res = await request(app)
      .post('/api/projects/1/notes')
      .send({ content: '' })
    expect(res.status).toBe(400)
  })

  test('returns 400 when content is missing', async () => {
    const res = await request(app)
      .post('/api/projects/1/notes')
      .send({ title: 'My Note' })
    expect(res.status).toBe(400)
  })
})

// LINKS — POST /api/projects/:id/links
describe('POST /api/projects/:id/links', () => {
  test('returns 400 when url is missing', async () => {
    const res = await request(app)
      .post('/api/projects/1/links')
      .send({ title: 'Pinterest' })
    expect(res.status).toBe(400)
  })

  test('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/projects/1/links')
      .send({ url: 'https://pinterest.com' })
    expect(res.status).toBe(400)
  })
})

// INVITE — POST /api/projects/:id/invite
describe('POST /api/projects/:id/invite', () => {
  test('returns 400 when email is missing', async () => {
    const res = await request(app)
      .post('/api/projects/1/invite')
      .send({ role: 'Model' })
    expect(res.status).toBe(400)
  })
})