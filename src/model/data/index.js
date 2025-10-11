// src/model/data/index.js

/**
 * Data access layer - currently using in-memory storage
 */

const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment
} = require('./memory');

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment
};
