// tests/unit/memory-db.test.js

const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment
} = require('../../src/model/data/memory');

// Define (i.e., name) the set of tests we're about to do
describe('Memory Database', () => {
  // Write a test for calling readFragment() with non-existent fragment
  test('readFragment() should return null for non-existent fragment', async () => {
    const result = await readFragment('non-existent-id');
    expect(result).toBeNull();
  });

  // Write a test for calling writeFragment() and readFragment()
  test('writeFragment() and readFragment() should work correctly', async () => {
    const fragment = {
      id: 'test-fragment-1',
      ownerId: 'user-123',
      type: 'text/plain',
      size: 0
    };

    await writeFragment(fragment.id, fragment);
    const result = await readFragment(fragment.id);

    // The result should include the original properties plus updated timestamp
    expect(result.id).toBe(fragment.id);
    expect(result.ownerId).toBe(fragment.ownerId);
    expect(result.type).toBe(fragment.type);
    expect(result.size).toBe(fragment.size);
    expect(result.updated).toBeDefined();
    expect(result.created).toBeDefined();
  });

  // Write a test for calling readFragmentData() with non-existent fragment
  test('readFragmentData() should return null for non-existent fragment', async () => {
    const result = await readFragmentData('non-existent-id');
    expect(result).toBeNull();
  });

  // Write a test for calling writeFragmentData() and readFragmentData()
  test('writeFragmentData() and readFragmentData() should work correctly', async () => {
    const data = Buffer.from('Hello, world!');
    const id = 'test-fragment-data';

    await writeFragmentData(id, data);
    const result = await readFragmentData(id);
    expect(result).toEqual(data);
  });

  // Write a test for calling listFragments() with non-existent owner
  test('listFragments() should return empty array for non-existent owner', async () => {
    const result = await listFragments('non-existent-owner');
    expect(result).toEqual([]);
  });

  // Write a test for calling listFragments() with existing owner
  test('listFragments() should return fragment IDs for existing owner', async () => {
    const ownerId = 'test-owner';
    const fragment1 = { id: 'fragment-1', ownerId, type: 'text/plain', size: 0 };
    const fragment2 = { id: 'fragment-2', ownerId, type: 'text/plain', size: 0 };

    await writeFragment(fragment1.id, fragment1);
    await writeFragment(fragment2.id, fragment2);

    const result = await listFragments(ownerId);
    expect(result).toEqual(['fragment-1', 'fragment-2']);
  });

  // Write a test for calling deleteFragment() with non-existent fragment
  test('deleteFragment() should return false for non-existent fragment', async () => {
    const result = await deleteFragment('non-existent-id');
    expect(result).toBe(false);
  });

  // Write a test for calling deleteFragment() with existing fragment
  test('deleteFragment() should return true for existing fragment', async () => {
    const id = 'fragment-to-delete';
    const fragment = { id, ownerId: 'owner', type: 'text/plain', size: 0 };
    const data = Buffer.from('test data');

    await writeFragment(id, fragment);
    await writeFragmentData(id, data);

    const result = await deleteFragment(id);
    expect(result).toBe(true);

    // Verify fragment is deleted
    const deletedFragment = await readFragment(id);
    const deletedData = await readFragmentData(id);
    expect(deletedFragment).toBeNull();
    expect(deletedData).toBeNull();
  });
});
