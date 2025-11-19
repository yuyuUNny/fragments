// tests/unit/getAllFragments.test.js
const getAllFragmentsHandler = require('../../src/routes/api/get');
const Fragment = require('../../src/model/fragment');
const { createSuccessResponse } = require('../../src/response');

// Mock dependencies
jest.mock('../../src/model/fragment', () => ({
  byUser: jest.fn()
}));
jest.mock('../../src/response', () => ({
  createSuccessResponse: jest.fn((data) => ({ status: 'ok', data }))
}));

describe('getAllFragmentsHandler', () => {
  let req, res;

  beforeEach(() => {
    req = { user: 'user123', query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  // Suppress console.error in 500 test
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterAll(() => {
    console.error.mockRestore();
  });

  test('returns fragment IDs when expand=0 or not set', async () => {
    const mockFragments = [{ id: 'frag1' }, { id: 'frag2' }];
    Fragment.byUser.mockResolvedValueOnce(mockFragments);

    await getAllFragmentsHandler(req, res);

    expect(Fragment.byUser).toHaveBeenCalledWith('user123');
    expect(createSuccessResponse).toHaveBeenCalledWith({ fragments: ['frag1', 'frag2'] });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      data: { fragments: ['frag1', 'frag2'] }
    });
  });

  test('returns full fragment objects when expand=1', async () => {
    req.query.expand = '1';
    const mockFragments = [
      { id: 'frag1', type: 'text/plain' },
      { id: 'frag2', type: 'text/markdown' }
    ];
    Fragment.byUser.mockResolvedValueOnce(mockFragments);

    await getAllFragmentsHandler(req, res);

    expect(Fragment.byUser).toHaveBeenCalledWith('user123');
    expect(createSuccessResponse).toHaveBeenCalledWith({ fragments: mockFragments });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'ok', data: { fragments: mockFragments } });
  });

  test('returns 500 on error', async () => {
    Fragment.byUser.mockRejectedValueOnce(new Error('DB failure'));

    await getAllFragmentsHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', error: 'Failed to fetch fragments' });
  });
});
