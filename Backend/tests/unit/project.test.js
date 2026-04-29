/**
 * FashionCollab — Unit Tests: Project Model
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

// PROJECT MODEL — getProjectById
describe('ProjectModel.getProjectById', () => {
  const { getProjectById } = require('../../models/project/project.model')

  test('returns project with memberStatus Owner when user is owner', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 1, user_id: 'user-123', title: 'Test Project' }, error: null
    })
    const result = await getProjectById(1, 'user-123')
    expect(result.project.memberStatus).toBe('Owner')
  })

  test('throws Not authorized when non-member tries to access project', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 1, user_id: 'owner-456', title: 'Test Project' }, error: null
    })
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    await expect(getProjectById(1, 'random-user')).rejects.toThrow('Not authorized')
  })

  test('returns memberStatus Invitee for an accepted collaborator', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 1, user_id: 'owner-456', title: 'Test Project' }, error: null
    })
    mockMaybeSingle.mockResolvedValueOnce({
      data: { accepted_at: '2024-01-01T00:00:00Z' }, error: null
    })
    const result = await getProjectById(1, 'member-123')
    expect(result.project.memberStatus).toBe('Invitee')
  })
})