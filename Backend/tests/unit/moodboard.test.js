/**
 * FashionCollab — Unit Tests: Moodboard Model
 */

const mockSingle      = jest.fn()
const mockMaybeSingle = jest.fn()
const mockRemove      = jest.fn()

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
  remove:       mockRemove,
  getPublicUrl: jest.fn().mockReturnValue({
    data: { publicUrl: 'https://example.com/image.jpg' }
  })
}

jest.mock('../../lib/supabase', () => ({
  supabase:      mockDb,
  supabaseAdmin: { ...mockDb, storage: mockStorage }
}))

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ auth: { getUser: jest.fn() } })
}))

beforeEach(() => {
  jest.clearAllMocks()
  mockChainable.forEach(m => { mockDb[m].mockReturnValue(mockDb) })
  mockStorage.from.mockReturnThis()
})

// MOODBOARD MODEL — checkProjectAccess
describe('MoodboardModel.checkProjectAccess', () => {
  const { checkProjectAccess } = require('../../models/project/moodboard.model')

  test('returns isOwner true when user is the project owner', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 1, user_id: 'user-123' }, error: null
    })
    const result = await checkProjectAccess(1, 'user-123')
    expect(result.isOwner).toBe(true)
  })

  test('throws Project not found when project does not exist', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: null })
    await expect(checkProjectAccess(999, 'user-123')).rejects.toThrow('Project not found')
  })

  test('throws Not allowed when user has no project membership', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 1, user_id: 'owner-456' }, error: null
    })
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null })
    await expect(checkProjectAccess(1, 'user-123')).rejects.toThrow('Not allowed')
  })

  test('throws Not allowed when invite is pending but not accepted', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 1, user_id: 'owner-456' }, error: null
    })
    mockMaybeSingle.mockResolvedValueOnce({ data: { accepted_at: null }, error: null })
    await expect(checkProjectAccess(1, 'user-123')).rejects.toThrow('Not allowed')
  })

  test('returns isOwner false when user is an accepted collaborator', async () => {
    mockSingle.mockResolvedValueOnce({
      data: { id: 1, user_id: 'owner-456' }, error: null
    })
    mockMaybeSingle.mockResolvedValueOnce({
      data: { accepted_at: '2024-01-01T00:00:00Z' }, error: null
    })
    const result = await checkProjectAccess(1, 'user-123')
    expect(result.isOwner).toBe(false)
  })
})

// MOODBOARD MODEL — deleteImage
describe('MoodboardModel.deleteImage', () => {
  const { deleteImage } = require('../../models/project/moodboard.model')

  test('throws Not allowed when user is neither owner nor uploader', async () => {
    mockSingle
      .mockResolvedValueOnce({
        data: {
          id: 'img-1',
          user_id: 'uploader-999',
          image_url: 'https://x.com/object/public/project-moodboards/p/img.jpg',
          storage_path: 'p/img.jpg'
        },
        error: null
      })
      .mockResolvedValueOnce({ data: { user_id: 'owner-456' }, error: null })
    await expect(deleteImage(1, 'img-1', 'random-user')).rejects.toThrow('Not allowed')
  })

  test('succeeds when user is the uploader', async () => {
    mockSingle
      .mockResolvedValueOnce({
        data: {
          id: 'img-1',
          user_id: 'user-123',
          image_url: 'https://x.com/object/public/project-moodboards/p/img.jpg',
          storage_path: 'p/img.jpg'
        },
        error: null
      })
      .mockResolvedValueOnce({ data: { user_id: 'owner-456' }, error: null })
    mockRemove.mockResolvedValueOnce({ error: null })
    const result = await deleteImage(1, 'img-1', 'user-123')
    expect(result.message).toBe('Image deleted')
  })

  test('succeeds when user is the project owner', async () => {
    mockSingle
      .mockResolvedValueOnce({
        data: {
          id: 'img-1',
          user_id: 'uploader-999',
          image_url: 'https://x.com/object/public/project-moodboards/p/img.jpg',
          storage_path: 'p/img.jpg'
        },
        error: null
      })
      .mockResolvedValueOnce({ data: { user_id: 'owner-123' }, error: null })
    mockRemove.mockResolvedValueOnce({ error: null })
    const result = await deleteImage(1, 'img-1', 'owner-123')
    expect(result.message).toBe('Image deleted')
  })
})