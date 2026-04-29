/**
 * FashionCollab — Unit Tests: Link Model
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

// LINK MODEL — deleteLink
describe('LinkModel.deleteLink', () => {
  const { deleteLink } = require('../../models/project/link.model')

  test('throws Not allowed when user did not add the link', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 'link-1', user_id: 'other-user' }, error: null
    })
    await expect(deleteLink('link-1', 'user-123')).rejects.toThrow('Not allowed')
  })

  test('succeeds when user is the link author', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 'link-1', user_id: 'user-123' }, error: null
    })
    const result = await deleteLink('link-1', 'user-123')
    expect(result.message).toBe('Link deleted')
  })
})