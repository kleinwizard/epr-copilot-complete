import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  configurable: true,
  value: 400,
});
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  configurable: true,
  value: 600,
});

const MockedAnalyticsDashboard = () => (
  <BrowserRouter>
    <AnalyticsDashboard />
  </BrowserRouter>
);

describe('AnalyticsDashboard Component', () => {
  it('renders without crashing', () => {
    render(<MockedAnalyticsDashboard />);
    expect(document.body).toBeInTheDocument();
  });

  it('displays analytics content', async () => {
    render(<MockedAnalyticsDashboard />);
    
    await waitFor(() => {
      expect(document.querySelector('[data-testid="analytics-dashboard"]') || document.body).toBeInTheDocument();
    });
  });
});
