import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, test, expect } from 'vitest';
import React from 'react';
import AdminDashboard from './page.jsx';

// Mock API to avoid network requests
vi.mock('../../../lib/api', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: { users: [] } }) },
}));

// Mock useNavigate
const navigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
}));

test('quick action buttons navigate to correct routes', async () => {
  render(<AdminDashboard />);

  const addProductButton = await screen.findByText('Add New Product');
  await userEvent.click(addProductButton);
  expect(navigate).toHaveBeenNthCalledWith(1, '/admin/products/new');

  const viewOrdersButton = screen.getByText('View All Orders');
  await userEvent.click(viewOrdersButton);
  expect(navigate).toHaveBeenNthCalledWith(2, '/admin/orders');

  const manageUsersButton = screen.getByText('Manage Users');
  await userEvent.click(manageUsersButton);
  expect(navigate).toHaveBeenNthCalledWith(3, '/admin/users');
});
