import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Landing from './pages/Landing';

// Mock Clerk components and hooks
vi.mock('@clerk/clerk-react', () => ({
  SignedIn: ({ children }) => <>{children}</>,
  SignedOut: ({ children }) => <>{children}</>,
  UserButton: () => <div>User</div>
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;

describe('Landing Page', () => {
  it('renders the main heading', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );
    
    // Check if the main pitch is in the document
    const heading = screen.getByText(/Master the art of/i);
    expect(heading).toBeInTheDocument();
  });
});
