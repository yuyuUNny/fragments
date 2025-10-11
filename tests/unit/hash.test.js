// tests/unit/hash.test.js

const { hash } = require('../../src/hash');

// Define (i.e., name) the set of tests we're about to do
describe('Hash function', () => {
  // Write a test for calling hash()
  test('hash() should return a string', () => {
    const result = hash('test@example.com');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  // Write a test for calling hash() with same input
  test('hash() should return consistent results for same input', () => {
    const input = 'test@example.com';
    const result1 = hash(input);
    const result2 = hash(input);
    expect(result1).toBe(result2);
  });

  // Write a test for calling hash() with different inputs
  test('hash() should return different results for different inputs', () => {
    const result1 = hash('test1@example.com');
    const result2 = hash('test2@example.com');
    expect(result1).not.toBe(result2);
  });

  // Write a test for calling hash() with empty string
  test('hash() should handle empty string', () => {
    const result = hash('');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  // Write a test for calling hash() with null
  test('hash() should throw error for null email', () => {
    expect(() => hash(null)).toThrow('Email must be a string');
  });

  // Write a test for calling hash() with undefined
  test('hash() should throw error for undefined email', () => {
    expect(() => hash(undefined)).toThrow('Email must be a string');
  });

  // Write a test for calling hash() with non-string
  test('hash() should throw error for non-string email', () => {
    expect(() => hash(123)).toThrow('Email must be a string');
  });
});
