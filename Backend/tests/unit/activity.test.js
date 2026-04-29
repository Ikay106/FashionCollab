/**
 * FashionCollab — Unit Tests: Activity Model
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

// ACTIVITY MODEL — logActivity
describe('ActivityModel.logActivity', () => {
  const { logActivity } = require('../../models/activity/activity.model')

  test('does not throw when insert fails — non-blocking by design', async () => {
    mockDb.insert.mockResolvedValueOnce({ error: { message: 'DB error' } })
    await expect(
      logActivity(1, 'user-123', 'uploaded an image', 'image', 'photo.jpg')
    ).resolves.not.toThrow()
  })

  test('completes successfully when insert succeeds', async () => {
    mockDb.insert.mockResolvedValueOnce({ error: null })
    await expect(
      logActivity(1, 'user-123', 'added a note', 'note', 'My Note')
    ).resolves.not.toThrow()
  })
})