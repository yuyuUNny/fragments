// src/model/data/memory/index.js
const MemoryDB = require('./memory-db');

// Create two in-memory databases: one for fragment metadata and the other for raw data
const data = new MemoryDB();
const metadata = new MemoryDB();

// Write a fragment's metadata to memory db. Returns a Promise<void>
function writeFragment (fragment) {
  if (!fragment || !fragment.ownerId || !fragment.id) {
    throw new Error('Fragment must include ownerId and id');
  }
  const serialized = JSON.stringify(fragment);
  return metadata.put(fragment.ownerId, fragment.id, serialized);
}

// Read a fragment's metadata from memory db. Returns a Promise<Object>
async function readFragment (ownerId, id) {
  const serialized = await metadata.get(ownerId, id);
  if (typeof serialized === 'string') {
    return JSON.parse(serialized);
  }
  // return null if undefined
  return serialized ?? null;
}

// Write a fragment's data buffer to memory db. Returns a Promise
function writeFragmentData (ownerId, id, buffer) {
  if (!ownerId || !id) {
    throw new Error('ownerId and id are required');
  }
  return data.put(ownerId, id, buffer);
}

// Read a fragment's data from memory db. Returns a Promise
async function readFragmentData (ownerId, id) {
  const value = await data.get(ownerId, id);
  return value ?? null;
}

// Get a list of fragment ids/objects for the given user from memory db. Returns a Promise
async function listFragments (ownerId, expand = false) {
  const fragments = await metadata.query(ownerId);

  if (!fragments) return [];

  if (expand) {
    return fragments.map((fragment) =>
      typeof fragment === 'string' ? JSON.parse(fragment) : fragment
    );
  }

  return fragments.map((fragment) => JSON.parse(fragment).id);
}

// Delete a fragment's metadata and data from memory db. Returns a Promise
async function deleteFragment (ownerId, id) {
  await Promise.allSettled([
    metadata.del(ownerId, id).catch(() => {}),
    data.del(ownerId, id).catch(() => {})
  ]);
  return true;
}

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;
