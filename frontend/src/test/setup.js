// import '@testing-library/jest-dom'

import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = MockIntersectionObserver;

// Run cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});