import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../Login';
import { MemoryRouter } from 'react-router-dom';

// We mock the AuthContext
const mockLogin = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin
  })
}));

describe('Login Component', () => {

  beforeEach(() => {
    mockLogin.mockClear();
  });

  const setup = () => {
    return render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
  };

  it('renders login form properly', () => {
    const { container } = setup();
    expect(container.querySelector('h1')).toBeInTheDocument();
    expect(container.querySelector('input[name="email"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="password"]')).toBeInTheDocument();
    expect(container.querySelector('button[type="submit"]')).toBeInTheDocument();
  });

  it('displays validation errors on empty submission', async () => {
    const { container } = setup();
    const submitBtn = container.querySelector('button[type="submit"]');    
    // Fire click (submits formik)
    fireEvent.click(submitBtn);

    // Wait for validation feedback
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    // Our mockLogin shouldn't have been called due to validation failing
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login function on valid submission', async () => {
    const { container } = setup();
    mockLogin.mockResolvedValueOnce({ success: true });

    // Fill inputs
    fireEvent.change(container.querySelector('input[name="email"]'), { target: { value: 'test@example.com' } });
    fireEvent.change(container.querySelector('input[name="password"]'), { target: { value: 'password123' } });

    // Click submit
    const submitBtn = container.querySelector('button[type="submit"]');
    fireEvent.click(submitBtn);

    // Verify it was called properly
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
    });
  });

  it('displays error message from backend if login fails', async () => {
    const { container } = setup();
    mockLogin.mockResolvedValueOnce({ success: false, message: 'Invalid credentials provided' });

    fireEvent.change(container.querySelector('input[name="email"]'), { target: { value: 'test@example.com' } });
    fireEvent.change(container.querySelector('input[name="password"]'), { target: { value: 'password123' } });

    fireEvent.click(container.querySelector('button[type="submit"]'));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials provided/i)).toBeInTheDocument();
    });
  });
});
