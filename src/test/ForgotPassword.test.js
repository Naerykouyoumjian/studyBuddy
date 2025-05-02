// src/__tests__/Login.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { BrowserRouter } from 'react-router-dom';

// mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn();
});

describe('Login Component', () => {
  test('renders form fields and button', () => {
    render(<BrowserRouter><Login onLogin={() => {}} /></BrowserRouter>);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('calls fetch with correct args on submit', async () => {
    // set up successful login response
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        user: { firstName: 'Test', lastName: 'User', email: 'test@example.com' }
      })
    });

    render(<BrowserRouter><Login onLogin={() => {}} /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        })
      );
    });
  });
});
