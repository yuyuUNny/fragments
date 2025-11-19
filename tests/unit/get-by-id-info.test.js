// tests/unit/getByIdInfo.test.js
const getByIdInfoHandler = require('../../src/routes/api/get-by-id-info');
const { Fragment } = require('../../src/model/fragment');
const { createSuccessResponse } = require('../../src/response');

jest.mock('../../src/model/fragment', () => ({
  Fragment: {
    byId: jest.fn()
  }
}));

jest.mock('../../src/response', () => ({
  createSuccessResponse: jest.fn((data) => ({ status: 'ok', data }))
}));

describe('getByIdInfoHandler', () => {
  let req, res;

  beforeEach(() => {
    req = { user: 'user123', params: { id: 'frag1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  test('returns 404 if fragment not found', async () => {
    Fragment.byId.mockResolvedValueOnce(null);

    await getByIdInfoHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: "Fragment with id 'frag1' not found"
    });
  });

  test('returns 200 with fragment metadata if found', async () => {
    const mockFragment = { toJSON: jest.fn().mockReturnValue({ id: 'frag1', type: 'text/plain' }) };
    Fragment.byId.mockResolvedValueOnce(mockFragment);

    await getByIdInfoHandler(req, res);

    expect(createSuccessResponse).toHaveBeenCalledWith({
      fragment: { id: 'frag1', type: 'text/plain' }
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      data: { fragment: { id: 'frag1', type: 'text/plain' } }
    });
  });

  test('returns 500 on unexpected errors', async () => {
    Fragment.byId.mockRejectedValueOnce(new Error('DB failure'));

    await getByIdInfoHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Unable to fetch fragment metadata'
    });
  });
});
