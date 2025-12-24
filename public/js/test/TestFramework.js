/**
 * Simple test framework for Atomic Chess variants
 * No external dependencies required
 */

export class TestSuite {
  constructor(name) {
    this.name = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(description, fn) {
    this.tests.push({ description, fn });
  }

  async run() {
    console.log(`\n${this.name}`);
    console.log('='.repeat(50));
    
    for (const { description, fn } of this.tests) {
      try {
        await fn();
        console.log(`✓ ${description}`);
        this.passed++;
      } catch (error) {
        console.error(`✗ ${description}`);
        console.error(`  Error: ${error.message}`);
        this.failed++;
      }
    }
    
    console.log('-'.repeat(50));
    console.log(`Result: ${this.passed} passed, ${this.failed} failed\n`);
    
    return this.failed === 0;
  }
}

// Simple assertions
export function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

export function assertDeepEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message || `Values don't match.\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
}

export function assertArrayIncludes(array, item, message) {
  if (!array.some(el => JSON.stringify(el) === JSON.stringify(item))) {
    throw new Error(message || `Array doesn't include item: ${JSON.stringify(item)}`);
  }
}

export function assertNull(value, message) {
  if (value !== null) {
    throw new Error(message || `Expected null, got ${value}`);
  }
}

export function assertNotNull(value, message) {
  if (value === null) {
    throw new Error(message || `Expected not null`);
  }
}

export function assertTrue(value, message) {
  if (value !== true) {
    throw new Error(message || `Expected true, got ${value}`);
  }
}

export function assertFalse(value, message) {
  if (value !== false) {
    throw new Error(message || `Expected false, got ${value}`);
  }
}
