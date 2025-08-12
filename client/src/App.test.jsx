import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock AuthContext to avoid network calls and control auth state
const mockAuth = { isAuthenticated: false, user: null, loading: false, login: vi.fn(), clearError: vi.fn() };
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: () => mockAuth,
}));

// Simplify ProtectedRoute for tests
vi.mock('./components/ProtectedRoute', () => ({
  default: ({ children }) => <>{children}</>,
}));

// Mock API module
vi.mock('./lib/api', () => ({
  __esModule: true,
  default: { get: vi.fn() },
}));

import App from './App';
import api from './lib/api';
const mockApiGet = vi.mocked(api.get);

const product = { id: '1', name: 'Test Product', description: 'desc', pricePerDay: 10, images: [] };

beforeEach(() => {
  mockApiGet.mockReset();
  localStorage.clear();
});

describe('routing', () => {
  it('redirects / to /login', async () => {
    mockAuth.isAuthenticated = false;
    window.history.pushState({}, '', '/');
    render(<App />);
    await waitFor(() => expect(window.location.pathname).toBe('/login'));
  });

  it('redirects unknown route to /login', async () => {
    mockAuth.isAuthenticated = false;
    window.history.pushState({}, '', '/unknown');
    render(<App />);
    await waitFor(() => expect(window.location.pathname).toBe('/login'));
  });
});

describe('wishlist', () => {
  it('toggles wishlist in /products and reflects in /wishlist', async () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { role: 'customer' };
    mockApiGet.mockImplementation((url) => {
      if (url === '/products/categories') return Promise.resolve({ data: { categories: [] } });
      if (url === '/products/brands') return Promise.resolve({ data: { brands: [] } });
      if (url === '/rentals/active') return Promise.resolve({ data: { rental: null } });
      if (url.startsWith('/products?')) return Promise.resolve({ data: { items: [product], total: 1, hasNext: false, hasPrev: false } });
      return Promise.resolve({ data: {} });
    });

    window.history.pushState({}, '', '/products');
    const user = userEvent.setup();
    render(<App />);

    const heart = await screen.findByLabelText('Wishlist');
    await user.click(heart);
    expect(JSON.parse(localStorage.getItem('wishlist'))).toHaveLength(1);

    act(() => {
      window.history.pushState({}, '', '/wishlist');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(await screen.findByText('Test Product')).toBeInTheDocument();
    await user.click(screen.getByText('Remove'));
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
  });

  it('toggles wishlist in /products/:id', async () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { role: 'customer' };
    mockApiGet.mockImplementation((url) => {
      if (url === `/products/${product.id}`) return Promise.resolve({ data: { product } });
      if (url === '/rentals/active') return Promise.resolve({ data: { rental: null } });
      return Promise.resolve({ data: {} });
    });

    window.history.pushState({}, '', `/products/${product.id}`);
    const user = userEvent.setup();
    render(<App />);

    const heart = await screen.findByLabelText('Wishlist');
    await user.click(heart);
    expect(JSON.parse(localStorage.getItem('wishlist'))).toHaveLength(1);
    await user.click(heart);
    expect(JSON.parse(localStorage.getItem('wishlist'))).toHaveLength(0);
  });

  it('persists wishlist across reloads', async () => {
    mockAuth.isAuthenticated = true;
    mockAuth.user = { role: 'customer' };
    mockApiGet.mockImplementation((url) => {
      if (url === '/products/categories') return Promise.resolve({ data: { categories: [] } });
      if (url === '/products/brands') return Promise.resolve({ data: { brands: [] } });
      if (url === '/rentals/active') return Promise.resolve({ data: { rental: null } });
      if (url.startsWith('/products?')) return Promise.resolve({ data: { items: [product], total: 1, hasNext: false, hasPrev: false } });
      return Promise.resolve({ data: {} });
    });

    window.history.pushState({}, '', '/products');
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    const heart = await screen.findByLabelText('Wishlist');
    await user.click(heart);
    expect(JSON.parse(localStorage.getItem('wishlist'))).toHaveLength(1);
    unmount();

    window.history.pushState({}, '', '/wishlist');
    render(<App />);
    expect(await screen.findAllByText('Test Product')).not.toHaveLength(0);
  });
});
