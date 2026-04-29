/**
 * FashionCollab — Unit Tests: Collaboration Model
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

// 
// COLLABORATION MODEL — removeMember
describe('CollaborationModel.removeMember', () => {
  const { removeMember } = require('../../models/project/collaboration.model')

  test('throws permission error when requester is not the owner', async () => {
    mockSingle.mockResolvedValueOnce({
      data: null, error: { message: 'not found' }
    })
    await expect(removeMember(1, 'non-owner', 'member-123')).rejects.toThrow('permission')
  })

  test('throws error when owner tries to remove themselves', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 1, user_id: 'owner-123' }, error: null
    })
    await expect(removeMember(1, 'owner-123', 'owner-123')).rejects.toThrow('yourself')
  })

  test('succeeds when owner removes a valid member', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 1, user_id: 'owner-123' }, error: null
    })
    const result = await removeMember(1, 'owner-123', 'member-456')
    expect(result.message).toBe('Member removed successfully')
  })
})