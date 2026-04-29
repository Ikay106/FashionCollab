/**
 * FashionCollab — Unit Tests: Note Model
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

// NOTE MODEL — checkProjectAccess
describe('NoteModel.checkProjectAccess', () => {
  const { checkProjectAccess } = require('../../models/project/note.model')

  test('returns true when user is the project owner', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 1, user_id: 'user-123' }, error: null
    })
    const result = await checkProjectAccess(1, 'user-123')
    expect(result).toBe(true)
  })

  test('throws Not allowed when non-member tries to access notes', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 1, user_id: 'owner-456' }, error: null
    })
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    await expect(checkProjectAccess(1, 'user-123')).rejects.toThrow('Not allowed')
  })
})

// NOTE MODEL — deleteNote
describe('NoteModel.deleteNote', () => {
  const { deleteNote } = require('../../models/project/note.model')

  test('throws Not allowed when user did not write the note', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 'note-1', user_id: 'other-user' }, error: null
    })
    await expect(deleteNote('note-1', 'user-123')).rejects.toThrow('Not allowed')
  })

  test('succeeds when user is the note author', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 'note-1', user_id: 'user-123' }, error: null
    })
    const result = await deleteNote('note-1', 'user-123')
    expect(result.message).toBe('Note deleted')
  })
})