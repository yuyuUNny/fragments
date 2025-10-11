// src/model/data/memory/index.js

/**
 * Memory Database Interface
 * TODO: Implement the memory database interface based on the assignment requirements
 */

const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment
} = require('./memory-db');

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment
};
