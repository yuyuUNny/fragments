// src/model/fragment.js
const contentType = require('content-type');
const crypto = require('crypto');
const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment
} = require('./data');

class Fragment {
  constructor ({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId || !type) throw new Error('ownerId and type are required');
    if (typeof size !== 'number' || size < 0) throw new Error('Invalid size');
    if (!Fragment.isSupportedType(type)) throw new Error(`Unsupported type: ${type}`);

    // If no ID is provided, generate one
    this.id = id || crypto.randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments for a user
   * @param {string} ownerId - The owner's hashed email
   * @returns {Promise<Fragment[]>} - Array of Fragment objects
   */
  static async byUser (ownerId) {
    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    const fragmentIds = await listFragments(ownerId);
    const fragments = [];

    for (const id of fragmentIds) {
      const fragmentData = await readFragment(ownerId, id);
      if (fragmentData) {
        fragments.push(new Fragment(fragmentData));
      }
    }

    return fragments;
  }

  /**
   * Get a fragment by ID
   * @param {string} id - Fragment ID
   * @returns {Promise<Fragment|null>} - Fragment object or null if not found
   */
  static async byId (ownerId, id) {
    if (!id) {
      throw new Error('ID is required');
    }

    const fragmentData = await readFragment(ownerId, id);
    return fragmentData ? new Fragment(fragmentData) : null;
  }

  /**
   * Save the fragment metadata to the database
   * @returns {Promise<void>}
   */
  async save () {
    this.updated = new Date().toISOString();
    await writeFragment({
      id: this.id,
      ownerId: this.ownerId,
      created: this.created,
      updated: this.updated,
      type: this.type,
      size: this.size
    });
  }

  /**
   * Get the fragment data from the database
   * @returns {Promise<Buffer|null>} - Fragment data or null if not found
   */
  async getData () {
    return await readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set the fragment data in the database
   * @param {Buffer} data - Fragment data
   * @returns {Promise<void>}
   */
  async setData (data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data must be a Buffer');
    }

    this.size = data.length;
    this.updated = new Date().toISOString();

    await writeFragmentData(this.ownerId, this.id, data);
    await this.save(); // Update metadata with new size and timestamp
  }

  /**
   * Delete the fragment and its data
   * @returns {Promise<boolean>} - True if deleted, false if not found
   */
  async delete () {
    return await deleteFragment(this.ownerId, this.id);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType () {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText () {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats () {
    if (this.isText) return ['text/plain'];
    return [];
  }

  /**
   * Check if a content type is supported
   * @param {string} type - Content type
   * @returns {boolean} - True if supported, false otherwise
   */
  static isSupportedType (type) {
    return type === 'text/plain';
  }
}

module.exports = Fragment;
