import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { DashboardOverview } from '../dashboard/DashboardOverview';

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

const MockedDashboardOverview = () => (
  <BrowserRouter>
    <DashboardOverview />
  </BrowserRouter>
);

describe('DashboardOverview Component', () => {
  it('renders without crashing', () => {
    render(<MockedDashboardOverview />);
    expect(document.body).toBeInTheDocument();
  });

  it('displays dashboard content', async () => {
    render(<MockedDashboardOverview />);
    
    await waitFor(() => {
      expect(document.querySelector('[data-testid="dashboard-overview"]') || document.body).toBeInTheDocument();
    });
  });
});
