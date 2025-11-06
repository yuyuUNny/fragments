const post = require('../../src/routes/api/post');
const Fragment = require('../../src/model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../src/response');

jest.mock('../../src/model/fragment');
jest.mock('../../src/response');

describe('POST /api/fragments', () => {
  let req, res;

  beforeEach(() => {
    req = {
      get: jest.fn(),
      body: Buffer.from('test fragment data'),
      user: { email: 'user@example.com' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    createSuccessResponse.mockImplementation((data) => data);
    createErrorResponse.mockImplementation((code, message) => ({ code, message }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns 400 if Content-Type header is missing', async () => {
    req.get.mockReturnValue(undefined);

    await post(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      code: 400,
      message: 'Content-Type header is required'
    });
  });

  test('returns 415 if unsupported content type', async () => {
    req.get.mockReturnValue('unsupported/type');
    Fragment.isSupportedType.mockReturnValue(false);

    await post(req, res);

    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.json).toHaveBeenCalledWith({
      code: 415,
      message: 'Content type unsupported/type is not supported'
    });
  });

  test('returns 400 if body is missing', async () => {
    req.get.mockReturnValue('text/plain');
    Fragment.isSupportedType.mockReturnValue(true);
    req.body = '';

    await post(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ code: 400, message: 'Fragment data is required' });
  });

  test('creates and saves fragment successfully', async () => {
    req.get.mockReturnValue('text/plain');
    Fragment.isSupportedType.mockReturnValue(true);

    const mockFragment = {
      setData: jest.fn(),
      save: jest.fn()
    };
    Fragment.mockImplementation(() => mockFragment);

    await post(req, res);

    expect(Fragment).toHaveBeenCalledWith({
      ownerId: 'user@example.com',
      type: 'text/plain'
    });
    expect(mockFragment.setData).toHaveBeenCalledWith(req.body);
    expect(mockFragment.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  test('handles internal server error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    req.get.mockReturnValue('text/plain');
    Fragment.isSupportedType.mockReturnValue(true);
    Fragment.mockImplementation(() => {
      throw new Error('mock error');
    });

    await post(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      code: 500,
      message: 'Failed to create fragment'
    });
  });
});
