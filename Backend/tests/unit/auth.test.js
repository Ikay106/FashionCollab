/**
 * FashionCollab — Unit Tests: Auth Middleware
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

jest.mock('../../lib/supabase', () => ({
  supabase:      mockDb,
  supabaseAdmin: { ...mockDb }
}))

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ auth: { getUser: jest.fn() } })
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockChainable.forEach(m => { mockDb[m].mockReturnValue(mockDb) })
})

// ═══════════════════════════════════════════════════════
// AUTH MIDDLEWARE
// ═══════════════════════════════════════════════════════
describe('requireAuth middleware', () => {
  const { requireAuth } = require('../../middleware/auth.middleware')

  test('returns 401 when no Authorization header is provided', async () => {
    const req  = { headers: {} }
    const res  = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()
    await requireAuth(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('returns 401 when Authorization header does not start with Bearer', async () => {
    const req  = { headers: { authorization: 'Basic sometoken' } }
    const res  = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()
    await requireAuth(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
})