import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

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
