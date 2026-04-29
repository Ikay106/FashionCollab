/**
 * FashionCollab — Unit Tests: Profile Model
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

// PROFILE MODEL — upsertProfile
describe('ProfileModel.upsertProfile', () => {
  const { upsertProfile } = require('../../models/profile.model')

  test('returns updated profile on success', async () => {
    const mockProfile = {
      id: 'user-123',
      full_name: 'Ikenna Anaele',
      username: 'ikay106',
      role: 'Model',
      location: 'Manchester'
    }
    mockSingle.mockResolvedValueOnce({ data: mockProfile, error: null })
    const result = await upsertProfile('user-123', {
      full_name: 'Ikenna Anaele',
      username: 'ikay106',
      role: 'Model',
      location: 'Manchester'
    })
    expect(result.full_name).toBe('Ikenna Anaele')
    expect(result.role).toBe('Model')
  })

  test('throws when supabase returns an error', async () => {
    mockDb.upsert.mockReturnValueOnce({
      ...mockDb,
      select: jest.fn().mockReturnValue({
        ...mockDb,
        single: jest.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'Upsert failed' }
        })
      })
    })
    await expect(upsertProfile('user-123', {})).rejects.toThrow()
  })
})