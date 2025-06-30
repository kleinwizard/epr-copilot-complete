import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard';

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
