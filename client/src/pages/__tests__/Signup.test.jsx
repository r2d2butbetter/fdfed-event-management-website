import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Signup from '../Signup';
import { MemoryRouter } from 'react-router-dom';

const mockSignup = vi.fn();
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    signup: mockSignup,
    loading: false
  })
}));

describe('Signup Component', () => {

  beforeEach(() => {
    mockSignup.mockClear();
  });

  const setup = () => {
    return render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );
  };

  it('renders signup form properly', () => {
    const { container } = setup();
    expect(container.querySelector('h4')).toBeInTheDocument(); // Because Typography uses component="h1" ? Wait! Signup uses h4. In Signup.jsx: <Typography variant="h4">... I'll just use container.querySelector('h4')
    expect(container.querySelector('input[name="name"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="email"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="password1"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="password2"]')).toBeInTheDocument();
    expect(container.querySelector('button[type="submit"]')).toBeInTheDocument();
  });

  it('displays API error messages properly', async () => {
    const { container } = setup();
    // Configure mock to send a fake "passwords don't match" error or similar validation from backend
    mockSignup.mockResolvedValueOnce({ success: false, message: 'Passwords do not match' });

    // Fill form
    fireEvent.change(container.querySelector('input[name="name"]'), { target: { name: 'name', value: 'John' } });
    fireEvent.change(container.querySelector('input[name="email"]'), { target: { name: 'email', value: 'john@test.com' } });
    fireEvent.change(container.querySelector('input[name="password1"]'), { target: { name: 'password1', value: 'pass123' } });
    fireEvent.change(container.querySelector('input[name="password2"]'), { target: { name: 'password2', value: 'wrongpass' } });

    // Submit
    fireEvent.click(container.querySelector('button[type="submit"]'));

    // Wait for the simulated backend error text
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('navigates softly off page on success', async () => {
    const { container } = setup();
    mockSignup.mockResolvedValueOnce({ success: true });

    fireEvent.change(container.querySelector('input[name="name"]'), { target: { name: 'name', value: 'John' } });
    fireEvent.change(container.querySelector('input[name="email"]'), { target: { name: 'email', value: 'john@test.com' } });
    fireEvent.change(container.querySelector('input[name="password1"]'), { target: { name: 'password1', value: 'password123' } });
    fireEvent.change(container.querySelector('input[name="password2"]'), { target: { name: 'password2', value: 'password123' } });

    fireEvent.click(container.querySelector('button[type="submit"]'));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        name: 'John',
        email: 'john@test.com',
        password1: 'password123',
        password2: 'password123'
      });
      // We check for the green success message
      expect(screen.getByText(/Account created! Please log in./i)).toBeInTheDocument();
    });
  });
});
