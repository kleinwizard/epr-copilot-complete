import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { ComplianceScoreWidget } from './ComplianceScoreWidget';

describe('ComplianceScoreWidget', () => {
  beforeEach(() => {
    window.localStorage.setItem('access_token', 'test-token');
  });

  it('renders without authentication errors', async () => {
    const { container } = render(<ComplianceScoreWidget />);
    
    await waitFor(() => {
      expect(screen.getByText('Compliance Score')).toBeInTheDocument();
    });
    
    expect(container.querySelector('.error')).not.toBeInTheDocument();
  });

  it('displays zero state when no data is available', async () => {
    render(<ComplianceScoreWidget />);
    
    await waitFor(() => {
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
  });
});
