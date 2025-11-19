// tests/unit/getFragment.test.js
const getFragmentHandler = require('../../src/routes/api/get-id');
const Fragment = require('../../src/model/fragment');
const md = require('markdown-it')();

// ----------------------------
// Mock dependencies
// ----------------------------
jest.mock('../../src/model/fragment');
jest.mock('../../src/response', () => ({
  createErrorResponse: jest.fn((code, message) => ({ error: { code, message } }))
}));

describe('getFragmentHandler', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: 'user123',
      params: { id: 'frag1' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  // ----------------------------
  // Suppress console.error for tests
  // ----------------------------
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  test('returns 404 if fragment not found', async () => {
    Fragment.byId.mockResolvedValueOnce(null);

    await getFragmentHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: { code: 404, message: 'Fragment not found' } });
  });

  test('returns raw data if no extension is provided', async () => {
    const mockFragment = {
      type: 'text/plain',
      getData: jest.fn().mockResolvedValue('hello world')
    };
    Fragment.byId.mockResolvedValueOnce(mockFragment);

    await getFragmentHandler(req, res);

    expect(res.set).toHaveBeenCalledWith('Content-Type', 'text/plain');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('hello world');
  });

  test('converts markdown to HTML when .html extension is requested', async () => {
    req.params.id = 'frag1.html';
    const mockFragment = {
      type: 'text/markdown',
      getData: jest.fn().mockResolvedValue('# Title')
    };
    Fragment.byId.mockResolvedValueOnce(mockFragment);

    await getFragmentHandler(req, res);

    expect(res.set).toHaveBeenCalledWith('Content-Type', 'text/html');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(md.render('# Title'));
  });

  test('returns text/plain for markdown with .txt extension', async () => {
    req.params.id = 'frag1.txt';
    const mockFragment = {
      type: 'text/markdown',
      getData: jest.fn().mockResolvedValue('**bold** text')
    };
    Fragment.byId.mockResolvedValueOnce(mockFragment);

    await getFragmentHandler(req, res);

    expect(res.set).toHaveBeenCalledWith('Content-Type', 'text/plain');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('**bold** text');
  });

  test('returns 415 if conversion is not supported', async () => {
    req.params.id = 'frag1.json';
    const mockFragment = {
      type: 'text/plain',
      getData: jest.fn().mockResolvedValue('{}')
    };
    Fragment.byId.mockResolvedValueOnce(mockFragment);

    await getFragmentHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 415, message: 'Cannot convert text/plain to .json' }
    });
  });

  test('returns 500 on unexpected errors without console spam', async () => {
    Fragment.byId.mockRejectedValueOnce(new Error('DB failure'));

    await getFragmentHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 500, message: 'Failed to get fragment' }
    });
  });
});
