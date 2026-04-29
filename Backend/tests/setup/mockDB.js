/**
 * FashionCollab — Shared Mock Reset Helper
 *
 * This file does NOT export jest.fn() declarations (Jest hoisting prevents
 * sharing those across files). Instead, each test file declares its own
 * mockDb/mockStorage locals, then calls setupMocks(mockDb, mockStorage)
 * inside beforeEach to reset chainable return values consistently.
 *
 * Usage in each test file:
 *
 *   const { setupMocks } = require('../setup/mockDb')
 *   beforeEach(() => { setupMocks(mockDb, mockStorage) })
 */

const CHAINABLE = [
  'from', 'select', 'insert', 'update', 'delete',
  'upsert', 'eq', 'neq', 'in', 'is', 'not', 'order', 'limit'
]

function setupMocks (mockDb, mockStorage) {
  jest.clearAllMocks()
  CHAINABLE.forEach(m => {
    if (mockDb[m]) mockDb[m].mockReturnValue(mockDb)
  })
  if (mockStorage && mockStorage.from) {
    mockStorage.from.mockReturnThis()
  }
}

module.exports = { setupMocks, CHAINABLE }