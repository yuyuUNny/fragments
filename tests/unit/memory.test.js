// tests/unit/memory.test.js
const MemoryDBModule = require('../../src/model/data/memory');

describe('Memory Data Module', () => {
  const ownerId = 'user1';
  const fragment = {
    id: 'frag1',
    ownerId,
    type: 'text/plain',
    size: 12,
    created: Date.now()
  };
  const buffer = Buffer.from('Hello world');

  afterEach(async () => {
    // clean up after each test
    await MemoryDBModule.deleteFragment(ownerId, fragment.id);
  });

  test('writeFragment and readFragment', async () => {
    await MemoryDBModule.writeFragment(fragment);
    const result = await MemoryDBModule.readFragment(ownerId, fragment.id);
    expect(result).toEqual(fragment);
  });

  test('writeFragmentData and readFragmentData', async () => {
    await MemoryDBModule.writeFragmentData(ownerId, fragment.id, buffer);
    const data = await MemoryDBModule.readFragmentData(ownerId, fragment.id);
    expect(data).toEqual(buffer);
  });

  test('listFragments returns IDs', async () => {
    await MemoryDBModule.writeFragment(fragment);
    const ids = await MemoryDBModule.listFragments(ownerId, false);
    expect(ids).toContain(fragment.id);
  });

  test('listFragments returns full objects with expand=true', async () => {
    await MemoryDBModule.writeFragment(fragment);
    const objects = await MemoryDBModule.listFragments(ownerId, true);
    expect(objects).toContainEqual(expect.objectContaining({ id: fragment.id }));
  });

  test('deleteFragment removes metadata and data', async () => {
    await MemoryDBModule.writeFragment(fragment);
    await MemoryDBModule.writeFragmentData(ownerId, fragment.id, buffer);

    await MemoryDBModule.deleteFragment(ownerId, fragment.id);

    const meta = await MemoryDBModule.readFragment(ownerId, fragment.id);
    const data = await MemoryDBModule.readFragmentData(ownerId, fragment.id);

    expect(meta).toBeNull();
    expect(data).toBeNull();
  });
});
