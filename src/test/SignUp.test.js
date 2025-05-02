// src/__tests__/SignUp.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from '../SignUp';
import { BrowserRouter } from 'react-router-dom';

beforeEach(() => {
  global.fetch = jest.fn();
});

describe('SignUp Component', () => {
  test('renders sign-up form fields', () => {
    render(<BrowserRouter><SignUp /></BrowserRouter>);
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  });

  test('shows error if passwords do not match', () => {
    render(<BrowserRouter><SignUp /></BrowserRouter>);
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'def' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));
    // Since SignUp uses setErrorMsg, you could assert on screen or console
    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  test('submits correct data to backend', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, message: 'User registered successfully' })
    });

    render(<BrowserRouter><SignUp /></BrowserRouter>);
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Xin' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Zheng' } });
    fireEvent.change(screen.getByLabelText(/^Email$/i), { target: { value: 'xin@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/signup',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-type': 'application/json' }
        })
      );
    });
  });
});
