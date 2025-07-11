import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

const localStorageMock = {
  getItem: vi.fn((key: string) => {
    if (key === 'access_token') {
      return 'test-token-12345';
    }
    if (key === 'user') {
      return JSON.stringify({
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        company: 'Test Company'
      });
    }
    return null;
  }),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  private callback: ResizeObserverCallback;
  
  observe() {
  }
  
  unobserve() {
  }
  
  disconnect() {
  }
};

global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  
  private callback: IntersectionObserverCallback;
  
  observe() {
  }
  
  unobserve() {
  }
  
  disconnect() {
  }
};

afterEach(() => {
  cleanup();
});
