// tests/unit/getByIdInfo.test.js
const getByIdInfoHandler = require('../../src/routes/api/get-by-id-info');
const { Fragment } = require('../../src/model/fragment');

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
